exports.handler = async (event) => {
    console.log('SNS_EVENT', event);
    // TODO implement
    const response = {
        statusCode: 200,
        body: 'Hello from Lambda!',
    };
    return response;
};
