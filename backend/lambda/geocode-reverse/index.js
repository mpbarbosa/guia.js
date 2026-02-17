// AWS Lambda Function: Reverse Geocoding
// Converts coordinates to addresses using AWS Location Service

const {
  LocationClient,
  SearchPlaceIndexForPositionCommand,
} = require('@aws-sdk/client-location');

// Initialize AWS Location Service client
const locationClient = new LocationClient({ region: process.env.AWS_REGION });

/**
 * Lambda handler for reverse geocoding
 * @param {Object} event - API Gateway event
 * @returns {Object} API Gateway response
 */
exports.handler = async (event) => {
  console.log('Reverse geocoding request:', event);

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { latitude, longitude } = body;

    // Validate input
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid coordinates',
          message: 'Latitude must be between -90 and 90, longitude between -180 and 180',
        }),
      };
    }

    // Call AWS Location Service
    const command = new SearchPlaceIndexForPositionCommand({
      IndexName: process.env.PLACE_INDEX_NAME,
      Position: [longitude, latitude], // AWS uses [lng, lat] order
      MaxResults: 1,
      Language: 'pt-BR', // Brazilian Portuguese
    });

    console.log('Calling AWS Location Service:', {
      latitude,
      longitude,
      placeIndex: process.env.PLACE_INDEX_NAME,
    });

    const response = await locationClient.send(command);

    // Check if results were found
    if (!response.Results || response.Results.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: 'No address found',
          message: 'No address found for the given coordinates',
        }),
      };
    }

    // Extract first result
    const place = response.Results[0].Place;

    // Format response
    const formattedResponse = {
      provider: 'aws-location-service',
      coordinates: {
        latitude,
        longitude,
      },
      address: {
        label: place.Label,
        street: place.Street,
        addressNumber: place.AddressNumber,
        neighborhood: place.Neighborhood,
        municipality: place.Municipality,
        subRegion: place.SubRegion,
        region: place.Region,
        country: place.Country,
        postalCode: place.PostalCode,
        interpolated: place.Interpolated || false,
      },
      geometry: place.Geometry,
      raw: place, // Include raw response for debugging
    };

    console.log('Successfully geocoded:', formattedResponse);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(formattedResponse),
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);

    // Handle specific AWS errors
    if (error.name === 'ResourceNotFoundException') {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Configuration error',
          message: 'AWS Location Service resources not found',
        }),
      };
    }

    if (error.name === 'AccessDeniedException') {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Permission error',
          message: 'Lambda function lacks permissions to access Location Service',
        }),
      };
    }

    // Generic error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message || 'Failed to geocode coordinates',
      }),
    };
  }
};
