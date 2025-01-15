
exports.handler = async (event) => {
    console.log('--OpenMeteoApievent--', event);
    const OpenMeteoApi = require('OpenMeteoApi');
    console.log(OpenMeteoApi, '--OpenMeteoApi--');
    const openApi = new OpenMeteoApi();
    const results = await openApi.fetchWeatherData({
        latitude: [52.52],
        longitude: [13.41],
        current: 'temperature_2m,wind_speed_10m',
        hourly: 'temperature_2m,relative_humidity_2m,wind_speed_10m',
    });
    console.log('RESULTSSS--->>', results);
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
