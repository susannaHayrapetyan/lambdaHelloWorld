const { randomUUID } = require('crypto');
const {
    AdminCreateUserCommand,
    AdminInitiateAuthCommand,
    AdminSetUserPasswordCommand,
    CognitoIdentityProviderClient,
} = require("@aws-sdk/client-cognito-identity-provider");
const {
    DynamoDBClient,
    PutItemCommand
} = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");

const cognitoClient = new CognitoIdentityProviderClient({});
const dynamoClient = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(dynamoClient, {});

async function signup(userPoolId, data) {
    const input = {
        UserPoolId: userPoolId,
        Username: data.email,
        UserAttributes: [
            {
                Name: 'custom:firstName',
                Value: data.firstName,
            },
            {
                Name: 'custom:lastName',
                Value: data.lastName,
            },
        ],
        TemporaryPassword: data.password,
    };
    const command = new AdminCreateUserCommand(input);

    await cognitoClient.send(command);

    // Set permanent password
    const inputPassword = {
        UserPoolId: userPoolId,
        Username: data.email,
        Password: data.password,
        Permanent: true,
      };
    const commandPassword = new AdminSetUserPasswordCommand(inputPassword);
    await cognitoClient.send(commandPassword);

    return {};
}

async function signin(userPoolId, userPoolClientId, data) {
    const input = {
        UserPoolId: userPoolId,
        ClientId: userPoolClientId,
        AuthFlow: "ADMIN_NO_SRP_AUTH",
        AuthParameters: {
            USERNAME: data.email,
            PASSWORD: data.password,
        },
    };
    const command = new AdminInitiateAuthCommand(input);
    const result = await cognitoClient.send(command);

    return {
        "accessToken": result.AuthenticationResult.IdToken,
    };
}

async function getTables(tableName) {
    const command = new ScanCommand({
        TableName: tableName,
    });
    const response = await dynamo.send(command);

    return response.Items;
}

async function getTable(tableName, tableId) {
    const command = new QueryCommand({
        TableName: tableName,
        KeyConditionExpression:
            "id = :id",
        ExpressionAttributeValues: {
            ":id": parseInt(tableId),
        },
    });
    
    const response = await dynamo.send(command);

    return {
        ...(response.Items?.[0]),
    };
}

async function addTable(tableName, tableData) {
    // Create DynamoDB item
    const item = {
        'id': {'N': tableData.id.toString()},
        'number': {'N': tableData.number.toString()},
        'places': {'N': tableData.places.toString()},
        'isVip': {'BOOL': tableData.isVip},
        'minOrder': {'N': tableData.minOrder.toString()}
    };

    const putItemCommand = new PutItemCommand({
        TableName: tableName,
        Item: item,
    });
    const response = await dynamo.send(putItemCommand);

    return {
        id: tableData.id
    };
}

async function addReservation(reservationsTableName, tableName, tableData) {
    // Create DynamoDB item
    const id = randomUUID();
    const item = {
        'id': {'S': id},
        'tableNumber': {'N': tableData.tableNumber.toString()},
        'clientName': {'S': tableData.clientName},
        'phoneNumber': {'S': tableData.phoneNumber},
        'date': {'S': tableData.date},
        'slotTimeEnd': {'S': tableData.slotTimeEnd},
        'slotTimeStart': {'S': tableData.slotTimeStart},
    };

    // Check table exists
    const tableCommand = new ScanCommand({
        TableName: tableName,
        FilterExpression: `#number = :tabnum`,
        ExpressionAttributeNames: {
            '#number': 'number',
        },
        ExpressionAttributeValues: {
            ":tabnum": parseInt(tableData.tableNumber),
        }
    });
    const tableResult = await dynamo.send(tableCommand);
    if (!tableResult?.Items?.length) {
        throw new Error('Table not found!');
    }

    // Validate overlap
    const scanCommand = new ScanCommand({
        TableName: reservationsTableName,
        FilterExpression: `#table = :tableNum AND ((#end >= :timeEnd and #start <= :timeEnd) OR 
            (#end >= :timeStart and #start <= :timeStart) OR 
            (#start >= :timeStart and #end <= :timeEnd))`,
        ExpressionAttributeNames: {
            '#start': 'slotTimeStart',
            '#end': 'slotTimeEnd',
            '#table': 'tableNumber',
        },
        ExpressionAttributeValues: {
            ":timeEnd": tableData.slotTimeEnd,
            ":timeStart": tableData.slotTimeStart,
            ":tableNum": parseInt(tableData.tableNumber),
        }
    });
    const scanResult = await dynamo.send(scanCommand);
    if (scanResult?.Items?.length) {
        throw new Error('Overlap exists between reservations!');
    }

    const putItemCommand = new PutItemCommand({
        TableName: reservationsTableName,
        Item: item,
    });
    await dynamo.send(putItemCommand);

    return {
        reservationId: id,
    };
}


exports.handler = async (event, context) => {
    const requestBody = JSON.parse(event.body);
    const tableName = process.env.tables_table;
    const reservationsTableName = process.env.reservations_table;
    const userPoolId = process.env.cup_id;
    const userPoolClientId = process.env.cup_client_id;
    let statusCode = 404;
    let body = 'Route Not Found';
    
    console.log(process.env, 'EVENT----', event, '[[[', context);
    try {
        if (event.resource === '/signup' && event.httpMethod === 'POST') {
            statusCode = 200;
            body = await signup(userPoolId, requestBody);
        }
        if (event.resource === '/signin' && event.httpMethod === 'POST') {
            statusCode = 200;
            body = await signin(userPoolId, userPoolClientId, requestBody);
        }
        if (event.resource === '/reservations' && event.httpMethod === 'GET') {
            statusCode = 200;
            const reservations = await getTables(reservationsTableName);
            body = {
                reservations: reservations.map(({ id, ...keepAttrs }) => keepAttrs),
            }
        }
        if (event.resource === '/reservations' && event.httpMethod === 'POST') {
            statusCode = 200;
            body = await addReservation(reservationsTableName, tableName, requestBody);
        }
        if (event.resource === '/tables' && event.httpMethod === 'GET') {
            statusCode = 200;
            const tables = await getTables(tableName);
            body = {
                tables,
            }
        }
        if (event.resource === '/tables' && event.httpMethod === 'POST') {
            statusCode = 200;
            body = await addTable(tableName, requestBody);
        }
        if (event.resource === '/tables/{tableId}' && event.httpMethod === 'GET') {
            const tableId = event.pathParameters.tableId

            statusCode = 200;
            body = await getTable(tableName, tableId);
        }
    } catch (e) {
        console.log('ERRORRRR----', e);
        statusCode = 400;
        body = `Error: ${e}`;
    }
    
    console.log('RESULT2----', body);

    const response = {
        statusCode,
        body: JSON.stringify(body),
    };
    return response;
};
