const https = require('https')
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocument.from(client, {
    marshallOptions: {
        removeUndefinedValues: true,
    }
});

class OpenMeteoApi {
    params;
    defaultParams = {
        latitude: [0],
        longitude: [0],
        current: '',
        hourly: ''
    };

    constructor(userDefinedParams) {
        this.params = { ...this.defaultParams, ...userDefinedParams };
    }

    fetchWeatherData() {
        return new Promise((resolve, reject) => {
            const queryParams = new URLSearchParams(this.params);

            https
            .get(`https://api.open-meteo.com/v1/forecast?${queryParams.toString()}`, responce => {
                let data = ''

                responce.on('data', chunk => {
                    data += chunk
                })
                responce.on('end', () => {
                    resolve(JSON.parse(data));
                })
            })
            .on('error', error => {
                reject(error)
            })
        })
    }
}

exports.handler = async (event, context) => {
    const tableName = process.env.target_table;

    // Fetch data from API
    const openApi = new OpenMeteoApi();
    const forecastResult = await openApi.fetchWeatherData({
        latitude: [52.52],
        longitude: [13.41],
        current: 'temperature_2m,wind_speed_10m',
        hourly: 'temperature_2m,relative_humidity_2m,wind_speed_10m',
    });

    // Save in DynamoDB
    const item = {
        "id": context?.awsRequestId,
        "forecast": {
            "latitude": forecastResult.latitude || 0,
            "longitude": forecastResult.longitude || 0,
            "timezone": forecastResult.timezone || '',
            "elevation": forecastResult.elevation || 0,
            "timezone_abbreviation": forecastResult.timezone_abbreviation || '',
            "utc_offset_seconds": forecastResult.utc_offset_seconds || 0,
            "generationtime_ms": forecastResult.generationtime_ms || 0,
            "hourly": {
                "time": forecastResult.hourly.time || [],
                "temperature_2m": forecastResult.hourly.temperature_2m || [],
            },
            "hourly_units": {
                "time": forecastResult.hourly_units.time || '',
                "temperature_2m": forecastResult.hourly_units.temperature_2m || '',
            },
        }
    }
    console.log('ITEMMM--->>>', JSON.stringify(item));
    await dynamo.put(
        {
            TableName: tableName,
            Item: item,
        }
    );

    const response = {
        statusCode: 200,
        body: JSON.stringify(item),
    };
    return response;    
};

