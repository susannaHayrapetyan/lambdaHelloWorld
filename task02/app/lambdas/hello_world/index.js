exports.handler = async (event, context) => {
    const request = event.requestContext ? event.requestContext.http : {};
    if (request.path === '/hello') {
        return {
            statusCode: 200,
            body: {
                message: 'Hello from Lambda',
            },
        };
    } else {
        // Handle unexpected resource paths
        return {
            statusCode: 400,
            body: {
                message: `Bad request syntax or unsupported method. Request path: ${request.path}. HTTP method: ${request.method}`,
            },
        };
    }
};
