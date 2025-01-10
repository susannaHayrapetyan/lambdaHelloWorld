const { randomUUID } = require('crypto');
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

exports.handler = async () => {
    const bucketName = process.env.target_bucket;
    const s3Client = new S3Client({});
    const fileName = new Date().toISOString();
    const fileContent = JSON.stringify({
        "ids": new Array(10).fill(0).map(() => randomUUID()),
    })
    const s3Params = {
        Bucket: bucketName,
        Key: fileName,
        Body: fileContent
    };

    const parallelUploads3 = new Upload({
        client: s3Client,
        params: s3Params,
    });
    
    parallelUploads3.on("httpUploadProgress", (progress) => {
        console.log('PROGRESSS', progress);
    });
    
    await parallelUploads3.done();

    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
