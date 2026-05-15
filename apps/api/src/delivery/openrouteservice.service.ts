import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { createApiError } from 'src/common/api-error';
import { API_ERRORS } from '../common/errors';

type Coordinates = {
  latitude: number;
  longitude: number;
};

type RouteResult = {
  distanceMeters: number;
  durationSeconds: number;
};

type OrsDirectionsResponse = {
  routes?: Array<{
    summary?: {
      distance: number;
      duration: number;
    };
  }>;
};

type OrsGeocodeResponse = {
  features?: Array<{
    geometry?: {
      coordinates?: [number, number];
    };
  }>;
};

@Injectable()
export class OpenRouteService {
  private readonly logger = new Logger(OpenRouteService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  // API key for OpenRouteService should be configured in env file
  private get apiKey() {
    const apiKey = this.configService.get<string>('ORS_API_KEY');

    if (!apiKey) {
      throw new ServiceUnavailableException(createApiError('ORS_API_KEY_MISSING', API_ERRORS));
    }

    return apiKey;
  }

  private get baseUrl() {
    return (
      this.configService.get<string>('ORS_BASE_URL') ??
      'https://api.openrouteservice.org'
    );
  }

  // Geocoding, return latitude and longitude based on an address
  async geocodeAddress(address: string): Promise<Coordinates> {
    // if already cached in redis, reuse it
    const key = this.geocodeKey(address);
    const cached = await this.redisService.getJson<Coordinates>(key);
    if (cached) {
      this.logger.log(`Geocode cache hit: ${key}`);
      return cached;
    }
    this.logger.log(`Geocode cache miss: ${key}`);

    // build url
    const url = new URL('/geocode/search', this.baseUrl);
    url.searchParams.set('api_key', this.apiKey);
    url.searchParams.set('text', address);
    url.searchParams.set('size', '1');
    url.searchParams.set('boundary.country', 'FRA');

    let response: Response;
    try {
      response = await fetch(url.toString());
    } catch {
      throw new BadGatewayException(createApiError('ORS_SERVICE_UNAVAILABLE', API_ERRORS)
      );
    }

    if (!response.ok) {
      throw new BadGatewayException(createApiError('GEOCODING_FAILED', API_ERRORS));
    }

    const data = (await response.json()) as OrsGeocodeResponse;
    const coordinates = data.features?.[0]?.geometry?.coordinates;

    if (!coordinates) {
      throw new NotFoundException(createApiError('ADDRESS_NOT_FOUND', API_ERRORS));
    }

    const result = {
      longitude: coordinates[0],
      latitude: coordinates[1],
    };

    await this.redisService.setJson(key, result);

    return result;
  }

  // if latitude and longitude is provided by plugin, if not we use geocoding
  async resolveAddress(input: {
    fullAddress: string;
    latitude?: number;
    longitude?: number;
  }) {
    if (
      typeof input.latitude === 'number' &&
      typeof input.longitude === 'number'
    ) {
      return {
        latitude: input.latitude,
        longitude: input.longitude,
      };
    }

    return this.geocodeAddress(input.fullAddress);
  }

  // retrieve distance in driving between two addresses, but this api call also returns
  // directions, perhaps helpful for mobile ?
  async getDrivingRoute(
    pickup: Coordinates,
    dropoff: Coordinates,
  ): Promise<RouteResult> {
    // cache look up
    const key = this.routeKey(pickup, dropoff);
    const cached = await this.redisService.getJson<RouteResult>(key);
    if (cached) {
      this.logger.log(`Route cache hit: ${key}`);
      return cached;
    }
    this.logger.log(`Route cache miss: ${key}`);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/v2/directions/driving-car/json`, {
        method: 'POST',
        headers: {
          Authorization: this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: [
            [pickup.longitude, pickup.latitude],
            [dropoff.longitude, dropoff.latitude],
          ],
        }),
      });
    } catch {
      throw new BadGatewayException(createApiError('ORS_SERVICE_UNAVAILABLE', API_ERRORS));
    }

    if (!response.ok) {
      throw new BadGatewayException(createApiError('ROUTING_FAILED', API_ERRORS));
    }

    const data = (await response.json()) as OrsDirectionsResponse;
    const summary = data.routes?.[0]?.summary;

    if (!summary) {
      throw new NotFoundException(createApiError('ROUTE_NOT_FOUND', API_ERRORS));
    }

    const result = {
      distanceMeters: summary.distance,
      durationSeconds: summary.duration,
    };

    // cache it
    await this.redisService.setJson(key, result);

    return result;
  }

  // Normalize the address from front end to cache in redis
  private normalizeAddress(address: string) {
    return address.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  private geocodeKey(address: string) {
    return `ors:geocode:${this.normalizeAddress(address)}`;
  }

  private routeKey(pickup: Coordinates, dropoff: Coordinates) {
    return `ors:route:${pickup.longitude.toFixed(6)},${pickup.latitude.toFixed(6)}:${dropoff.longitude.toFixed(6)},${dropoff.latitude.toFixed(6)}`;
  }
}
