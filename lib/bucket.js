'use strict';

const s3 = require('@aws-cdk/aws-s3');
const cdk = require('@aws-cdk/core');
const iam = require('@aws-cdk/aws-iam');

class Bucket extends cdk.Construct {
  /**
   * Creates a private S3 bucket with an associated IAM user having access to it.
   * This is used by Drone Server agents to store build logs
   * @param {cdk.Construct} scope
   * @param {string} id
   */
  constructor(scope, id) {
    super(scope, id);

    const bucket = new s3.Bucket(this, 'Bucket', {
      versioned: false,
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      encryption: s3.BucketEncryption.KMS_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // IAM user used by Drone (does not support IAM roles yet)
    const bucketUser = new iam.User(this, 'DroneBucketUser');
    bucket.grantReadWrite(bucketUser.grantPrincipal);

    // Create a set of credentials for Drone (does not support IAM roles yet)
    const bucketCredentials = new iam.CfnAccessKey(
      this,
      'LogsBucketCredentials',
      {
        userName: bucketUser.userName,
      }
    );

    this._bucket = bucket;
    this._iamAccessKey = bucketCredentials.ref;
    this._iamSecretKey = bucketCredentials.attrSecretAccessKey;
  }

  get bucketName() {
    return this._bucket.bucketName;
  }

  get accessKey() {
    return this._iamAccessKey;
  }

  get secretKey() {
    return this._iamSecretKey;
  }
}

module.exports = Bucket;
