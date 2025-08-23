import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AssessmentPlatformStack } from '../lib/assessment-platform-stack';

describe('Assessment Platform Stack', () => {
  let app: cdk.App;
  let stack: AssessmentPlatformStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new AssessmentPlatformStack(app, 'TestAssessmentPlatformStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });
    template = Template.fromStack(stack);
  });

  test('VPC is created', () => {
    template.hasResourceProperties('AWS::EC2::VPC', {
      CidrBlock: '10.0.0.0/16',
      EnableDnsHostnames: true,
      EnableDnsSupport: true,
    });
  });

  test('RDS PostgreSQL instance is created', () => {
    template.hasResourceProperties('AWS::RDS::DBInstance', {
      Engine: 'postgres',
      DBInstanceClass: 'db.t3.micro',
      AllocatedStorage: '20',
      StorageEncrypted: true,
    });
  });

  test('App Runner service is created', () => {
    template.hasResourceProperties('AWS::AppRunner::Service', {
      ServiceName: 'assessment-platform-backend',
    });
  });

  test('S3 bucket is created for frontend', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          {
            ServerSideEncryptionByDefault: {
              SSEAlgorithm: 'AES256',
            },
          },
        ],
      },
    });
  });

  test('CloudFront distribution is created', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        Enabled: true,
        DefaultRootObject: 'index.html',
        ViewerProtocolPolicy: 'redirect-to-https',
      },
    });
  });

  test('Security groups are properly configured', () => {
    // Database security group
    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      GroupDescription: 'Security group for RDS PostgreSQL database',
    });

    // App Runner security group
    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      GroupDescription: 'Security group for App Runner service',
    });
  });

  test('ECR repository is created', () => {
    template.hasResourceProperties('AWS::ECR::Repository', {
      RepositoryName: 'assessment-platform-backend',
      ImageScanningConfiguration: {
        ScanOnPush: true,
      },
    });
  });

  test('Secrets Manager secret is created for database credentials', () => {
    template.hasResourceProperties('AWS::SecretsManager::Secret', {
      Description: 'Credentials for Assessment Platform database',
      GenerateSecretString: {
        SecretStringTemplate: '{"username":"postgres"}',
        GenerateStringKey: 'password',
        ExcludeCharacters: '"@/\\',
        PasswordLength: 32,
      },
    });
  });

  test('IAM roles are created with appropriate policies', () => {
    // App Runner access role
    template.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Principal: {
              Service: 'build.apprunner.amazonaws.com',
            },
          },
        ],
      },
    });

    // App Runner instance role
    template.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Principal: {
              Service: 'tasks.apprunner.amazonaws.com',
            },
          },
        ],
      },
    });
  });

  test('Stack outputs are defined', () => {
    template.hasOutput('DatabaseEndpoint', {});
    template.hasOutput('AppRunnerServiceUrl', {});
    template.hasOutput('CloudFrontDomainName', {});
    template.hasOutput('WebsiteUrl', {});
    template.hasOutput('ECRRepositoryUri', {});
  });

  test('Resources have proper tags', () => {
    // Check that resources are tagged
    template.allResourcesProperties('AWS::RDS::DBInstance', {
      Tags: [
        {
          Key: 'Name',
          Value: 'AssessmentPlatform-Database',
        },
      ],
    });
  });
});
