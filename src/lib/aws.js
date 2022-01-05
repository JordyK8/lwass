const AWS = require('aws-sdk');
require('dotenv').config();

class Aws {
  constructor() {
    this.client = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_ACCESS_SECRET,
      endpoint: process.env.AWS_ENDPOINT,
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    });
  }

  /**
   * Returns aws file data
   * @param {string} bucketName The aws bucket name
   * @param {string} fileName   The file name
   * @return {Promise<*>}
   */
  getObject(bucketName, fileName) {
    return this.client.getObject({
      Bucket: bucketName,
      Key: fileName,
    }).promise();
  }

  /**
   * Returns uploaded file ID
   * @param {string}                bucketName  The aws bucket name
   * @param {Object|Stream|Buffer}  body        The file body
   * @param {string}                fileName    The file name
   * @return {Promise<*>}
   */
  putObject(bucketName, body, fileName) {
    return this.client.putObject({
      Bucket: bucketName,
      Body: body,
      Key: fileName,
    }).promise();
  }
}
module.exports = Aws;
