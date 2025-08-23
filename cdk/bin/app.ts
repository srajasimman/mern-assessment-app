#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AssessmentPlatformStack } from '../lib/assessment-platform-stack';

const app = new cdk.App();

// Get environment configuration from context or environment variables
const account = app.node.tryGetContext('account') || process.env.CDK_DEFAULT_ACCOUNT;
const region = app.node.tryGetContext('region') || process.env.CDK_DEFAULT_REGION || 'us-east-1';

// Get optional domain configuration
const domainName = app.node.tryGetContext('domainName');
const hostedZoneId = app.node.tryGetContext('hostedZoneId');

// Create the main stack
new AssessmentPlatformStack(app, 'AssessmentPlatformStack', {
  env: {
    account,
    region,
  },
  domainName,
  hostedZoneId,
  description: 'MERN Assessment Platform - AWS CDK Infrastructure Stack',
  tags: {
    Project: 'AssessmentPlatform',
    Environment: app.node.tryGetContext('environment') || 'development',
    Owner: 'srajasimman',
    CostCenter: 'Development',
  },
});

// Add global tags to all resources
cdk.Tags.of(app).add('Project', 'MERN-Assessment-Platform');
cdk.Tags.of(app).add('ManagedBy', 'AWS-CDK');
