#!/bin/bash

# MERN Assessment Platform - CDK Deployment Script
# This script helps deploy and manage the AWS CDK infrastructure

set -e

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
REGION="us-east-1"
ENVIRONMENT="development"
STACK_NAME="AssessmentPlatformStack"

# Function to display help
show_help() {
    echo -e "${BLUE}MERN Assessment Platform - CDK Deployment Script${NC}"
    echo ""
    echo "Usage: ./deploy.sh [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  bootstrap                    Bootstrap CDK in the current account/region"
    echo "  deploy                      Deploy the infrastructure stack"
    echo "  destroy                     Destroy the infrastructure stack"
    echo "  diff                        Show differences between deployed and local stack"
    echo "  synth                       Synthesize CloudFormation templates"
    echo "  status                      Show stack status and outputs"
    echo ""
    echo "Options:"
    echo "  --region REGION             AWS region (default: us-east-1)"
    echo "  --environment ENV           Environment name (development/staging/production)"
    echo "  --domain DOMAIN            Custom domain name for frontend"
    echo "  --hosted-zone-id ID        Route53 hosted zone ID (required with --domain)"
    echo "  --account ACCOUNT          AWS account ID"
    echo "  --help                     Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh bootstrap"
    echo "  ./deploy.sh deploy --environment production"
    echo "  ./deploy.sh deploy --domain app.example.com --hosted-zone-id Z1234567890"
    echo "  ./deploy.sh destroy --environment staging"
    echo ""
}

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}AWS CLI is not installed. Please install it first.${NC}"
        exit 1
    fi
    
    # Check if CDK is installed
    if ! command -v cdk &> /dev/null; then
        echo -e "${RED}AWS CDK is not installed. Please install it with: npm install -g aws-cdk${NC}"
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Node.js is not installed. Please install Node.js first.${NC}"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}AWS credentials not configured. Please run 'aws configure'.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Prerequisites check passed!${NC}"
}

# Function to install dependencies
install_dependencies() {
    echo -e "${YELLOW}Installing CDK dependencies...${NC}"
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    echo -e "${GREEN}Dependencies installed!${NC}"
}

# Function to bootstrap CDK
bootstrap() {
    echo -e "${YELLOW}Bootstrapping CDK in region: ${REGION}${NC}"
    local account=$(aws sts get-caller-identity --query Account --output text)
    cdk bootstrap aws://${account}/${REGION}
    echo -e "${GREEN}CDK bootstrap completed!${NC}"
}

# Function to deploy stack
deploy() {
    echo -e "${YELLOW}Deploying Assessment Platform Stack...${NC}"
    
    local context_args="--context environment=${ENVIRONMENT} --context region=${REGION}"
    
    if [ ! -z "$DOMAIN_NAME" ]; then
        context_args="${context_args} --context domainName=${DOMAIN_NAME}"
    fi
    
    if [ ! -z "$HOSTED_ZONE_ID" ]; then
        context_args="${context_args} --context hostedZoneId=${HOSTED_ZONE_ID}"
    fi
    
    if [ ! -z "$ACCOUNT_ID" ]; then
        context_args="${context_args} --context account=${ACCOUNT_ID}"
    fi
    
    echo -e "${BLUE}Deploying with context: ${context_args}${NC}"
    
    cdk deploy ${context_args} --require-approval never
    
    echo -e "${GREEN}Deployment completed successfully!${NC}"
    
    # Show stack outputs
    echo -e "${YELLOW}Stack outputs:${NC}"
    aws cloudformation describe-stacks --stack-name ${STACK_NAME} --query 'Stacks[0].Outputs' --output table 2>/dev/null || echo "Stack outputs not available"
}

# Function to destroy stack
destroy() {
    echo -e "${RED}WARNING: This will destroy all resources in the stack!${NC}"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Destroying Assessment Platform Stack...${NC}"
        cdk destroy --force
        echo -e "${GREEN}Stack destroyed successfully!${NC}"
    else
        echo -e "${YELLOW}Destruction cancelled.${NC}"
    fi
}

# Function to show diff
diff() {
    echo -e "${YELLOW}Showing differences between deployed and local stack...${NC}"
    cdk diff --context environment=${ENVIRONMENT}
}

# Function to synthesize
synth() {
    echo -e "${YELLOW}Synthesizing CloudFormation templates...${NC}"
    cdk synth --context environment=${ENVIRONMENT}
    echo -e "${GREEN}Templates synthesized to cdk.out/!${NC}"
}

# Function to show status
status() {
    echo -e "${YELLOW}Checking stack status...${NC}"
    
    # Check if stack exists
    if aws cloudformation describe-stacks --stack-name ${STACK_NAME} &>/dev/null; then
        echo -e "${GREEN}Stack Status:${NC}"
        aws cloudformation describe-stacks --stack-name ${STACK_NAME} --query 'Stacks[0].StackStatus' --output text
        
        echo -e "\n${GREEN}Stack Outputs:${NC}"
        aws cloudformation describe-stacks --stack-name ${STACK_NAME} --query 'Stacks[0].Outputs' --output table
        
        echo -e "\n${GREEN}Stack Resources:${NC}"
        aws cloudformation list-stack-resources --stack-name ${STACK_NAME} --query 'StackResourceSummaries[*].[LogicalResourceId,ResourceType,ResourceStatus]' --output table
    else
        echo -e "${RED}Stack ${STACK_NAME} not found or not deployed.${NC}"
    fi
}

# Parse command line arguments
COMMAND=""
while [[ $# -gt 0 ]]; do
    case $1 in
        bootstrap|deploy|destroy|diff|synth|status)
            COMMAND=$1
            shift
            ;;
        --region)
            REGION="$2"
            shift 2
            ;;
        --environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --domain)
            DOMAIN_NAME="$2"
            shift 2
            ;;
        --hosted-zone-id)
            HOSTED_ZONE_ID="$2"
            shift 2
            ;;
        --account)
            ACCOUNT_ID="$2"
            shift 2
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Show help if no command provided
if [ -z "$COMMAND" ]; then
    show_help
    exit 1
fi

# Ensure we're in the correct directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Check prerequisites for most commands
if [ "$COMMAND" != "help" ]; then
    check_prerequisites
    install_dependencies
fi

# Execute the requested command
case $COMMAND in
    bootstrap)
        bootstrap
        ;;
    deploy)
        deploy
        ;;
    destroy)
        destroy
        ;;
    diff)
        diff
        ;;
    synth)
        synth
        ;;
    status)
        status
        ;;
esac

echo -e "${GREEN}Command completed successfully!${NC}"
