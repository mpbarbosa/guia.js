# AWS Location Service Backend

This directory contains the serverless backend for AWS Location Service integration.

## Architecture

- **AWS Lambda**: Serverless functions for geocoding and map configuration
- **API Gateway**: HTTP API for frontend communication
- **IAM Roles**: Secure access to AWS Location Service

## Directory Structure

```
backend/
├── lambda/
│   ├── geocode-reverse/      # Reverse geocoding Lambda function
│   │   ├── index.js           # Lambda handler
│   │   └── package.json       # Node.js dependencies
│   └── map-credentials/       # Map configuration Lambda function
│       ├── index.js           # Lambda handler
│       └── package.json       # Node.js dependencies
├── scripts/
│   ├── setup-aws-infrastructure.sh  # Create AWS resources
│   └── deploy-backend.sh            # Deploy Lambda + API Gateway
└── aws-config.json            # AWS resource configuration (generated)
```

## Prerequisites

1. **AWS CLI** installed and configured
   ```bash
   aws --version  # Should be 2.x or higher
   aws configure  # Set up credentials
   ```

2. **jq** for JSON processing
   ```bash
   sudo apt install jq  # Ubuntu/Debian
   brew install jq      # macOS
   ```

3. **Node.js** 20.x for Lambda functions
   ```bash
   node --version  # Should be v20.x
   ```

4. **zip** utility for packaging Lambda functions

## Setup Instructions

### Step 1: Create AWS Resources

Run the infrastructure setup script to create AWS Location Service resources, IAM roles, and policies:

```bash
cd /path/to/guia_turistico
./backend/scripts/setup-aws-infrastructure.sh
```

This script creates:
- AWS Location Service Map (guia-turistico-map)
- AWS Location Service Place Index (guia-turistico-place-index)
- IAM Role for Lambda functions
- IAM Policy with minimal required permissions

**Output**: `backend/aws-config.json` with all resource ARNs

### Step 2: Deploy Lambda Functions and API Gateway

Deploy the backend API:

```bash
./backend/scripts/deploy-backend.sh
```

This script:
- Packages Lambda functions with dependencies
- Creates/updates Lambda functions
- Sets up API Gateway HTTP API
- Configures CORS and permissions
- Returns API endpoint URLs

**Output**: Updated `backend/aws-config.json` with API endpoint

### Step 3: Test the API

Test the geocoding endpoint:

```bash
# Get API endpoint from configuration
API_ENDPOINT=$(jq -r '.apiEndpoint' backend/aws-config.json)

# Test reverse geocoding (São Paulo coordinates)
curl -X POST $API_ENDPOINT/api/geocode/reverse \
  -H 'Content-Type: application/json' \
  -d '{"latitude": -23.550520, "longitude": -46.633309}'

# Test map credentials
curl $API_ENDPOINT/api/map/credentials
```

Expected responses:
- Geocode: JSON with address data
- Map credentials: JSON with map configuration

## API Endpoints

### POST /api/geocode/reverse

Converts coordinates to address using AWS Location Service.

**Request**:
```json
{
  "latitude": -23.550520,
  "longitude": -46.633309
}
```

**Response** (200 OK):
```json
{
  "provider": "aws-location-service",
  "coordinates": {
    "latitude": -23.550520,
    "longitude": -46.633309
  },
  "address": {
    "label": "Av. Paulista, 1578, São Paulo, SP",
    "street": "Avenida Paulista",
    "addressNumber": "1578",
    "neighborhood": "Bela Vista",
    "municipality": "São Paulo",
    "region": "São Paulo",
    "country": "BRA",
    "postalCode": "01310-200"
  }
}
```

**Error Responses**:
- 400: Invalid coordinates
- 404: No address found
- 500: Internal server error

### GET /api/map/credentials

Returns map configuration for MapLibre GL JS.

