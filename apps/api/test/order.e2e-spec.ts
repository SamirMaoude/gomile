import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotificationService } from '../src/notification/notification.service';
import { SmsService } from '../src/sms/sms.service';
import { OpenRouteService } from '../src/delivery/openrouteservice.service';
import { OutboundWebhookService } from '../src/webhook/outbound-webhook.service';
import { EmailService } from '../src/emails/email.service';
import { UploadService } from '../src/upload/upload.service';
import { SubscriptionService } from '../src/subscription/subscription.service';

interface AuthResponse {
  accessToken: string;
  user: { id: string; email: string; role: string };
}

interface StoreResponse {
  id: string;
  name: string;
}

interface OrderResponse {
  orderId: string;
  deliveryCode: string;
  deliveryFee: number;
  reward: number;
  distanceKm: number;
}

interface AcceptResponse {
  pickupCode: string;
  message: string;
}

const STORE_ADDRESS = 'Allee Condillac, 38400 Grenoble';

function driverPayload(email: string) {
  return {
    email,
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'Driver',
    avatarUrl: 'https://example.test/avatar/driver.jpg',
    gender: 'MALE',
    phone: `+336${Date.now().toString().slice(-8)}`,
    dateOfBirth: '1995-06-15',
    address: '10 rue Voltaire, 38000 Grenoble',
    deliveryCity: 'Grenoble',
    deliveryRadius: 50,
    transportType: 'BIKE',
  };
}

