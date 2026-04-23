import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { OpenRouteService } from '../src/delivery/openrouteservice.service';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; role: string };
}

interface StoreResponse {
  id: string;
  name: string;
}

interface ApiKeyResponse {
  id: string;
  apiKey: string;
}

describe('DeliveryPricingController', () => {
  let app: INestApplication<App>;

  const openRouteServiceMock = {
    resolveAddress: jest.fn(),
    getDrivingRoute: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(OpenRouteService)
      .useValue(openRouteServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    openRouteServiceMock.resolveAddress.mockResolvedValueOnce({
      latitude: 40,
      longitude: 74,
    });
    openRouteServiceMock.getDrivingRoute.mockResolvedValueOnce({
      distanceMeters: 2000,
      durationSeconds: 900,
    });
  });

  async function createMerchantApiKey() {
    const email = `Riku_Merchant_${Date.now()}@example.com`;
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register/merchant')
      .send({ email, password: 'password', name: 'Riku Merchant' })
      .expect(HttpStatus.CREATED);

    const auth = registerResponse.body as AuthResponse;
    const { accessToken } = auth;

    const storeRes = await request(app.getHttpServer())
      .post(`/merchants/${auth.user.id}/stores`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Test Store',
        address: 'Allee Condillac, 38400 Grenoble',
        latitude: 45.18,
        longitude: 5.72,
      })
      .expect(HttpStatus.CREATED);

    const storeId = (storeRes.body as StoreResponse).id;

    const apiKey1Res = await request(app.getHttpServer())
      .post(`/merchants/${auth.user.id}/api-keys`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test API Key', storeId })
      .expect(HttpStatus.CREATED);

    const apiKey2Res = await request(app.getHttpServer())
      .post(`/merchants/${auth.user.id}/api-keys`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Revoked API Key', storeId })
      .expect(HttpStatus.CREATED);

    const apiKey1 = apiKey1Res.body as ApiKeyResponse;
    const apiKey2 = apiKey2Res.body as ApiKeyResponse;

    await request(app.getHttpServer())
      .post(`/merchants/${auth.user.id}/api-keys/${apiKey2.id}/revoke`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    return {
      validKey: apiKey1.apiKey,
      validKeyId: apiKey1.id,
      revokedKey: apiKey2.apiKey,
      merchant: auth.user,
      email,
      accessToken,
    };
  }

  it('returns a delivery estimate for a valid API key', async () => {
    const rawKey = (await createMerchantApiKey()).validKey;

    const response = await request(app.getHttpServer())
      .post('/delivery-estimates')
      .set('x-api-key', rawKey)
      .send({
        pickupAddress: {
          fullAddress: '25 boulevard Clemenceau, 38100 Grenoble',
        },
        dropoffAddress: { fullAddress: 'Allee Condillac, 38000 Grenoble' },
        weightGrams: 2500,
      })
      .expect(HttpStatus.CREATED);

    expect(response.body).toMatchObject({ serviceable: true });
    expect(openRouteServiceMock.resolveAddress).toHaveBeenCalledTimes(2);
    expect(openRouteServiceMock.getDrivingRoute).toHaveBeenCalledTimes(1);
  });

  it('rejects an invalid API key', async () => {
    await request(app.getHttpServer())
      .post('/delivery-estimates')
      .set('x-api-key', 'bla bla bla bla')
      .send({
        pickupAddress: {
          fullAddress: '25 boulevard Clemenceau, 38100 Grenoble',
        },
        dropoffAddress: { fullAddress: 'Allee Condillac, 38000 Grenoble' },
        weightGrams: 2500,
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('rejects missing API key', async () => {
    await request(app.getHttpServer())
      .post('/delivery-estimates')
      .send({
        pickupAddress: {
          fullAddress: '25 boulevard Clemenceau, 38100 Grenoble',
        },
        dropoffAddress: { fullAddress: 'Allee Condillac, 38000 Grenoble' },
        weightGrams: 2500,
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('rejects revoked API key', async () => {
    const revokedRawKey = (await createMerchantApiKey()).revokedKey;
    await request(app.getHttpServer())
      .post('/delivery-estimates')
      .set('x-api-key', revokedRawKey)
      .send({
        pickupAddress: {
          fullAddress: '25 boulevard Clemenceau, 38100 Grenoble',
        },
        dropoffAddress: { fullAddress: 'Allee Condillac, 38000 Grenoble' },
        weightGrams: 2500,
      })
      .expect(HttpStatus.FORBIDDEN);
  });

  it('revokes an API key', async () => {
    const session = await createMerchantApiKey();
    const { email, merchant, validKey: validRawKey, validKeyId } = session;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ identifier: email, password: 'password' })
      .expect(HttpStatus.OK);

    const { accessToken } = loginRes.body as AuthResponse;

    await request(app.getHttpServer())
      .post(`/merchants/${merchant.id}/api-keys/${validKeyId}/revoke`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .post('/delivery-estimates')
      .set('x-api-key', validRawKey)
      .send({
        pickupAddress: {
          fullAddress: '25 boulevard Clemenceau, 38100 Grenoble',
        },
        dropoffAddress: { fullAddress: 'Allee Condillac, 38000 Grenoble' },
        weightGrams: 2500,
      })
      .expect(HttpStatus.FORBIDDEN);
  });
});