**Response** (200 OK):
```json
{
  "mapName": "guia-turistico-map",
  "region": "us-east-1",
  "style": "VectorEsriNavigation",
  "mapLibre": {
    "version": "4.0.0",
    "styleUrl": "https://maps.geo.us-east-1.amazonaws.com/maps/v0/maps/guia-turistico-map/style-descriptor"
  },
  "defaults": {
    "center": [-46.633309, -23.550520],
    "zoom": 12
  }
}
```

## Environment Variables

The Lambda functions use these environment variables (automatically configured by deployment script):

- `AWS_REGION`: AWS region (e.g., us-east-1)
- `PLACE_INDEX_NAME`: AWS Location Service Place Index name
- `MAP_NAME`: AWS Location Service Map name
- `ALLOWED_ORIGIN`: CORS allowed origin (https://www.mpbarbosa.com)

## Security

### IAM Permissions

The Lambda execution role has minimal permissions:
- `geo:SearchPlaceIndexForPosition` - Reverse geocoding only
- `geo:GetMap*` - Read-only map access
- `logs:*` - CloudWatch logging

### CORS Configuration

CORS is configured to allow requests only from:
- Production: `https://www.mpbarbosa.com`
- Development: Configure `ALLOWED_ORIGIN` environment variable

### Rate Limiting

API Gateway has default throttling:
- 10,000 requests per second (steady state)
- 5,000 requests burst

Consider adding custom rate limiting for production.

## Cost Estimation

AWS Location Service pricing (as of 2024):

- **Maps**: $4.00 per 1,000 requests
- **Geocoding**: $4.00 per 1,000 requests  
- **Lambda**: $0.20 per 1M requests (first 1M free)
- **API Gateway**: $1.00 per 1M requests (first 1M free)

**Example**: 10,000 requests/month
- Maps: $0.04
- Geocoding: $0.04
- Lambda: $0.00 (free tier)
- API Gateway: $0.00 (free tier)
- **Total**: ~$0.08/month

Free tier should cover development and light production use.

## Monitoring

### CloudWatch Logs

Lambda logs are available in CloudWatch:

```bash
# View geocoding function logs
aws logs tail /aws/lambda/guia-turistico-geocode-reverse --follow

# View map credentials function logs
aws logs tail /aws/lambda/guia-turistico-map-credentials --follow
```

### CloudWatch Metrics

Monitor Lambda invocations, errors, and duration in CloudWatch console.

## Troubleshooting

### Lambda Function Not Found

**Error**: ResourceNotFoundException

**Solution**: Run `./backend/scripts/deploy-backend.sh` to create functions

### Permission Denied

**Error**: AccessDeniedException

**Solution**: Verify IAM role has correct policies attached

### CORS Errors

**Error**: No 'Access-Control-Allow-Origin' header

**Solution**: Update `ALLOWED_ORIGIN` in Lambda environment variables

### Geocoding Returns 404

**Error**: No address found

**Possible causes**:
- Coordinates are in the ocean or remote area
- Place Index data coverage limited
- AWS Location Service regional limitations

## Cleanup

To delete all AWS resources and avoid charges:

```bash
# Delete API Gateway
API_ID=$(jq -r '.apiId' backend/aws-config.json)
aws apigatewayv2 delete-api --api-id $API_ID

# Delete Lambda functions
aws lambda delete-function --function-name guia-turistico-geocode-reverse
aws lambda delete-function --function-name guia-turistico-map-credentials

# Delete Location Service resources
aws location delete-map --map-name guia-turistico-map
aws location delete-place-index --index-name guia-turistico-place-index

# Delete IAM resources
aws iam detach-role-policy --role-name guia-turistico-lambda-role \
  --policy-arn $(jq -r '.policyArn' backend/aws-config.json)
aws iam delete-policy --policy-arn $(jq -r '.policyArn' backend/aws-config.json)
aws iam delete-role --role-name guia-turistico-lambda-role
```

## Next Steps

After deploying the backend:

1. ✅ Test API endpoints
2. Install frontend dependencies: `npm install maplibre-gl`
3. Update frontend configuration with API endpoint
4. Implement frontend AWS provider classes
5. Test end-to-end integration

---

**Last Updated**: 2026-02-17  
**Version**: 0.10.0-alpha (planned)
