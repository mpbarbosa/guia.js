#!/bin/bash
# Deploy AWS Lambda Functions and API Gateway

set -e

echo "🚀 Deploying AWS Location Service Backend"
echo "=========================================="
echo ""

# Load configuration
if [ ! -f "backend/aws-config.json" ]; then
    echo "❌ AWS configuration not found. Run setup-aws-infrastructure.sh first"
    exit 1
fi

AWS_REGION=$(jq -r '.region' backend/aws-config.json)
PLACE_INDEX_NAME=$(jq -r '.placeIndexName' backend/aws-config.json)
MAP_NAME=$(jq -r '.mapName' backend/aws-config.json)
LAMBDA_ROLE_ARN=$(jq -r '.lambdaRoleArn' backend/aws-config.json)
ACCOUNT_ID=$(jq -r '.accountId' backend/aws-config.json)

echo "Region: $AWS_REGION"
echo "Place Index: $PLACE_INDEX_NAME"
echo "Map: $MAP_NAME"
echo ""

# Configuration
PROJECT_NAME="guia-turistico"
ALLOWED_ORIGIN="${ALLOWED_ORIGIN:-https://www.mpbarbosa.com}"

# Step 1: Package and deploy geocode-reverse Lambda
echo "📦 Step 1: Packaging geocode-reverse Lambda..."
cd backend/lambda/geocode-reverse
npm install --production
zip -r function.zip index.js node_modules package.json > /dev/null 2>&1
cd ../../..

GEOCODE_FUNCTION_NAME="${PROJECT_NAME}-geocode-reverse"

# Create or update Lambda function
if aws lambda get-function --function-name "$GEOCODE_FUNCTION_NAME" &> /dev/null; then
    echo "🔄 Updating existing Lambda function: $GEOCODE_FUNCTION_NAME"
    aws lambda update-function-code \
        --function-name "$GEOCODE_FUNCTION_NAME" \
        --zip-file fileb://backend/lambda/geocode-reverse/function.zip \
        --region "$AWS_REGION" > /dev/null
else
    echo "✨ Creating new Lambda function: $GEOCODE_FUNCTION_NAME"
    aws lambda create-function \
        --function-name "$GEOCODE_FUNCTION_NAME" \
        --runtime nodejs20.x \
        --role "$LAMBDA_ROLE_ARN" \
        --handler index.handler \
        --zip-file fileb://backend/lambda/geocode-reverse/function.zip \
        --timeout 10 \
        --memory-size 256 \
        --environment "Variables={PLACE_INDEX_NAME=$PLACE_INDEX_NAME,AWS_REGION=$AWS_REGION,ALLOWED_ORIGIN=$ALLOWED_ORIGIN}" \
        --region "$AWS_REGION" > /dev/null
fi

echo "✅ Geocode Lambda deployed"

# Step 2: Package and deploy map-credentials Lambda
echo ""
echo "📦 Step 2: Packaging map-credentials Lambda..."
cd backend/lambda/map-credentials
zip -r function.zip index.js package.json > /dev/null 2>&1
cd ../../..

MAP_FUNCTION_NAME="${PROJECT_NAME}-map-credentials"

# Create or update Lambda function
if aws lambda get-function --function-name "$MAP_FUNCTION_NAME" &> /dev/null; then
    echo "🔄 Updating existing Lambda function: $MAP_FUNCTION_NAME"
    aws lambda update-function-code \
        --function-name "$MAP_FUNCTION_NAME" \
        --zip-file fileb://backend/lambda/map-credentials/function.zip \
        --region "$AWS_REGION" > /dev/null
else
    echo "✨ Creating new Lambda function: $MAP_FUNCTION_NAME"
    aws lambda create-function \
        --function-name "$MAP_FUNCTION_NAME" \
        --runtime nodejs20.x \
        --role "$LAMBDA_ROLE_ARN" \
        --handler index.handler \
        --zip-file fileb://backend/lambda/map-credentials/function.zip \
        --timeout 10 \
        --memory-size 128 \
        --environment "Variables={MAP_NAME=$MAP_NAME,AWS_REGION=$AWS_REGION,ALLOWED_ORIGIN=$ALLOWED_ORIGIN}" \
        --region "$AWS_REGION" > /dev/null
fi

echo "✅ Map credentials Lambda deployed"

# Step 3: Create or update API Gateway
echo ""
echo "🌐 Step 3: Setting up API Gateway..."

API_NAME="${PROJECT_NAME}-api"

# Check if API exists
API_ID=$(aws apigatewayv2 get-apis --region "$AWS_REGION" --query "Items[?Name=='$API_NAME'].ApiId" --output text)

if [ -z "$API_ID" ]; then
    echo "✨ Creating new API Gateway: $API_NAME"
    API_ID=$(aws apigatewayv2 create-api \
        --name "$API_NAME" \
        --protocol-type HTTP \
        --cors-configuration "AllowOrigins=$ALLOWED_ORIGIN,AllowMethods=GET,POST,OPTIONS,AllowHeaders=Content-Type" \
        --region "$AWS_REGION" \
        --query 'ApiId' \
        --output text)
    echo "API ID: $API_ID"
