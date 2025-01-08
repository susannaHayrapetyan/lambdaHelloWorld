exports.handler = async (event) => {
    console.log('SNS_EVENT', JSON.stringify(event));
    
    event?.Records?.forEach(record => {
        console.log('SNS_EVENT_record', record?.Sns?.[0]);
    });

    // TODO implement
    const response = {
        statusCode: 200,
        body: 'Hello from Lambda!',
    };
    return response;
};
