const chai = require('chai');

const cdk = require('@aws-cdk/core');
const cdkAssert = require('@aws-cdk/assert');
const Bucket = require('../lib/bucket');

describe('log bucket tests', () => {
  it('should construct a bucket used to store Drone logs', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack');
    const construct = new Bucket(stack, 'TestConstruct');
    chai.assert.isString(construct.bucketName);
    chai.assert.isString(construct.accessKey);
    chai.assert.isString(construct.secretKey);
    cdkAssert.expect(stack).to(cdkAssert.haveResource('AWS::IAM::User'));
    cdkAssert.expect(stack).to(cdkAssert.haveResource('AWS::IAM::Policy'));
    cdkAssert.expect(stack).to(
      cdkAssert.haveResource('AWS::S3::Bucket', {
        BucketEncryption: {
          ServerSideEncryptionConfiguration: [
            {
              ServerSideEncryptionByDefault: {
                SSEAlgorithm: 'aws:kms',
              },
            },
          ],
        },
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
      })
    );
  });
});
