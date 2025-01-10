const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocument,
  PutCommand
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocument.from(client);

exports.handler = async (event, context) => {
    const tableName = process.env.target_table;
    const record = event.Records?.[0];
    let item;

    if (record?.eventName === 'INSERT') {
        const newData = record.dynamodb?.NewImage;
        
        item = {
            "id": context?.awsRequestId,
            "itemKey": newData.key.S,
            "modificationTime": new Date().toISOString(),
            "newValue": {
                "key": newData.key.S,
                "value": +newData.value.N
            },
         } 
    }
    if (record?.eventName === 'MODIFY') {
        const newData = record.dynamodb?.NewImage;
        const oldData = record.dynamodb?.OldImage;

        item = {
            "id": context?.awsRequestId,
            "itemKey": newData.key.S,
            "modificationTime": new Date().toISOString(),
            "updatedAttribute": "value",
            "oldValue": +oldData.value.N,
            "newValue": +newData.value.N
         } 
    }
    await dynamo.put(
        {
            TableName: tableName,
            Item: item,
        }
    );
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
