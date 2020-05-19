const chai = require('chai');

const cdk = require('@aws-cdk/core');
const cdkAssert = require('@aws-cdk/assert');
const Networking = require('../lib/networking');
const Parameters = require('../lib/parameters');
const Database = require('../lib/database');
const config = require('../lib/config');

describe('database tests', () => {
  it('should construct a configurable Aurora Serverless Postgres DB', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack');
    const parameters = new Parameters(stack, 'TestParameters', config);
    const networking = new Networking(stack, 'TestNetworking', { parameters });
    const construct = new Database(stack, 'TestConstruct', {
      parameters,
      networking,
    });
    chai.assert.isString(construct.host);
    chai.assert.isString(construct.port);
    cdkAssert
      .expect(stack)
      .to(cdkAssert.haveResource('AWS::RDS::DBSubnetGroup'));
    cdkAssert.expect(stack).to(
      cdkAssert.haveResource('AWS::RDS::DBCluster', {
        Engine: 'aurora-postgresql',
        BackupRetentionPeriod: 1,
        DatabaseName: 'drone',
        DBClusterIdentifier: 'drone-ci-db',
        DeletionProtection: false,
        EngineMode: 'serverless',
        EngineVersion: '10.7',
        MasterUsername: {
          Ref: 'TestParametersDatabaseUsernameCC652EA3',
        },
        MasterUserPassword: {
          Ref: 'TestParametersDatabasePassword434B5AF6',
        },
        Port: 5432,
        ScalingConfiguration: {
          AutoPause: true,
          SecondsUntilAutoPause: 1800,
        },
        StorageEncrypted: true,
      })
    );
  });
});
