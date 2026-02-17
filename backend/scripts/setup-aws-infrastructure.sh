#!/bin/bash
# AWS Location Service Infrastructure Setup Script
# This script creates all required AWS resources for the Guia Turístico application

set -e

echo "🚀 AWS Location Service Infrastructure Setup"
echo "=============================================="
echo ""

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
PROJECT_NAME="guia-turistico"
MAP_NAME="${PROJECT_NAME}-map"
PLACE_INDEX_NAME="${PROJECT_NAME}-place-index"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    echo "Please install AWS CLI: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo "Please configure AWS CLI with: aws configure"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI configured${NC}"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account: $ACCOUNT_ID"
echo "Region: $AWS_REGION"
echo ""

# Step 1: Create AWS Location Service Map
echo "📍 Step 1: Creating AWS Location Service Map..."
MAP_ARN=$(aws location create-map \
    --map-name "$MAP_NAME" \
    --configuration "Style=VectorEsriNavigation" \
    --pricing-plan RequestBasedUsage \
    --region "$AWS_REGION" \
    --query 'MapArn' \
    --output text 2>/dev/null || echo "")

if [ -n "$MAP_ARN" ]; then
    echo -e "${GREEN}✅ Map created: $MAP_ARN${NC}"
else
    # Map might already exist
    MAP_ARN=$(aws location describe-map \
        --map-name "$MAP_NAME" \
        --region "$AWS_REGION" \
        --query 'MapArn' \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$MAP_ARN" ]; then
        echo -e "${YELLOW}⚠️  Map already exists: $MAP_ARN${NC}"
    else
        echo -e "${RED}❌ Failed to create map${NC}"
        exit 1
    fi
fi

# Step 2: Create AWS Location Service Place Index
echo ""
echo "🗺️  Step 2: Creating AWS Location Service Place Index..."
PLACE_INDEX_ARN=$(aws location create-place-index \
    --index-name "$PLACE_INDEX_NAME" \
    --data-source Esri \
    --pricing-plan RequestBasedUsage \
    --region "$AWS_REGION" \
    --query 'IndexArn' \
    --output text 2>/dev/null || echo "")

if [ -n "$PLACE_INDEX_ARN" ]; then
    echo -e "${GREEN}✅ Place Index created: $PLACE_INDEX_ARN${NC}"
else
    # Place Index might already exist
    PLACE_INDEX_ARN=$(aws location describe-place-index \
        --index-name "$PLACE_INDEX_NAME" \
        --region "$AWS_REGION" \
        --query 'IndexArn' \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$PLACE_INDEX_ARN" ]; then
        echo -e "${YELLOW}⚠️  Place Index already exists: $PLACE_INDEX_ARN${NC}"
    else
        echo -e "${RED}❌ Failed to create place index${NC}"
        exit 1
    fi
fi

# Step 3: Create IAM Role for Lambda
echo ""
echo "🔐 Step 3: Creating IAM Role for Lambda..."

# Create trust policy
cat > /tmp/lambda-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

LAMBDA_ROLE_NAME="${PROJECT_NAME}-lambda-role"
LAMBDA_ROLE_ARN=$(aws iam create-role \
    --role-name "$LAMBDA_ROLE_NAME" \
    --assume-role-policy-document file:///tmp/lambda-trust-policy.json \
    --query 'Role.Arn' \
    --output text 2>/dev/null || echo "")

if [ -n "$LAMBDA_ROLE_ARN" ]; then
    echo -e "${GREEN}✅ Lambda role created: $LAMBDA_ROLE_ARN${NC}"
else
    # Role might already exist
    LAMBDA_ROLE_ARN=$(aws iam get-role \
        --role-name "$LAMBDA_ROLE_NAME" \
        --query 'Role.Arn' \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$LAMBDA_ROLE_ARN" ]; then
        echo -e "${YELLOW}⚠️  Lambda role already exists: $LAMBDA_ROLE_ARN${NC}"
    else
        echo -e "${RED}❌ Failed to create Lambda role${NC}"
        exit 1
    fi
fi

# Step 4: Create IAM Policy for Location Service Access
echo ""
echo "📋 Step 4: Creating IAM Policy..."

cat > /tmp/location-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "geo:SearchPlaceIndexForPosition",
        "geo:GetMap*"
      ],
      "Resource": [
        "$PLACE_INDEX_ARN",
        "$MAP_ARN"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
EOF

POLICY_NAME="${PROJECT_NAME}-location-policy"
POLICY_ARN=$(aws iam create-policy \
    --policy-name "$POLICY_NAME" \
    --policy-document file:///tmp/location-policy.json \
    --query 'Policy.Arn' \
    --output text 2>/dev/null || echo "")

if [ -n "$POLICY_ARN" ]; then
    echo -e "${GREEN}✅ Policy created: $POLICY_ARN${NC}"
else
    # Policy might already exist
    POLICY_ARN="arn:aws:iam::${ACCOUNT_ID}:policy/${POLICY_NAME}"
    if aws iam get-policy --policy-arn "$POLICY_ARN" &> /dev/null; then
        echo -e "${YELLOW}⚠️  Policy already exists: $POLICY_ARN${NC}"
    else
        echo -e "${RED}❌ Failed to create policy${NC}"
        exit 1
    fi
fi

# Step 5: Attach Policy to Role
echo ""
echo "🔗 Step 5: Attaching policy to Lambda role..."
aws iam attach-role-policy \
    --role-name "$LAMBDA_ROLE_NAME" \
    --policy-arn "$POLICY_ARN" 2>/dev/null || true

echo -e "${GREEN}✅ Policy attached to role${NC}"

# Wait for IAM role propagation
echo ""
echo "⏳ Waiting for IAM role propagation (10 seconds)..."
sleep 10

# Step 6: Save configuration
echo ""
echo "💾 Step 6: Saving configuration..."

cat > backend/aws-config.json <<EOF
{
  "region": "$AWS_REGION",
  "accountId": "$ACCOUNT_ID",
  "mapName": "$MAP_NAME",
  "mapArn": "$MAP_ARN",
  "placeIndexName": "$PLACE_INDEX_NAME",
  "placeIndexArn": "$PLACE_INDEX_ARN",
  "lambdaRoleName": "$LAMBDA_ROLE_NAME",
  "lambdaRoleArn": "$LAMBDA_ROLE_ARN",
  "policyName": "$POLICY_NAME",
  "policyArn": "$POLICY_ARN"
}
EOF

echo -e "${GREEN}✅ Configuration saved to backend/aws-config.json${NC}"

# Cleanup temp files
rm -f /tmp/lambda-trust-policy.json /tmp/location-policy.json

# Summary
echo ""
echo "=============================================="
echo -e "${GREEN}✅ AWS Infrastructure Setup Complete!${NC}"
echo "=============================================="
echo ""
echo "📋 Resource Summary:"
echo "  Map Name: $MAP_NAME"
echo "  Place Index: $PLACE_INDEX_NAME"
echo "  Lambda Role: $LAMBDA_ROLE_NAME"
echo "  Region: $AWS_REGION"
echo ""
echo "📝 Next Steps:"
echo "  1. Review backend/aws-config.json"
echo "  2. Deploy Lambda functions"
echo "  3. Create API Gateway"
echo "  4. Update frontend configuration"
echo ""
echo "💰 Cost Estimate:"
echo "  Maps: \$4.00 per 1,000 requests"
echo "  Geocoding: \$4.00 per 1,000 requests"
echo "  Lambda: Free tier includes 1M requests/month"
echo "  Free tier should cover development/testing"
echo ""
