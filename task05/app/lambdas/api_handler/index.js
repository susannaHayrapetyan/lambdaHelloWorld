const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocument,
  PutCommand
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocument.from(client);

exports.handler = async (event, context, a) => {
    let body;
    let statusCode = 201;
    const tableName = process.env.target_table;
    
    console.log(process.env.target_table, JSON.stringify(context), 'EVENTTT2', JSON.stringify(event), a);
    
    const item = {
        id: context?.awsRequestId,
        createdAt: new Date().toISOString(),
        principalId: event.principalId,
        body: event.content,
    };
    await dynamo.put(
        {
            TableName: tableName,
            Item: item,
        }
    );
    body = item;
    console.log('Putitem', JSON.stringify(item));
    
    return {
        statusCode,
        event: body,
    };
};