describe('Order lifecycle (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const notificationMock = { notifyDrivers: jest.fn().mockResolvedValue(undefined), putExpoToken: jest.fn().mockResolvedValue(undefined) };
  const smsMock = { sendSms: jest.fn().mockResolvedValue(undefined) };
  const orsMock = {
    geocodeAddress: jest.fn().mockResolvedValue({ latitude: 45.188, longitude: 5.724 }),
    resolveAddress: jest.fn().mockResolvedValue({ latitude: 45.188, longitude: 5.724 }),
    getDrivingRoute: jest.fn().mockResolvedValue({ distanceMeters: 3000, durationSeconds: 600 }),
  };
  const webhookMock = { fireOrderEvent: jest.fn() };
  const subscriptionMock = {
    createCheckoutSession: jest.fn(),
    createPortalSession: jest.fn(),
    handleWebhook: jest.fn(),
    syncStoreLocks: jest.fn(),
  };
  const uploadMock = {
    presign: jest.fn().mockResolvedValue({ uploadUrl: 'https://s3.test/upload', fileUrl: 'https://s3.test/file', viewUrl: 'https://s3.test/file' }),
    deleteFile: jest.fn(),
    commitFile: jest.fn().mockImplementation((url: string) => Promise.resolve(url.replace('uploads/', 'documents/'))),
    getSignedDownloadUrl: jest.fn().mockImplementation((url: string) => Promise.resolve(url)),
  };
  const emailMock = {
    sendPasswordReset: jest.fn(),
    sendVerificationEmail: jest.fn(),
    sendTrialExpiring: jest.fn(),
    sendAccountLocked: jest.fn(),
    sendSubscriptionRenewing: jest.fn(),
    sendPaymentFailed: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(NotificationService).useValue(notificationMock)
      .overrideProvider(SmsService).useValue(smsMock)
      .overrideProvider(OpenRouteService).useValue(orsMock)
      .overrideProvider(OutboundWebhookService).useValue(webhookMock)
      .overrideProvider(EmailService).useValue(emailMock)
      .overrideProvider(UploadService).useValue(uploadMock)
      .overrideProvider(SubscriptionService).useValue(subscriptionMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    orsMock.geocodeAddress.mockResolvedValue({ latitude: 45.188, longitude: 5.724 });
    orsMock.resolveAddress.mockResolvedValue({ latitude: 45.188, longitude: 5.724 });
    orsMock.getDrivingRoute.mockResolvedValue({ distanceMeters: 3000, durationSeconds: 600 });
  });

  // ── helpers ──────────────────────────────────────────────────────────────

  async function registerMerchant() {
    const email = `merchant_order_${Date.now()}@test.local`;
    const res = await request(app.getHttpServer())
      .post('/auth/register/merchant')
      .send({ email, password: 'Password123!', name: 'Order Merchant' })
      .expect(HttpStatus.CREATED);
    const body = res.body as AuthResponse;
    await prisma.user.update({ where: { id: body.user.id }, data: { emailVerified: true } });
    return body;
  }

  async function registerDriver() {
    const email = `driver_order_${Date.now()}@test.local`;
    const res = await request(app.getHttpServer())
      .post('/auth/register/driver')
      .send(driverPayload(email))
      .expect(HttpStatus.CREATED);
    const body = res.body as AuthResponse;
    await prisma.user.update({ where: { id: body.user.id }, data: { emailVerified: true } });
    return body;
  }

  async function createStore(merchantToken: string, merchantId: string) {
    const res = await request(app.getHttpServer())
      .post(`/merchants/${merchantId}/stores`)
      .set('Authorization', `Bearer ${merchantToken}`)
      .send({ name: 'Test Store', address: STORE_ADDRESS, latitude: 45.188, longitude: 5.724 })
      .expect(HttpStatus.CREATED);
    return res.body as StoreResponse;
  }

  async function createOrder(merchantToken: string, merchantId: string, storeId: string) {
    const res = await request(app.getHttpServer())
      .post(`/merchants/${merchantId}/stores/${storeId}/orders`)
      .set('Authorization', `Bearer ${merchantToken}`)
      .send({
        customerName: 'Alice Martin',
        customerPhone: '+33612345678',
        dropOffAddress: '5 place Victor Hugo, 38000 Grenoble',
        type: 'FOOD',
        packageSize: 'SMALL',
      })
      .expect(HttpStatus.CREATED);
    return res.body as OrderResponse;
  }

  async function makeDriverAvailable(driverToken: string) {
    await request(app.getHttpServer())
      .patch('/driver/me/availability')
      .set('Authorization', `Bearer ${driverToken}`)
      .expect(HttpStatus.OK);
  }

  // ── happy path ────────────────────────────────────────────────────────────

  it('full delivery lifecycle: create → accept → handshake A → handshake B → wallet credited', async () => {
    const merchant = await registerMerchant();
    const driver = await registerDriver();
    const store = await createStore(merchant.accessToken, merchant.user.id);

    // driver must be AVAILABLE to receive missions
    await makeDriverAvailable(driver.accessToken);

    // merchant creates order — pickupCode is NOT in the response, deliveryCode is
    const order = await createOrder(merchant.accessToken, merchant.user.id, store.id);
    expect(order.orderId).toBeDefined();
    expect(order.deliveryCode).toMatch(/^\d{6}$/);
    expect(order.deliveryFee).toBeGreaterThan(0);
    expect(order.distanceKm).toBeCloseTo(3, 0);

    // SMS sent on order creation (customer notified order was received)
    expect(smsMock.sendSms).toHaveBeenCalledTimes(1);

    // driver accepts the mission — pickupCode is returned in the accept response
    const acceptRes = await request(app.getHttpServer())
      .post(`/driver/me/missions/${order.orderId}/accept`)
      .set('Authorization', `Bearer ${driver.accessToken}`)
      .expect(HttpStatus.OK);
    const { pickupCode } = acceptRes.body as AcceptResponse;
    expect(pickupCode).toMatch(/^\d{6}$/);

    // no additional SMS on accept
    expect(smsMock.sendSms).toHaveBeenCalledTimes(1);

    const dbOrder = await prisma.order.findUnique({ where: { id: order.orderId } });
    expect(dbOrder?.status).toBe('DRIVER_ACCEPTED');
    expect(dbOrder?.driverId).toBe(driver.user.id);

    // merchant verifies handshake A (enters the pickupCode the driver shows)
    await request(app.getHttpServer())
      .post(`/merchants/${merchant.user.id}/stores/${store.id}/orders/handshake/verify`)
      .set('Authorization', `Bearer ${merchant.accessToken}`)
      .send({ code: pickupCode })
      .expect(HttpStatus.OK);

    // SMS sent to customer with their delivery code (order on the way)
    expect(smsMock.sendSms).toHaveBeenCalledTimes(2);

    const afterPickup = await prisma.order.findUnique({ where: { id: order.orderId } });
    expect(afterPickup?.status).toBe('PICKED_UP');

    // driver verifies handshake B (enters customer's delivery code)
    const deliverRes = await request(app.getHttpServer())
      .post(`/driver/me/missions/${order.orderId}/handshake/client/verify`)
      .set('Authorization', `Bearer ${driver.accessToken}`)
      .send({ code: order.deliveryCode })
      .expect(HttpStatus.OK);
    expect((deliverRes.body as { message: string }).message).toBeDefined();

    const afterDelivery = await prisma.order.findUnique({ where: { id: order.orderId } });
    expect(afterDelivery?.status).toBe('DELIVERED');

    // wallet credited with reward amount
    const wallet = await prisma.wallet.findUnique({ where: { driverId: driver.user.id } });
    expect(wallet?.balance).toBeGreaterThan(0);

    // outbound webhook triggered for accepted + delivered (merchant verify doesn't fire it)
    expect(webhookMock.fireOrderEvent).toHaveBeenCalledTimes(2);
  });

  // ── cancellation ──────────────────────────────────────────────────────────

  it('merchant can cancel an order before pickup', async () => {
    const merchant = await registerMerchant();
    const store = await createStore(merchant.accessToken, merchant.user.id);
    const order = await createOrder(merchant.accessToken, merchant.user.id, store.id);

    await request(app.getHttpServer())
      .post(`/merchants/${merchant.user.id}/orders/${order.orderId}/cancel`)
      .set('Authorization', `Bearer ${merchant.accessToken}`)
      .expect(HttpStatus.OK);

    const dbOrder = await prisma.order.findUnique({ where: { id: order.orderId } });
    expect(dbOrder?.status).toBe('CANCELLED');
  });

  it('merchant cannot cancel an order that is already picked up', async () => {
    const merchant = await registerMerchant();
    const driver = await registerDriver();
    const store = await createStore(merchant.accessToken, merchant.user.id);
    await makeDriverAvailable(driver.accessToken);
    const order = await createOrder(merchant.accessToken, merchant.user.id, store.id);

    const acceptRes = await request(app.getHttpServer())
      .post(`/driver/me/missions/${order.orderId}/accept`)
      .set('Authorization', `Bearer ${driver.accessToken}`)
      .expect(HttpStatus.OK);
    const { pickupCode } = acceptRes.body as AcceptResponse;

    await request(app.getHttpServer())
      .post(`/merchants/${merchant.user.id}/stores/${store.id}/orders/handshake/verify`)
      .set('Authorization', `Bearer ${merchant.accessToken}`)
      .send({ code: pickupCode })
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .post(`/merchants/${merchant.user.id}/orders/${order.orderId}/cancel`)
      .set('Authorization', `Bearer ${merchant.accessToken}`)
      .expect(HttpStatus.CONFLICT);
  });

  // ── concurrency guard ─────────────────────────────────────────────────────

  it('second driver cannot accept a mission already taken (409)', async () => {
    const merchant = await registerMerchant();
    const driver1 = await registerDriver();
    const driver2 = await registerDriver();
    const store = await createStore(merchant.accessToken, merchant.user.id);
    await makeDriverAvailable(driver1.accessToken);
    await makeDriverAvailable(driver2.accessToken);
    const order = await createOrder(merchant.accessToken, merchant.user.id, store.id);

    await request(app.getHttpServer())
      .post(`/driver/me/missions/${order.orderId}/accept`)
      .set('Authorization', `Bearer ${driver1.accessToken}`)
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .post(`/driver/me/missions/${order.orderId}/accept`)
      .set('Authorization', `Bearer ${driver2.accessToken}`)
      .expect(HttpStatus.CONFLICT);
  });

  // ── handshake validation ──────────────────────────────────────────────────

  it('wrong handshake code via driver endpoint returns 401 and decrements remaining attempts', async () => {
    const merchant = await registerMerchant();
    const driver = await registerDriver();
    const store = await createStore(merchant.accessToken, merchant.user.id);
    await makeDriverAvailable(driver.accessToken);
    const order = await createOrder(merchant.accessToken, merchant.user.id, store.id);

    await request(app.getHttpServer())
      .post(`/driver/me/missions/${order.orderId}/accept`)
      .set('Authorization', `Bearer ${driver.accessToken}`)
      .expect(HttpStatus.OK);

    // driver enters a wrong pickup code — driver verify endpoint decrements attempts
    await request(app.getHttpServer())
      .post(`/driver/me/missions/${order.orderId}/handshake/merchant/verify`)
      .set('Authorization', `Bearer ${driver.accessToken}`)
      .send({ code: '000000' })
      .expect(HttpStatus.UNAUTHORIZED);

    const handshake = await prisma.handshake.findFirst({
      where: { orderId: order.orderId, type: 'A' },
    });
    expect(handshake?.remainingAttemps).toBe(2);
  });

  it('exhausting 3 wrong handshake attempts returns 429', async () => {
    const merchant = await registerMerchant();
    const driver = await registerDriver();
    const store = await createStore(merchant.accessToken, merchant.user.id);
    await makeDriverAvailable(driver.accessToken);
    const order = await createOrder(merchant.accessToken, merchant.user.id, store.id);

    await request(app.getHttpServer())
      .post(`/driver/me/missions/${order.orderId}/accept`)
      .set('Authorization', `Bearer ${driver.accessToken}`)
      .expect(HttpStatus.OK);

    // first 3 wrong attempts decrement from 3 → 0 (each returns 401)
    for (let i = 0; i < 3; i++) {
      await request(app.getHttpServer())
        .post(`/driver/me/missions/${order.orderId}/handshake/merchant/verify`)
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .send({ code: '000000' })
        .expect(HttpStatus.UNAUTHORIZED);
    }

    // 4th attempt: remainingAttemps already 0 → 429
    await request(app.getHttpServer())
      .post(`/driver/me/missions/${order.orderId}/handshake/merchant/verify`)
      .set('Authorization', `Bearer ${driver.accessToken}`)
      .send({ code: '000000' })
      .expect(HttpStatus.TOO_MANY_REQUESTS);
  });

  // ── order listing ─────────────────────────────────────────────────────────

  it('merchant can list their orders', async () => {
    const merchant = await registerMerchant();
    const store = await createStore(merchant.accessToken, merchant.user.id);
    await createOrder(merchant.accessToken, merchant.user.id, store.id);
    await createOrder(merchant.accessToken, merchant.user.id, store.id);

    const res = await request(app.getHttpServer())
      .get(`/merchants/${merchant.user.id}/orders`)
      .set('Authorization', `Bearer ${merchant.accessToken}`)
      .expect(HttpStatus.OK);

    const orders = res.body as unknown[];
    expect(Array.isArray(orders)).toBe(true);
    expect(orders.length).toBe(2);
  });

  it('merchant can get a specific order by id', async () => {
    const merchant = await registerMerchant();
    const store = await createStore(merchant.accessToken, merchant.user.id);
    const order = await createOrder(merchant.accessToken, merchant.user.id, store.id);

    const res = await request(app.getHttpServer())
      .get(`/merchants/${merchant.user.id}/orders/${order.orderId}`)
      .set('Authorization', `Bearer ${merchant.accessToken}`)
      .expect(HttpStatus.OK);

    expect((res.body as { orderId: string }).orderId).toBe(order.orderId);
  });

  it('returns 403 when merchant accesses another merchant orders', async () => {
    const m1 = await registerMerchant();
    const m2 = await registerMerchant();

    await request(app.getHttpServer())
      .get(`/merchants/${m2.user.id}/orders`)
      .set('Authorization', `Bearer ${m1.accessToken}`)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('driver can view their mission history after delivery', async () => {
    const merchant = await registerMerchant();
    const driver = await registerDriver();
    const store = await createStore(merchant.accessToken, merchant.user.id);
    await makeDriverAvailable(driver.accessToken);
    const order = await createOrder(merchant.accessToken, merchant.user.id, store.id);

    const acceptRes = await request(app.getHttpServer())
      .post(`/driver/me/missions/${order.orderId}/accept`)
      .set('Authorization', `Bearer ${driver.accessToken}`)
      .expect(HttpStatus.OK);
    const { pickupCode } = acceptRes.body as AcceptResponse;

    await request(app.getHttpServer())
      .post(`/merchants/${merchant.user.id}/stores/${store.id}/orders/handshake/verify`)
      .set('Authorization', `Bearer ${merchant.accessToken}`)
      .send({ code: pickupCode })
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .post(`/driver/me/missions/${order.orderId}/handshake/client/verify`)
      .set('Authorization', `Bearer ${driver.accessToken}`)
      .send({ code: order.deliveryCode })
      .expect(HttpStatus.OK);

    const histRes = await request(app.getHttpServer())
      .get('/driver/me/missions/history')
      .set('Authorization', `Bearer ${driver.accessToken}`)
      .expect(HttpStatus.OK);

    const history = histRes.body as { id: string }[];
    expect(history.some((o) => o.id === order.orderId)).toBe(true);
  });

  // ── driver rejection ──────────────────────────────────────────────────────

  it('driver can reject a mission; it no longer appears in available list', async () => {
    const merchant = await registerMerchant();
    const driver = await registerDriver();
    const store = await createStore(merchant.accessToken, merchant.user.id);
    await makeDriverAvailable(driver.accessToken);
    const order = await createOrder(merchant.accessToken, merchant.user.id, store.id);

    await request(app.getHttpServer())
      .post(`/driver/me/missions/${order.orderId}/reject`)
      .set('Authorization', `Bearer ${driver.accessToken}`)
      .expect(HttpStatus.OK);

    const rejection = await prisma.driverOrderRejection.findUnique({
      where: { driverId_orderId: { driverId: driver.user.id, orderId: order.orderId } },
    });
    expect(rejection).not.toBeNull();
  });

  // ── auth guards ───────────────────────────────────────────────────────────

  it('unauthenticated request is rejected', async () => {
    await request(app.getHttpServer())
      .get('/driver/me/missions/available')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('driver cannot access merchant order endpoints', async () => {
    const merchant = await registerMerchant();
    const driver = await registerDriver();
    const store = await createStore(merchant.accessToken, merchant.user.id);

    await request(app.getHttpServer())
      .get(`/merchants/${merchant.user.id}/orders`)
      .set('Authorization', `Bearer ${driver.accessToken}`)
      .expect(HttpStatus.FORBIDDEN);

    await request(app.getHttpServer())
      .post(`/merchants/${merchant.user.id}/stores/${store.id}/orders`)
      .set('Authorization', `Bearer ${driver.accessToken}`)
      .send({
        customerName: 'X',
        customerPhone: '+33600000000',
        dropOffAddress: '1 rue Test',
        type: 'FOOD',
      })
      .expect(HttpStatus.FORBIDDEN);
  });
});
