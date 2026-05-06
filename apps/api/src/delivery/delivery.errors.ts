export const DELIVERY_ERRORS = {
  "ADDRESS_NOT_FOUND": {
    statusCode: 404,
    message: "The provided address could not be found",
  },

  "ROUTE_NOT_FOUND": {
    statusCode: 404,
    message: "No route found between the specified origin and destination",
  },

  "ORS_SERVICE_UNAVAILABLE": {
    statusCode: 503,
    message: "OpenRouteService is currently unavailable. Please try again later.",
  },

  "GEOCODING_FAILED": {
    statusCode: 502,
    message: "Failed to geocode the provided address",
  },

  "ROUTING_FAILED": {
    statusCode: 502,
    message: "Failed to retrieve route from OpenRouteService",
  },

  "ORS_API_KEY_MISSING": {
    statusCode: 503,
    message: "OpenRouteService API key is not configured",
  }
}