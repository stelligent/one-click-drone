'use strict';

const cdk = require('@aws-cdk/core');
const rds = require('@aws-cdk/aws-rds');
const ec2 = require('@aws-cdk/aws-ec2');

class Database extends cdk.Construct {
  /**
   * Manages a database to be used by Drone Server agents
   *
   * Database engine is Serverless Aurora - PostgreSQL. Postgres is chosen from
   * (https://docs.drone.io/installation/storage/database/) Serverless is chosen
   * since in most CI workloads don't need the database up all the time.
   *
   * Note: at the time of writing this, Serverless Aurora is not supported by
   * CDK natively. This construct is put together by mostly looking at Former2
   * exports and https://github.com/aws/aws-cdk/issues/929
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {{networking:Networking=, parameters:Parameters=}} props
   */
  constructor(scope, id, props) {
    super(scope, id);

    const dbSubnetGroup = new rds.CfnDBSubnetGroup(this, 'DBSubnetGroup', {
      dbSubnetGroupDescription: 'Drone CI database cluster subnet group',
      subnetIds: props.networking.vpc.privateSubnets.map(
        (subnet) => subnet.subnetId
      ),
    });

    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DBSecurityGroup', {
      vpc: props.networking.vpc,
      allowAllOutbound: true,
    });

    const db = new rds.CfnDBCluster(this, 'DBCluster', {
      databaseName: 'drone',
      dbClusterIdentifier: 'drone-ci-db',
      dbSubnetGroupName: dbSubnetGroup.ref,
      vpcSecurityGroupIds: [dbSecurityGroup.securityGroupId],
      engineMode: 'serverless',
      engine: 'aurora-postgresql',
      engineVersion: '10.7', // minimum postgre-sql compatible version
      masterUsername: props.parameters['Param:DatabaseUsername'],
      masterUserPassword: props.parameters['Param:DatabasePassword'],
      storageEncrypted: true,
      backupRetentionPeriod: 1,
      deletionProtection: false,
      port: 5432, // Postgres' default port
      scalingConfiguration: {
        secondsUntilAutoPause: 1800, // half an hour of inactivity
        autoPause: true,
      },
    });

    dbSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(db.port));
    dbSecurityGroup.addIngressRule(ec2.Peer.anyIpv6(), ec2.Port.tcp(db.port));

    this._db = db;
  }

  get host() {
    return this._db.attrEndpointAddress;
  }

  get port() {
    return this._db.attrEndpointPort;
  }
}

module.exports = Database;
