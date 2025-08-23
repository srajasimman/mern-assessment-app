import * as cdk from 'aws-cdk-lib';
import * as docdb from 'aws-cdk-lib/aws-docdb';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface DatabaseConstructProps {
  vpc: ec2.Vpc;
  subnetGroup: rds.SubnetGroup;
  securityGroup: ec2.SecurityGroup;

  /**
   * Database instance class
   * @default db.t3.micro
   */
  instanceClass?: ec2.InstanceClass;

  /**
   * Database instance size
   * @default MEDIUM
   */
  instanceSize?: ec2.InstanceSize;

  /**
   * Database name
   * @default assessment_platform
   */
  databaseName?: string;

  /**
   * Whether to enable deletion protection
   * @default false for development
   */
  deletionProtection?: boolean;

  /**
   * Backup retention period in days
   * @default 7
   */
  backupRetentionDays?: number;
}

export class DatabaseConstruct extends Construct {
  public readonly cluster: docdb.DatabaseCluster;
  public readonly credentials: secretsmanager.Secret;
  public readonly connectionString: string;

  constructor(scope: Construct, id: string, props: DatabaseConstructProps) {
    super(scope, id);

    const {
      vpc,
      subnetGroup,
      securityGroup,
      instanceClass = ec2.InstanceClass.T3,
      instanceSize = ec2.InstanceSize.MEDIUM,
      databaseName = 'assessment_platform',
      deletionProtection = false,
      backupRetentionDays = 7,
    } = props;

    // Create database credentials secret
    this.credentials = new secretsmanager.Secret(this, 'DatabaseCredentials', {
      description: 'Credentials for Assessment Platform MongoDB database',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'docdbadmin' }),
        generateStringKey: 'password',
        excludeCharacters: '"@/\\:',
        passwordLength: 32,
      },
    });

    // Create parameter group for DocumentDB optimization
    const parameterGroup = new docdb.ClusterParameterGroup(this, 'DocumentDBParameterGroup', {
      family: 'docdb5.0',
      description: 'Parameter group for Assessment Platform DocumentDB',
      parameters: {
        audit_logs: 'enabled',
        profiler: 'enabled',
        profiler_threshold_ms: '100',
        ttl_monitor: 'enabled',
      },
    });

    // Create DocumentDB cluster
    this.cluster = new docdb.DatabaseCluster(this, 'DocumentDBCluster', {
      masterUser: {
        username: 'docdbadmin',
        password: this.credentials.secretValueFromJson('password'),
      },
      instanceType: ec2.InstanceType.of(instanceClass, instanceSize),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      vpc,
      securityGroup,
      deletionProtection,
      backup: {
        retention: cdk.Duration.days(backupRetentionDays),
      },
      storageEncrypted: true,
      parameterGroup,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Change to SNAPSHOT for production
    });

    // Build connection string for app configuration
    this.connectionString = `mongodb://\${${this.credentials.secretName}:SecretString:username}:\${${this.credentials.secretName}:SecretString:password}@${this.cluster.clusterEndpoint.hostname}:${this.cluster.clusterEndpoint.port}/${databaseName}?ssl=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`;

    // Add tags
    cdk.Tags.of(this.cluster).add('Name', 'AssessmentPlatform-DocumentDB');
    cdk.Tags.of(this.credentials).add('Name', 'AssessmentPlatform-DB-Credentials');

    // Output important information
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      description: 'DocumentDB cluster endpoint',
      value: this.cluster.clusterEndpoint.hostname,
    });

    new cdk.CfnOutput(this, 'DatabasePort', {
      description: 'DocumentDB cluster port',
      value: this.cluster.clusterEndpoint.port.toString(),
    });

    new cdk.CfnOutput(this, 'DatabaseName', {
      description: 'Database name',
      value: databaseName,
    });

    new cdk.CfnOutput(this, 'DatabaseCredentialsSecretArn', {
      description: 'ARN of the secret containing database credentials',
      value: this.credentials.secretArn,
    });

    new cdk.CfnOutput(this, 'DatabaseConnectionString', {
      description: 'MongoDB connection string template',
      value: this.connectionString,
    });
  }
}
