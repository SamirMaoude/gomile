import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { BadGatewayException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { OpenRouteService } from 'src/delivery/openrouteservice.service';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/redis/redis.service';

jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

const mockConfig = {
  get: jest.fn().mockImplementation((key: string) => {
    if (key === 'ORS_API_KEY') return 'test-api-key';
    if (key === 'ORS_BASE_URL') return 'https://api.openrouteservice.org';
    return undefined;
  }),
};

const mockRedis = {
  getJson: jest.fn().mockResolvedValue(null),
  setJson: jest.fn().mockResolvedValue(undefined),
};

describe('OpenRouteService', () => {
  let service: OpenRouteService;
  let fetchMock: jest.SpyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Restore config mock after any test that overrides it
    mockConfig.get.mockImplementation((key: string) => {
      if (key === 'ORS_API_KEY') return 'test-api-key';
      if (key === 'ORS_BASE_URL') return 'https://api.openrouteservice.org';
      return undefined;
    });
    mockRedis.getJson.mockResolvedValue(null);

    fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenRouteService,
        { provide: ConfigService, useValue: mockConfig },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get(OpenRouteService);
  });

  afterEach(() => fetchMock.mockRestore());

  describe('geocodeAddress', () => {
    const geocodeResponse = {
      features: [{ geometry: { coordinates: [2.3522, 48.8566] } }],
    };

    it('returns coordinates from ORS API', async () => {
      fetchMock.mockResolvedValue({ ok: true, json: async () => geocodeResponse } as Response);

      const result = await service.geocodeAddress('1 Rue de Rivoli, Paris');
      expect(result.latitude).toBeCloseTo(48.8566);
      expect(result.longitude).toBeCloseTo(2.3522);
    });

    it('caches result in redis after first call', async () => {
      fetchMock.mockResolvedValue({ ok: true, json: async () => geocodeResponse } as Response);
      await service.geocodeAddress('1 Rue de Rivoli, Paris');
      expect(mockRedis.setJson).toHaveBeenCalled();
    });

    it('returns cached coordinates without calling fetch', async () => {
      mockRedis.getJson.mockResolvedValue({ latitude: 48.8566, longitude: 2.3522 });
      const result = await service.geocodeAddress('1 Rue de Rivoli, Paris');
      expect(fetchMock).not.toHaveBeenCalled();
      expect(result.latitude).toBeCloseTo(48.8566);
    });

    it('throws BadGatewayException when ORS returns non-ok response', async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 429 } as Response);
      await expect(service.geocodeAddress('bad address')).rejects.toThrow(BadGatewayException);
    });

    it('throws BadGatewayException when fetch throws (network error)', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));
      await expect(service.geocodeAddress('bad address')).rejects.toThrow(BadGatewayException);
    });

    it('throws NotFoundException when ORS returns no features', async () => {
      fetchMock.mockResolvedValue({ ok: true, json: async () => ({ features: [] }) } as Response);
      await expect(service.geocodeAddress('nowhere')).rejects.toThrow(NotFoundException);
    });

    it('throws ServiceUnavailableException when ORS_API_KEY is missing', async () => {
      mockConfig.get.mockReturnValue(undefined);
      await expect(service.geocodeAddress('Paris')).rejects.toThrow(ServiceUnavailableException);
    });
  });

  describe('resolveAddress', () => {
    it('returns provided lat/lng without geocoding when both are given', async () => {
      const result = await service.resolveAddress({ fullAddress: 'ignored', latitude: 48.9, longitude: 2.4 });
      expect(result.latitude).toBe(48.9);
      expect(result.longitude).toBe(2.4);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('geocodes when coordinates are not provided', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ features: [{ geometry: { coordinates: [2.35, 48.85] } }] }),
      } as Response);
      const result = await service.resolveAddress({ fullAddress: '1 Rue Test' });
      expect(result.latitude).toBeCloseTo(48.85);
    });
  });

  describe('getDrivingRoute', () => {
    const routeResponse = {
      routes: [{ summary: { distance: 5000, duration: 600 } }],
    };
    const pickup = { latitude: 48.85, longitude: 2.35 };
    const dropoff = { latitude: 48.87, longitude: 2.37 };

    it('returns distance and duration from ORS API', async () => {
      fetchMock.mockResolvedValue({ ok: true, json: async () => routeResponse } as Response);
      const result = await service.getDrivingRoute(pickup, dropoff);
      expect(result.distanceMeters).toBe(5000);
      expect(result.durationSeconds).toBe(600);
    });

    it('caches result after first call', async () => {
      fetchMock.mockResolvedValue({ ok: true, json: async () => routeResponse } as Response);
      await service.getDrivingRoute(pickup, dropoff);
      expect(mockRedis.setJson).toHaveBeenCalled();
    });

    it('returns cached route without calling fetch', async () => {
      mockRedis.getJson.mockResolvedValue({ distanceMeters: 5000, durationSeconds: 600 });
      const result = await service.getDrivingRoute(pickup, dropoff);
      expect(fetchMock).not.toHaveBeenCalled();
      expect(result.distanceMeters).toBe(5000);
    });

    it('throws BadGatewayException when ORS returns non-ok', async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 500 } as Response);
      await expect(service.getDrivingRoute(pickup, dropoff)).rejects.toThrow(BadGatewayException);
    });

    it('throws BadGatewayException when fetch throws', async () => {
      fetchMock.mockRejectedValue(new Error('timeout'));
      await expect(service.getDrivingRoute(pickup, dropoff)).rejects.toThrow(BadGatewayException);
    });

    it('throws NotFoundException when no routes in response', async () => {
      fetchMock.mockResolvedValue({ ok: true, json: async () => ({ routes: [] }) } as Response);
      await expect(service.getDrivingRoute(pickup, dropoff)).rejects.toThrow(NotFoundException);
    });
  });
});
