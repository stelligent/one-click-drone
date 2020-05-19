'use strict';

const cdk = require('@aws-cdk/core');
const ec2 = require('@aws-cdk/aws-ec2');
const ecs = require('@aws-cdk/aws-ecs');

class Networking extends cdk.Construct {
  /**
   * Manages an ECS cluster inside a VPC for the Drone CI deployment
   * Consumes the following parameters:
   * - RunnerInstanceType
   * - RunnerMaxCapacity
   * - RunnerSshKey
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {{parameters:Parameters}} props
   */
  constructor(scope, id, props) {
    super(scope, id);

    const vpc = new ec2.Vpc(this, 'VPC', { maxAzs: 1 });
    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: vpc,
      capacity: {
        instanceType: new ec2.InstanceType(
          props.parameters['Param:RunnerInstanceType'].valueAsString
        ),
        vpcSubnets: vpc.selectSubnets({
          subnetType: ec2.SubnetType.PUBLIC,
        }),
        associatePublicIpAddress: true,
        maxCapacity: props.parameters['Param:RunnerMaxCapacity'].valueAsNumber,
        keyName: cdk.Fn.conditionIf(
          new cdk.CfnCondition(this, 'KeyCondition', {
            expression: cdk.Fn.conditionEquals(
              props.parameters['Param:RunnerSshKey'],
              ''
            ),
          }).logicalId,
          'AWS::NoValue',
          props.parameters['Param:RunnerSshKey']
        ),
      },
    });

    this._cluster = cluster;
  }

  get cluster() {
    return this._cluster;
  }

  get vpc() {
    return this._cluster.vpc;
  }
}

module.exports = Networking;
