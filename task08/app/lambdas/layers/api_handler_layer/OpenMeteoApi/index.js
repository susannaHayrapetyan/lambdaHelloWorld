const https = require('https')

class OpenMeteoApi {
    params;
    defaultParams = {
        latitude: [0],
        longitude: [0],
        current: '',
        hourly: ''
    };

    constructor(userDefinedParams) {
        this.params = {...this.defaultParams, ...userDefinedParams};
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

module.exports = OpenMeteoApi;