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
    
    return {
        statusCode,
        event: body,
    };
};