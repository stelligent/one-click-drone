const chai = require('chai');

const cdk = require('@aws-cdk/core');
const cdkAssert = require('@aws-cdk/assert');
const Networking = require('../lib/networking');
const Parameters = require('../lib/parameters');
const config = require('../lib/config');

describe('networking tests', () => {
  it('should construct a configurable cluster and its vpc', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack');
    const construct = new Networking(stack, 'TestConstruct', {
      parameters: new Parameters(stack, 'TestParameters', config),
    });
    chai.assert.isObject(construct.vpc);
    chai.assert.isObject(construct.cluster);
    cdkAssert.expect(stack).to(cdkAssert.haveResource('AWS::EC2::VPC'));
    cdkAssert.expect(stack).to(cdkAssert.haveResource('AWS::ECS::Cluster'));
    cdkAssert
      .expect(stack)
      .to(cdkAssert.haveResource('AWS::AutoScaling::AutoScalingGroup'), {
        MaxSize: { Ref: 'TestParametersRunnerMaxCapacity74E241BA' },
      });
    cdkAssert
      .expect(stack)
      .to(cdkAssert.haveResource('AWS::AutoScaling::LaunchConfiguration'), {
        InstanceType: {
          Ref: 'TestParametersRunnerInstanceType4B247EFB',
        },
        KeyName: {
          'Fn::If': [
            'TestConstructKeyConditionE628360C',
            'AWS::NoValue',
            {
              Ref: 'TestParametersRunnerSshKeyE469E0A3',
            },
          ],
        },
      });
  });
});
