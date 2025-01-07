exports.handler = async (event) => {
    console.log('SQS_EVENT', event);
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
