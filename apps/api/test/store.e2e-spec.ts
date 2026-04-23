import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; role: string };
}

const storePayload = {
  name: "Riku's little store",
  description: 'A super pet store with croquettes and toys',
  address: 'Allee Condillac, 38400 Grenoble',
  latitude: 12,
  longitude: 40,
};

describe('Store CRUD (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  async function registerMerchant() {
    const email = `merchant_${Date.now()}@test.local`;
    const response = await request(app.getHttpServer())
      .post('/auth/register/merchant')
      .send({ email, password: 'Password123!', name: 'RikuLouLoup' })
      .expect(HttpStatus.CREATED);

    const body = response.body as AuthTokensResponse;
    return { accessToken: body.accessToken, merchantId: body.user.id };
  }

  async function createStore(accessToken: string, merchantId: string) {
    const response = await request(app.getHttpServer())
      .post(`/merchants/${merchantId}/stores`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(storePayload)
      .expect(HttpStatus.CREATED);

    return response.body as { id: string; name: string };
  }

  it('allows a merchant to create a store', async () => {
    const { accessToken, merchantId } = await registerMerchant();

    const response = await request(app.getHttpServer())
      .post(`/merchants/${merchantId}/stores`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(storePayload)
      .expect(HttpStatus.CREATED);

    const body = response.body as { id: string; name: string };
    expect(body.id).toBeDefined();
    expect(body.name).toBe(storePayload.name);
  });

  it('forbids a merchant from creating a store for another merchant', async () => {
    const { accessToken } = await registerMerchant(); // merchant 1
    const { merchantId: otherMerchantId } = await registerMerchant(); // merchant 2

    await request(app.getHttpServer())
      .post(`/merchants/${otherMerchantId}/stores`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(storePayload)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('allows a merchant to list their stores', async () => {
    const { accessToken, merchantId } = await registerMerchant();
    await createStore(accessToken, merchantId);

    const response = await request(app.getHttpServer())
      .get(`/merchants/${merchantId}/stores`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    const stores = response.body as { id: string; name: string }[];
    expect(Array.isArray(stores)).toBe(true);
    expect(stores.length).toBe(1);
    expect(stores[0].name).toBe(storePayload.name);
  });

  it('filters stores by isActive', async () => {
    const { accessToken, merchantId } = await registerMerchant();
    const store = await createStore(accessToken, merchantId);

    // disable the store
    await request(app.getHttpServer())
      .post(`/merchants/${merchantId}/stores/${store.id}/disable`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    const activeRes = await request(app.getHttpServer())
      .get(`/merchants/${merchantId}/stores?isActive=true`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    expect((activeRes.body as unknown[]).length).toBe(0);

    const inactiveRes = await request(app.getHttpServer())
      .get(`/merchants/${merchantId}/stores?isActive=false`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    expect((inactiveRes.body as unknown[]).length).toBe(1);
  });

  it('allows a merchant to get a specific store', async () => {
    const { accessToken, merchantId } = await registerMerchant();
    const store = await createStore(accessToken, merchantId);

    const response = await request(app.getHttpServer())
      .get(`/merchants/${merchantId}/stores/${store.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    const storeBody = response.body as { id: string; name: string };
    expect(storeBody.id).toBe(store.id);
    expect(storeBody.name).toBe(storePayload.name);
  });

  it('returns 404 for unknown store', async () => {
    const { accessToken, merchantId } = await registerMerchant();

    await request(app.getHttpServer())
      .get(
        `/merchants/${merchantId}/stores/00000000-0000-0000-0000-000000000000`,
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('allows a merchant to update a store', async () => {
    const { accessToken, merchantId } = await registerMerchant();
    const store = await createStore(accessToken, merchantId);

    const response = await request(app.getHttpServer())
      .patch(`/merchants/${merchantId}/stores/${store.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Updated Store Name' })
      .expect(HttpStatus.OK);

    expect((response.body as { name: string }).name).toBe('Updated Store Name');
  });

  it('allows a merchant to disable and re-enable a store', async () => {
    const { accessToken, merchantId } = await registerMerchant();
    const store = await createStore(accessToken, merchantId);

    await request(app.getHttpServer())
      .post(`/merchants/${merchantId}/stores/${store.id}/disable`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    const disabled = await prisma.store.findUnique({ where: { id: store.id } });
    expect(disabled?.isActive).toBe(false);

    await request(app.getHttpServer())
      .post(`/merchants/${merchantId}/stores/${store.id}/enable`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    const enabled = await prisma.store.findUnique({ where: { id: store.id } });
    expect(enabled?.isActive).toBe(true);
  });

  it('allows a merchant to delete a store', async () => {
    const { accessToken, merchantId } = await registerMerchant();
    const store = await createStore(accessToken, merchantId);

    await request(app.getHttpServer())
      .delete(`/merchants/${merchantId}/stores/${store.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    const deleted = await prisma.store.findUnique({ where: { id: store.id } });
    expect(deleted).toBeNull();
  });

  it('forbids a non-merchant from accessing store endpoints', async () => {
    const { merchantId } = await registerMerchant();

    // register a driver
    const driverRes = await request(app.getHttpServer())
      .post('/auth/register/driver')
      .send({
        email: `driver_${Date.now()}@test.local`,
        password: 'Password123!',
        firstName: 'Riku',
        lastName: 'Driver',
        phone: `+336${Date.now().toString().slice(-8)}`,
        gender: 'MALE',
        dateOfBirth: '2000-01-02',
        address: '22 boulevard Clemenceau, 38000 Grenoble',
        deliveryCity: 'Grenoble',
        deliveryRadius: 10,
        transportType: 'BIKE',
      })
      .expect(HttpStatus.CREATED);

    const driverToken = (driverRes.body as AuthTokensResponse).accessToken;

    await request(app.getHttpServer())
      .get(`/merchants/${merchantId}/stores`)
      .set('Authorization', `Bearer ${driverToken}`)
      .expect(HttpStatus.FORBIDDEN);
  });
});
