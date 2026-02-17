// AWS Lambda Function: Map Credentials
// Returns map configuration for MapLibre GL

/**
 * Lambda handler for map credentials
 * @param {Object} event - API Gateway event
 * @returns {Object} API Gateway response
 */
exports.handler = async (event) => {
  console.log('Map credentials request:', event);

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
    // Return map configuration
    const mapConfig = {
      mapName: process.env.MAP_NAME,
      region: process.env.AWS_REGION,
      style: 'VectorEsriNavigation',
      
      // Map configuration for MapLibre GL
      mapLibre: {
        version: '4.0.0',
        styleUrl: `https://maps.geo.${process.env.AWS_REGION}.amazonaws.com/maps/v0/maps/${process.env.MAP_NAME}/style-descriptor`,
      },
      
      // Default map settings
      defaults: {
        center: [-46.633309, -23.550520], // São Paulo, Brazil [lng, lat]
        zoom: 12,
        pitch: 0,
        bearing: 0,
      },
      
      // Brazilian cities for testing
      brazilianCities: {
        saoPaulo: [-46.633309, -23.550520],
        rio: [-43.172896, -22.906847],
        recife: [-34.876789, -8.047562],
        brasilia: [-47.882166, -15.793889],
        bh: [-43.937778, -19.916667],
      },
    };

    console.log('Returning map config:', mapConfig);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(mapConfig),
    };
  } catch (error) {
    console.error('Map credentials error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message || 'Failed to retrieve map configuration',
      }),
    };
  }
};
