import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as apprunner from 'aws-cdk-lib/aws-apprunner';
import { Construct } from 'constructs';

export interface NetworkConstructProps {
  /**
   * CIDR block for the VPC
   * @default '10.0.0.0/16'
   */
  vpcCidr?: string;

  /**
   * Number of availability zones to use
   * @default 2
   */
  maxAzs?: number;
}

export class NetworkConstruct extends Construct {
  public readonly vpc: ec2.Vpc;
  public readonly databaseSubnetGroup: rds.SubnetGroup;
  public readonly appRunnerVpcConnector: apprunner.CfnVpcConnector;
  public readonly databaseSecurityGroup: ec2.SecurityGroup;
  public readonly appRunnerSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: NetworkConstructProps = {}) {
    super(scope, id);

    const { vpcCidr = '10.0.0.0/16', maxAzs = 2 } = props;

    // Create VPC with public and private subnets
    this.vpc = new ec2.Vpc(this, 'Vpc', {
      ipAddresses: ec2.IpAddresses.cidr(vpcCidr),
      maxAzs,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
        {
          name: 'isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
    });

    // Create database subnet group
    this.databaseSubnetGroup = new rds.SubnetGroup(this, 'DatabaseSubnetGroup', {
      vpc: this.vpc,
      description: 'Subnet group for DocumentDB database',
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
    });

    // Security Group for DocumentDB Database
    this.databaseSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for DocumentDB (MongoDB-compatible) database',
      allowAllOutbound: false,
    });

    // Security Group for App Runner
    this.appRunnerSecurityGroup = new ec2.SecurityGroup(this, 'AppRunnerSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for App Runner service',
      allowAllOutbound: true,
    });

    // Allow App Runner to connect to DocumentDB on MongoDB port
    this.databaseSecurityGroup.addIngressRule(
      this.appRunnerSecurityGroup,
      ec2.Port.tcp(27017),
      'Allow App Runner to access DocumentDB (MongoDB)'
    );

    // Create VPC Connector for App Runner
    this.appRunnerVpcConnector = new apprunner.CfnVpcConnector(this, 'AppRunnerVpcConnector', {
      subnets: this.vpc.selectSubnets({
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      }).subnetIds,
      securityGroups: [this.appRunnerSecurityGroup.securityGroupId],
    });

    // Add tags
    cdk.Tags.of(this.vpc).add('Name', 'AssessmentPlatform-VPC');
    cdk.Tags.of(this.databaseSubnetGroup).add('Name', 'AssessmentPlatform-DB-SubnetGroup');
  }
}
