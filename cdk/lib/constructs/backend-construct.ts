import * as cdk from 'aws-cdk-lib';
import * as apprunner from 'aws-cdk-lib/aws-apprunner';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface BackendConstructProps {
  vpcConnector: apprunner.CfnVpcConnector;
  databaseEndpoint: string;
  databasePort: string;
  databaseName: string;
  databaseCredentialsSecretArn: string;

  /**
   * ECR repository for the container image
   */
  ecrRepository?: ecr.Repository;

  /**
   * Image tag to deploy
   * @default 'latest'
   */
  imageTag?: string;

  /**
   * App Runner CPU configuration
   * @default '0.25 vCPU'
   */
  cpu?: string;

  /**
   * App Runner memory configuration
   * @default '0.5 GB'
   */
  memory?: string;

  /**
   * Custom environment variables
   */
  environmentVariables?: Record<string, string>;
}

export class BackendConstruct extends Construct {
  public readonly service: apprunner.CfnService;
  public readonly repository: ecr.Repository;
  public readonly serviceRole: iam.Role;
  public readonly instanceRole: iam.Role;

  constructor(scope: Construct, id: string, props: BackendConstructProps) {
    super(scope, id);

    const {
      vpcConnector,
      databaseEndpoint,
      databasePort,
      databaseName,
      databaseCredentialsSecretArn,
      imageTag = 'latest',
      cpu = '0.25 vCPU',
      memory = '0.5 GB',
      environmentVariables = {},
    } = props;

    // Create ECR repository if not provided
    this.repository = props.ecrRepository ?? new ecr.Repository(this, 'BackendRepository', {
      repositoryName: 'assessment-platform-backend',
      imageScanOnPush: true,
      imageTagMutability: ecr.TagMutability.MUTABLE,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create App Runner access role (for pulling from ECR)
    this.serviceRole = new iam.Role(this, 'AppRunnerAccessRole', {
      assumedBy: new iam.ServicePrincipal('build.apprunner.amazonaws.com'),
      description: 'Role used by App Runner to access ECR and other services',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSAppRunnerServicePolicyForECRAccess'),
      ],
    });

    // Create App Runner instance role (for runtime access to AWS services)
    this.instanceRole = new iam.Role(this, 'AppRunnerInstanceRole', {
      assumedBy: new iam.ServicePrincipal('tasks.apprunner.amazonaws.com'),
      description: 'Role used by App Runner service to access AWS services at runtime',
    });

    // Grant access to read database credentials from Secrets Manager
    this.instanceRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'secretsmanager:GetSecretValue',
        'secretsmanager:DescribeSecret',
      ],
      resources: [databaseCredentialsSecretArn],
    }));

    // Grant CloudWatch logging permissions
    this.instanceRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
        'logs:DescribeLogStreams',
        'logs:DescribeLogGroups',
      ],
      resources: ['*'],
    }));

    // Prepare environment variables
    const environmentConfig: Record<string, string> = {
      NODE_ENV: 'production',
      PORT: '8080', // App Runner uses port 8080
      DATABASE_HOST: databaseEndpoint,
      DATABASE_PORT: databasePort,
      DATABASE_NAME: databaseName,
      DATABASE_CREDENTIALS_SECRET_ARN: databaseCredentialsSecretArn,
      // MongoDB connection string will be constructed in the application
      MONGODB_URI_TEMPLATE: `mongodb://{{username}}:{{password}}@${databaseEndpoint}:${databasePort}/${databaseName}?ssl=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`,
      // Add CORS origin for frontend (will be updated after frontend is deployed)
      CORS_ORIGIN: '*', // This should be restricted in production
      ...environmentVariables,
    };

    // Convert environment variables to App Runner format
    const environmentVariablesConfig = Object.entries(environmentConfig).map(([name, value]) => ({
      name,
      value,
    }));

    // Create App Runner service
    this.service = new apprunner.CfnService(this, 'AppRunnerService', {
      serviceName: 'assessment-platform-backend',
      sourceConfiguration: {
        autoDeploymentsEnabled: false, // Set to true for automatic deployments on image push
        imageRepository: {
          imageIdentifier: `${this.repository.repositoryUri}:${imageTag}`,
          imageConfiguration: {
            port: '8080',
            runtimeEnvironmentVariables: environmentVariablesConfig,
          },
          imageRepositoryType: 'ECR',
        },
      },
      instanceConfiguration: {
        cpu,
        memory,
        instanceRoleArn: this.instanceRole.roleArn,
      },
      networkConfiguration: {
        egressConfiguration: {
          egressType: 'VPC',
          vpcConnectorArn: vpcConnector.attrVpcConnectorArn,
        },
      },
      healthCheckConfiguration: {
        protocol: 'HTTP',
        path: '/api/health',
        interval: 20,
        timeout: 10,
        healthyThreshold: 3,
        unhealthyThreshold: 5,
      },
      autoScalingConfigurationArn: undefined, // Use default auto scaling
    });

    // Ensure the service role has the necessary permissions
    this.service.addPropertyOverride('SourceConfiguration.ImageRepository.ImageConfiguration.RuntimeEnvironmentSecrets', [
      {
        name: 'DATABASE_URL',
        value: databaseCredentialsSecretArn,
      },
    ]);

    // Add dependency on VPC connector
    this.service.addDependency(vpcConnector);

    // Add tags
    cdk.Tags.of(this.repository).add('Name', 'AssessmentPlatform-Backend-ECR');
    cdk.Tags.of(this.service).add('Name', 'AssessmentPlatform-Backend-Service');

    // Outputs
    new cdk.CfnOutput(this, 'AppRunnerServiceUrl', {
      description: 'URL of the App Runner service',
      value: `https://${this.service.attrServiceUrl}`,
    });

    new cdk.CfnOutput(this, 'AppRunnerServiceArn', {
      description: 'ARN of the App Runner service',
      value: this.service.attrServiceArn,
    });

    new cdk.CfnOutput(this, 'ECRRepositoryUri', {
      description: 'ECR repository URI for backend container images',
      value: this.repository.repositoryUri,
    });

    new cdk.CfnOutput(this, 'ECRRepositoryName', {
      description: 'ECR repository name',
      value: this.repository.repositoryName,
    });
  }
}
