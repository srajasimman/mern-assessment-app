import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NetworkConstruct } from './constructs/network-construct';
import { DatabaseConstruct } from './constructs/database-construct';
import { BackendConstruct } from './constructs/backend-construct';
import { FrontendConstruct } from './constructs/frontend-construct';

export interface AssessmentPlatformStackProps extends cdk.StackProps {
  /**
   * Domain name for the frontend (optional)
   */
  domainName?: string;

  /**
   * Hosted zone ID for Route53 (required if domainName is provided)
   */
  hostedZoneId?: string;

  /**
   * Environment name (development, staging, production)
   * @default 'development'
   */
  environmentName?: string;
}

export class AssessmentPlatformStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AssessmentPlatformStackProps = {}) {
    super(scope, id, props);

    const { domainName, hostedZoneId, environmentName = 'development' } = props;

    // Create networking infrastructure
    const network = new NetworkConstruct(this, 'Network', {
      vpcCidr: '10.0.0.0/16',
      maxAzs: 2,
    });

    // Create database infrastructure
    const database = new DatabaseConstruct(this, 'Database', {
      vpc: network.vpc,
      subnetGroup: network.databaseSubnetGroup,
      securityGroup: network.databaseSecurityGroup,
      instanceClass: environmentName === 'production' ? cdk.aws_ec2.InstanceClass.T3 : cdk.aws_ec2.InstanceClass.T3,
      instanceSize: environmentName === 'production' ? cdk.aws_ec2.InstanceSize.SMALL : cdk.aws_ec2.InstanceSize.MICRO,
      databaseName: 'assessment_platform',
      deletionProtection: environmentName === 'production',
      backupRetentionDays: environmentName === 'production' ? 30 : 7,
    });

    // Create backend infrastructure (App Runner)
    const backend = new BackendConstruct(this, 'Backend', {
      vpcConnector: network.appRunnerVpcConnector,
      databaseEndpoint: database.cluster.clusterEndpoint.hostname,
      databasePort: database.cluster.clusterEndpoint.port.toString(),
      databaseName: 'assessment_platform',
      databaseCredentialsSecretArn: database.credentials.secretArn,
      cpu: environmentName === 'production' ? '1 vCPU' : '0.25 vCPU',
      memory: environmentName === 'production' ? '2 GB' : '0.5 GB',
      environmentVariables: {
        NODE_ENV: environmentName === 'production' ? 'production' : 'development',
        LOG_LEVEL: environmentName === 'production' ? 'info' : 'debug',
      },
    });

    // Create frontend infrastructure (S3 + CloudFront)
    const frontend = new FrontendConstruct(this, 'Frontend', {
      domainName,
      hostedZoneId,
      apiEndpoint: `https://${backend.service.attrServiceUrl}`,
    });

    // Add stack-level outputs
    new cdk.CfnOutput(this, 'StackName', {
      description: 'Name of the CloudFormation stack',
      value: this.stackName,
    });

    new cdk.CfnOutput(this, 'Region', {
      description: 'AWS region where resources are deployed',
      value: this.region,
    });

    new cdk.CfnOutput(this, 'Environment', {
      description: 'Environment name',
      value: environmentName,
    });

    new cdk.CfnOutput(this, 'VpcId', {
      description: 'VPC ID',
      value: network.vpc.vpcId,
    });

    // Add comprehensive tags
    const commonTags = {
      Project: 'MERN-Assessment-Platform',
      Environment: environmentName,
      ManagedBy: 'AWS-CDK',
      Owner: 'srajasimman',
      CostCenter: 'Development',
      Stack: this.stackName,
    };

    Object.entries(commonTags).forEach(([key, value]) => {
      cdk.Tags.of(this).add(key, value);
    });
  }
}
