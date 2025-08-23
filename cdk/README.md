# AWS CDK Infrastructure for MERN Assessment Platform

This directory contains the AWS CDK (Cloud Development Kit) infrastructure code for deploying the MERN Assessment Platform to AWS.

## Architecture Overview

The CDK stack deploys the following AWS services:

### 🏗️ Infrastructure Components

- **🌐 VPC**: Custom VPC with public, private, and isolated subnets across 2 AZs
- **🗃️ RDS PostgreSQL**: Database server with automated backups and encryption
- **🏃‍♂️ App Runner**: Containerized backend service with auto-scaling
- **📦 S3**: Static website hosting for React frontend
- **🚀 CloudFront**: CDN with SSL/TLS termination and API proxying
- **🔐 ACM**: SSL certificate for custom domains (optional)
- **🏷️ Route 53**: DNS management (optional)
- **🔒 IAM**: Least-privilege roles and policies
- **🔑 Secrets Manager**: Secure database credential storage

### 🏛️ Architecture Diagram

```
Internet
    │
    ▼
CloudFront (CDN) ──── S3 Bucket (Frontend)
    │
    ▼
App Runner (Backend) ──── RDS PostgreSQL
    │                        │
    ▼                        ▼
VPC Connector ──────── Isolated Subnets
```

## 🚀 Quick Start

### Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Node.js** (v18+) and **npm**
3. **AWS CDK** CLI installed globally:
   ```bash
   npm install -g aws-cdk
   ```

### Installation

1. **Install dependencies:**
   ```bash
   cd cdk
   npm install
   ```

2. **Bootstrap CDK** (first time only):
   ```bash
   cdk bootstrap
   ```

3. **Deploy the stack:**
   ```bash
   # Deploy with default configuration
   cdk deploy

   # Deploy with custom domain
   cdk deploy --context domainName=app.yourdomain.com --context hostedZoneId=Z1D633PJN98FT9
   ```

## 📋 Configuration Options

### Context Variables

You can customize the deployment using CDK context variables:

```bash
# Deploy to production environment
cdk deploy --context environment=production

# Deploy with custom domain
cdk deploy --context domainName=app.example.com --context hostedZoneId=Z1234567890

# Deploy to specific account/region
cdk deploy --context account=123456789012 --context region=us-west-2
```

### Environment Variables

Set these environment variables for additional configuration:

```bash
export CDK_DEFAULT_ACCOUNT=123456789012
export CDK_DEFAULT_REGION=us-east-1
```

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run watch` | Watch for changes and recompile |
| `cdk synth` | Synthesize CloudFormation templates |
| `cdk deploy` | Deploy stack to AWS |
| `cdk diff` | Compare deployed stack with current state |
| `cdk destroy` | Delete the stack and all resources |

## 📁 Project Structure

```
cdk/
├── bin/
│   └── app.ts                          # CDK app entry point
├── lib/
│   ├── assessment-platform-stack.ts    # Main stack definition
│   └── constructs/
│       ├── network-construct.ts         # VPC, subnets, security groups
│       ├── database-construct.ts        # RDS PostgreSQL
│       ├── backend-construct.ts         # App Runner service
│       └── frontend-construct.ts        # S3, CloudFront, ACM
├── package.json                        # Dependencies and scripts
├── cdk.json                           # CDK configuration
└── tsconfig.json                      # TypeScript configuration
```

## 🚀 Deployment Process

### 1. Backend Deployment

The backend uses **AWS App Runner** with an ECR container registry:

```bash
# Build and push backend container
cd ../server
docker build -t assessment-platform-backend .
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag assessment-platform-backend:latest <ecr-uri>:latest
docker push <ecr-uri>:latest
```

### 2. Frontend Deployment

The frontend is built and deployed to S3:

```bash
# Build frontend
cd ../client
npm run build

# Deploy to S3 (after CDK deployment)
aws s3 sync build/ s3://<bucket-name>/
aws cloudfront create-invalidation --distribution-id <distribution-id> --paths "/*"
```

## 🔐 Security Features

- **🔒 Encryption**: All data encrypted at rest and in transit
- **🌐 Network Security**: Private subnets for database, security groups with minimal access
- **🔑 Secrets Management**: Database credentials stored in AWS Secrets Manager
- **🛡️ IAM**: Least-privilege access policies
- **🚫 Public Access**: S3 bucket not publicly accessible (CloudFront only)

## 💰 Cost Optimization

### Development Environment
- **RDS**: `db.t3.micro` instance
- **App Runner**: 0.25 vCPU, 0.5 GB RAM
- **CloudFront**: Price Class 100 (North America + Europe)

### Production Environment
- **RDS**: `db.t3.small` with Multi-AZ
- **App Runner**: 1 vCPU, 2 GB RAM with auto-scaling
- **Enhanced monitoring and backups**

## 📊 Monitoring & Logging

The stack includes:
- **CloudWatch Logs** for App Runner service
- **RDS Performance Insights** for database monitoring
- **CloudFront access logs** (can be enabled)
- **Custom health checks** for App Runner

## 🔧 Customization

### Database Configuration

Edit `lib/constructs/database-construct.ts`:

```typescript
// Change instance type
instanceClass: ec2.InstanceClass.T3,
instanceSize: ec2.InstanceSize.SMALL,

// Enable Multi-AZ for production
multiAz: true,

// Adjust backup retention
backupRetentionDays: 30,
```

### App Runner Configuration

Edit `lib/constructs/backend-construct.ts`:

```typescript
// Adjust compute resources
cpu: '1 vCPU',
memory: '2 GB',

// Add custom environment variables
environmentVariables: {
  LOG_LEVEL: 'debug',
  FEATURE_FLAGS: 'feature1,feature2',
},
```

## 🚨 Troubleshooting

### Common Issues

1. **CDK Bootstrap Error**:
   ```bash
   cdk bootstrap aws://ACCOUNT-NUMBER/REGION
   ```

2. **Permission Errors**:
   Ensure your AWS credentials have sufficient permissions for all services.

3. **Domain Validation**:
   If using custom domains, ensure the hosted zone is properly configured.

4. **App Runner Health Checks**:
   Ensure your backend service responds to `/api/health` endpoint.

### Useful Commands

```bash
# View stack outputs
aws cloudformation describe-stacks --stack-name AssessmentPlatformStack --query 'Stacks[0].Outputs'

# Check App Runner service status
aws apprunner describe-service --service-arn <service-arn>

# View RDS instance details
aws rds describe-db-instances --db-instance-identifier <instance-id>
```

## 🔄 CI/CD Integration

For automated deployments, consider integrating with:
- **GitHub Actions**
- **AWS CodePipeline**
- **GitLab CI/CD**

Example GitHub Action workflow:

```yaml
name: Deploy CDK Stack
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd cdk && npm ci
      - run: cd cdk && cdk deploy --require-approval never
```

## 📚 Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [AWS App Runner Documentation](https://docs.aws.amazon.com/apprunner/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)

---

For questions or issues, please refer to the main project README or create an issue in the repository.
