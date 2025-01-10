exports.handler = async (event) => {
    console.log('SQS_EVENT', event);
    /*
    EX SQS:  {
  Records: [
    {
      messageId: '4013ffd2-0d4b-4c13-bb8a-8a1f8779ec0c',
      receiptHandle: 'AQEB8jnLsMTJa0EKnikUS76uAjz4mdv+jNMy2rW35oiX1bYOovnWZZDAUxq8dLZpXd1DjCAy/9as7zjk19fLp1r+XAz1VwLdAS2YELMM0BsFm56xroEAeaLu8WvxgyElnTwSHGXi3yqJ9pL7arwMuVMs6NPHirORF/KAefRTKS9GIMUPVtVQv52MN9ho2H7TmC07I/5tc9iGHdv2Gl3Koj7KoDJIi55s7rp7mO1YuU0NXp/Lba1QwE8k8737Ixfkwfc/jY2iq1QyEAHelPRX9yFFlCT09r3+i4eU26GsmE6ykA/9TsIF8DHTNt5hH+SPTOBGR24kYHj7bS6/Jn5gJLq1c/SYFcJPmIN4RjjjpViwqgY7NxN/UU6poVVDRHV8Rr6Zufha1UMBolHQl3NAHoLavkxqTOOp+j1yR6muHv2nyew=',
      body: 'test message',
      attributes: [Object],
      messageAttributes: {},
      md5OfBody: 'c72b9698fa1927e1dd12d3cf26ed84b2',
      eventSource: 'aws:sqs',
      eventSourceARN: 'arn:aws:sqs:eu-central-1:905418349556:cmtr-498516b0-async_queue',
      awsRegion: 'eu-central-1'
    }
  ]
}

EXAMPLE SNS: 
     {
  Records: [
    {
      EventSource: 'aws:sns',
      EventVersion: '1.0',
      EventSubscriptionArn: 'arn:aws:sns:eu-central-1:905418349556:cmtr-498516b0-lambda_topic:d1cd5ab8-16df-43b0-a499-4d6d8f26f12f',
      Sns: [Object]
    }
  ]
}

    */
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