else
    echo "🔄 Using existing API Gateway: $API_ID"
fi

# Create integrations
GEOCODE_INTEGRATION_ID=$(aws apigatewayv2 create-integration \
    --api-id "$API_ID" \
    --integration-type AWS_PROXY \
    --integration-uri "arn:aws:apigateway:$AWS_REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$AWS_REGION:$ACCOUNT_ID:function:$GEOCODE_FUNCTION_NAME/invocations" \
    --payload-format-version 2.0 \
    --region "$AWS_REGION" \
    --query 'IntegrationId' \
    --output text 2>/dev/null || aws apigatewayv2 get-integrations --api-id "$API_ID" --region "$AWS_REGION" --query "Items[?contains(IntegrationUri, '$GEOCODE_FUNCTION_NAME')].IntegrationId" --output text)

MAP_INTEGRATION_ID=$(aws apigatewayv2 create-integration \
    --api-id "$API_ID" \
    --integration-type AWS_PROXY \
    --integration-uri "arn:aws:apigateway:$AWS_REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$AWS_REGION:$ACCOUNT_ID:function:$MAP_FUNCTION_NAME/invocations" \
    --payload-format-version 2.0 \
    --region "$AWS_REGION" \
    --query 'IntegrationId' \
    --output text 2>/dev/null || aws apigatewayv2 get-integrations --api-id "$API_ID" --region "$AWS_REGION" --query "Items[?contains(IntegrationUri, '$MAP_FUNCTION_NAME')].IntegrationId" --output text)

# Create routes
aws apigatewayv2 create-route \
    --api-id "$API_ID" \
    --route-key "POST /api/geocode/reverse" \
    --target "integrations/$GEOCODE_INTEGRATION_ID" \
    --region "$AWS_REGION" > /dev/null 2>&1 || true

aws apigatewayv2 create-route \
    --api-id "$API_ID" \
    --route-key "GET /api/map/credentials" \
    --target "integrations/$MAP_INTEGRATION_ID" \
    --region "$AWS_REGION" > /dev/null 2>&1 || true

# Create deployment
STAGE_NAME="prod"
aws apigatewayv2 create-deployment \
    --api-id "$API_ID" \
    --stage-name "$STAGE_NAME" \
    --region "$AWS_REGION" > /dev/null 2>&1 || true

# Get API endpoint
API_ENDPOINT=$(aws apigatewayv2 get-api --api-id "$API_ID" --region "$AWS_REGION" --query 'ApiEndpoint' --output text)

echo "✅ API Gateway configured"
echo "API Endpoint: $API_ENDPOINT"

# Step 4: Grant API Gateway permission to invoke Lambda
echo ""
echo "🔐 Step 4: Configuring Lambda permissions..."

aws lambda add-permission \
    --function-name "$GEOCODE_FUNCTION_NAME" \
    --statement-id apigateway-invoke \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$AWS_REGION:$ACCOUNT_ID:$API_ID/*" \
    --region "$AWS_REGION" > /dev/null 2>&1 || true

aws lambda add-permission \
    --function-name "$MAP_FUNCTION_NAME" \
    --statement-id apigateway-invoke \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$AWS_REGION:$ACCOUNT_ID:$API_ID/*" \
    --region "$AWS_REGION" > /dev/null 2>&1 || true

echo "✅ Permissions configured"

# Step 5: Save API configuration
echo ""
echo "💾 Step 5: Saving API configuration..."

jq ". + {apiId: \"$API_ID\", apiEndpoint: \"$API_ENDPOINT\", geocodeFunctionName: \"$GEOCODE_FUNCTION_NAME\", mapFunctionName: \"$MAP_FUNCTION_NAME\"}" backend/aws-config.json > backend/aws-config.tmp.json && mv backend/aws-config.tmp.json backend/aws-config.json

echo "✅ Configuration updated"

# Cleanup
rm -f backend/lambda/geocode-reverse/function.zip backend/lambda/map-credentials/function.zip

# Summary
echo ""
echo "=========================================="
echo "✅ Backend Deployment Complete!"
echo "=========================================="
echo ""
echo "📋 API Endpoints:"
echo "  Base URL: $API_ENDPOINT"
echo "  Geocode: POST $API_ENDPOINT/api/geocode/reverse"
echo "  Map Config: GET $API_ENDPOINT/api/map/credentials"
echo ""
echo "🧪 Test Commands:"
echo "  # Test geocoding (São Paulo coordinates)"
echo "  curl -X POST $API_ENDPOINT/api/geocode/reverse \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"latitude\": -23.550520, \"longitude\": -46.633309}'"
echo ""
echo "  # Get map configuration"
echo "  curl $API_ENDPOINT/api/map/credentials"
echo ""
echo "📝 Next Steps:"
echo "  1. Test the API endpoints above"
echo "  2. Update frontend configuration with API endpoint"
echo "  3. Install frontend dependencies (maplibre-gl)"
echo "  4. Implement frontend integration"
echo ""
