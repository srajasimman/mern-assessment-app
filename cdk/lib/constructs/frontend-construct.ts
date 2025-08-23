import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface FrontendConstructProps {
  /**
   * Domain name for the frontend (optional)
   * @example 'app.example.com'
   */
  domainName?: string;

  /**
   * Hosted zone ID for Route53 (required if domainName is provided)
   */
  hostedZoneId?: string;

  /**
   * API endpoint URL to configure CORS and proxy API requests
   */
  apiEndpoint: string;
}

export class FrontendConstruct extends Construct {
  public readonly bucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;
  public readonly certificate?: certificatemanager.Certificate;
  public readonly domainName?: string;

  constructor(scope: Construct, id: string, props: FrontendConstructProps) {
    super(scope, id);

    const { domainName, hostedZoneId, apiEndpoint } = props;

    // Create S3 bucket for static website hosting
    this.bucket = new s3.Bucket(this, 'FrontendBucket', {
      bucketName: undefined, // Let CDK generate a unique name
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      versioned: false,
      publicReadAccess: false, // CloudFront will access via OAC
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
    });

    // Create SSL certificate if domain is provided
    if (domainName && hostedZoneId) {
      const hostedZone = route53.HostedZone.fromHostedZoneId(this, 'HostedZone', hostedZoneId);

      this.certificate = new certificatemanager.Certificate(this, 'Certificate', {
        domainName,
        validation: certificatemanager.CertificateValidation.fromDns(hostedZone),
      });

      this.domainName = domainName;
    }

    // Create Origin Access Control for CloudFront to access S3
    const originAccessControl = new cloudfront.OriginAccessIdentity(this, 'OriginAccessIdentity', {
      comment: 'Origin Access Identity for Assessment Platform Frontend',
    });

    // Create CloudFront distribution
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(this.bucket, {
          originAccessIdentity: originAccessControl,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        compress: true,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        // API proxy behavior - forward requests to App Runner service
        '/api/*': {
          origin: new origins.HttpOrigin(apiEndpoint.replace('https://', ''), {
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
        },
      },
      domainNames: domainName ? [domainName] : undefined,
      certificate: this.certificate,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(30),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(30),
        },
      ],
      defaultRootObject: 'index.html',
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // Use only North America and Europe edge locations
    });

    // Create Route53 record if domain is provided
    if (domainName && hostedZoneId) {
      const hostedZone = route53.HostedZone.fromHostedZoneId(this, 'ExistingHostedZone', hostedZoneId);

      new route53.ARecord(this, 'AliasRecord', {
        zone: hostedZone,
        recordName: domainName,
        target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(this.distribution)),
      });
    }

    // Create deployment role for CI/CD
    const deploymentRole = new iam.Role(this, 'DeploymentRole', {
      assumedBy: new iam.AccountRootPrincipal(),
      description: 'Role for deploying frontend assets to S3 and invalidating CloudFront',
    });

    // Grant deployment role permissions to update S3 and CloudFront
    this.bucket.grantReadWrite(deploymentRole);
    deploymentRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'cloudfront:CreateInvalidation',
        'cloudfront:GetInvalidation',
        'cloudfront:ListInvalidations',
      ],
      resources: [
        `arn:aws:cloudfront::${cdk.Stack.of(this).account}:distribution/${this.distribution.distributionId}`,
      ],
    }));

    // Add tags
    cdk.Tags.of(this.bucket).add('Name', 'AssessmentPlatform-Frontend-Bucket');
    cdk.Tags.of(this.distribution).add('Name', 'AssessmentPlatform-Frontend-Distribution');

    // Outputs
    new cdk.CfnOutput(this, 'BucketName', {
      description: 'Name of the S3 bucket for frontend assets',
      value: this.bucket.bucketName,
    });

    new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
      description: 'CloudFront distribution ID',
      value: this.distribution.distributionId,
    });

    new cdk.CfnOutput(this, 'CloudFrontDomainName', {
      description: 'CloudFront distribution domain name',
      value: this.distribution.distributionDomainName,
    });

    new cdk.CfnOutput(this, 'WebsiteUrl', {
      description: 'Website URL',
      value: domainName ? `https://${domainName}` : `https://${this.distribution.distributionDomainName}`,
    });

    new cdk.CfnOutput(this, 'DeploymentRoleArn', {
      description: 'ARN of the role for deploying frontend assets',
      value: deploymentRole.roleArn,
    });
  }
}
