import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
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

function driverPayload(email: string) {
  return {
    email,
    password: 'Password123!',
    firstName: 'Admin',
    lastName: 'TestDriver',
    avatarUrl: 'https://example.test/avatar/admin-driver.jpg',
    gender: 'FEMALE',
    phone: `+336${Date.now().toString().slice(-8)}`,
    dateOfBirth: '1990-01-01',
    address: '3 avenue Alsace-Lorraine, 38000 Grenoble',
    deliveryCity: 'Grenoble',
    deliveryRadius: 15,
    transportType: 'CAR',
  };
}

describe('Admin endpoints (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const notificationMock = { notifyDrivers: jest.fn().mockResolvedValue(undefined), putExpoToken: jest.fn().mockResolvedValue(undefined) };
  const smsMock = { sendSms: jest.fn().mockResolvedValue(undefined) };
  const orsMock = {
    geocodeAddress: jest.fn().mockResolvedValue({ latitude: 45.188, longitude: 5.724 }),
    resolveAddress: jest.fn().mockResolvedValue({ latitude: 45.188, longitude: 5.724 }),
    getDrivingRoute: jest.fn().mockResolvedValue({ distanceMeters: 5000, durationSeconds: 900 }),
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
    orsMock.getDrivingRoute.mockResolvedValue({ distanceMeters: 5000, durationSeconds: 900 });
  });

  // ── helpers ───────────────────────────────────────────────────────────────

  async function createAdminToken(): Promise<string> {
    const email = `admin_${Date.now()}@test.local`;
    const password = 'Password123!';
    const hash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { email, password: hash, role: 'ADMIN' },
    });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ identifier: email, password })
      .expect(HttpStatus.OK);

    return (res.body as AuthResponse).accessToken;
  }

  async function registerAndVerifyMerchant() {
    const email = `merchant_adm_${Date.now()}@test.local`;
    const res = await request(app.getHttpServer())
      .post('/auth/register/merchant')
      .send({ email, password: 'Password123!', name: 'Admin Test Merchant' })
      .expect(HttpStatus.CREATED);
    const body = res.body as AuthResponse;
    await prisma.user.update({ where: { id: body.user.id }, data: { emailVerified: true } });
    return body;
  }

  async function registerAndVerifyDriver() {
    const email = `driver_adm_${Date.now()}@test.local`;
    const res = await request(app.getHttpServer())
      .post('/auth/register/driver')
      .send(driverPayload(email))
      .expect(HttpStatus.CREATED);
    const body = res.body as AuthResponse;
    await prisma.user.update({ where: { id: body.user.id }, data: { emailVerified: true } });
    return body;
  }

  // ── access control ────────────────────────────────────────────────────────

  describe('Access control', () => {
    it('returns 401 with no token', async () => {
      await request(app.getHttpServer()).get('/admin/merchants').expect(HttpStatus.UNAUTHORIZED);
    });

    it('returns 403 when merchant tries to access admin routes', async () => {
      const merchant = await registerAndVerifyMerchant();

      await request(app.getHttpServer())
        .get('/admin/merchants')
        .set('Authorization', `Bearer ${merchant.accessToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('returns 403 when driver tries to access admin routes', async () => {
      const driver = await registerAndVerifyDriver();

      await request(app.getHttpServer())
        .get('/admin/drivers')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  // ── account creation ──────────────────────────────────────────────────────

  describe('POST /admin/accounts/admin', () => {
    it('admin can create another admin account', async () => {
      const adminToken = await createAdminToken();
      const newAdminEmail = `new_admin_${Date.now()}@test.local`;

      await request(app.getHttpServer())
        .post('/admin/accounts/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: newAdminEmail, password: 'SecurePass123!' })
        .expect(HttpStatus.CREATED);

      const user = await prisma.user.findUnique({ where: { email: newAdminEmail } });
      expect(user?.role).toBe('ADMIN');
    });

    it('returns 409 on duplicate admin email', async () => {
      const adminToken = await createAdminToken();
      const email = `dup_admin_${Date.now()}@test.local`;

      await request(app.getHttpServer())
        .post('/admin/accounts/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email, password: 'Pass123!' })
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post('/admin/accounts/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email, password: 'Pass123!' })
        .expect(HttpStatus.CONFLICT);
    });
  });

  describe('POST /admin/accounts/merchant', () => {
    it('admin can create a merchant account', async () => {
      const adminToken = await createAdminToken();
      const email = `adm_merchant_${Date.now()}@test.local`;

      await request(app.getHttpServer())
        .post('/admin/accounts/merchant')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email, password: 'Pass123!', name: 'Created By Admin' })
        .expect(HttpStatus.CREATED);

      const user = await prisma.user.findUnique({ where: { email } });
      expect(user?.role).toBe('MERCHANT');
    });
  });

  describe('POST /admin/accounts/driver', () => {
    it('admin can create a driver account', async () => {
      const adminToken = await createAdminToken();
      const email = `adm_driver_${Date.now()}@test.local`;

      await request(app.getHttpServer())
        .post('/admin/accounts/driver')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(driverPayload(email))
        .expect(HttpStatus.CREATED);

      const user = await prisma.user.findUnique({ where: { email } });
      expect(user?.role).toBe('DRIVER');
    });
  });

  // ── merchant supervision ──────────────────────────────────────────────────

  describe('GET /admin/merchants', () => {
    it('returns a list containing all registered merchants', async () => {
      const adminToken = await createAdminToken();
      const merchant = await registerAndVerifyMerchant();

      const res = await request(app.getHttpServer())
        .get('/admin/merchants')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      const merchants = res.body as { userId: string }[];
      expect(Array.isArray(merchants)).toBe(true);
      expect(merchants.some((m) => m.userId === merchant.user.id)).toBe(true);
    });
  });

  describe('GET /admin/merchants/:merchantId', () => {
    it('returns full merchant profile', async () => {
      const adminToken = await createAdminToken();
      const merchant = await registerAndVerifyMerchant();

      const res = await request(app.getHttpServer())
        .get(`/admin/merchants/${merchant.user.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      const body = res.body as { userId: string; subscription: string; subscriptionStatus: string };
      expect(body.userId).toBe(merchant.user.id);
      expect(body.subscriptionStatus).toBe('TRIAL');
    });

    it('returns 404 for unknown merchant id', async () => {
      const adminToken = await createAdminToken();

      await request(app.getHttpServer())
        .get('/admin/merchants/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  // ── driver supervision ────────────────────────────────────────────────────

  describe('GET /admin/drivers', () => {
    it('returns all drivers', async () => {
      const adminToken = await createAdminToken();
      const driver = await registerAndVerifyDriver();

      const res = await request(app.getHttpServer())
        .get('/admin/drivers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      const drivers = res.body as { userId: string }[];
      expect(Array.isArray(drivers)).toBe(true);
      expect(drivers.some((d) => d.userId === driver.user.id)).toBe(true);
    });

    it('filters drivers by kycStatus', async () => {
      const adminToken = await createAdminToken();
      const driver = await registerAndVerifyDriver();

      // set KYC to PENDING
      await prisma.driver.update({
        where: { userId: driver.user.id },
        data: { kycStatus: 'PENDING' },
      });

      const res = await request(app.getHttpServer())
        .get('/admin/drivers?kycStatus=PENDING')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      const drivers = res.body as { userId: string; kycStatus: string }[];
      expect(drivers.every((d) => d.kycStatus === 'PENDING')).toBe(true);
      expect(drivers.some((d) => d.userId === driver.user.id)).toBe(true);
    });
  });

  describe('GET /admin/drivers/:driverId', () => {
    it('returns full driver profile with wallet and documents', async () => {
      const adminToken = await createAdminToken();
      const driver = await registerAndVerifyDriver();

      const res = await request(app.getHttpServer())
        .get(`/admin/drivers/${driver.user.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      const body = res.body as { userId: string; kycStatus: string };
      expect(body.userId).toBe(driver.user.id);
      expect(body.kycStatus).toBe('NOT_SUBMITTED');
    });
  });

  // ── KYC admin actions ─────────────────────────────────────────────────────

  describe('KYC approve / reject', () => {
    async function setupDriverWithPendingKyc() {
      const driver = await registerAndVerifyDriver();

      // upload a document then submit KYC
      await prisma.driverDocument.create({
        data: {
          driverId: driver.user.id,
          type: 'DRIVING_LICENSE',
          url: 'https://s3.example.test/docs/dl.jpg',
        },
      });

      await prisma.kycSubmission.create({ data: { driverId: driver.user.id } });
      await prisma.driver.update({
        where: { userId: driver.user.id },
        data: { kycStatus: 'PENDING' },
      });

      return driver;
    }

    it('admin can approve a KYC submission', async () => {
      const adminToken = await createAdminToken();
      const driver = await setupDriverWithPendingKyc();

      await request(app.getHttpServer())
        .put(`/admin/drivers/${driver.user.id}/kyc/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      const dbDriver = await prisma.driver.findUnique({ where: { userId: driver.user.id } });
      expect(dbDriver?.kycStatus).toBe('ACCEPTED');

      const submission = await prisma.kycSubmission.findFirst({
        where: { driverId: driver.user.id },
        orderBy: { createdAt: 'desc' },
      });
      expect(submission?.status).toBe('ACCEPTED');
    });

    it('admin can reject a KYC submission with a reason', async () => {
      const adminToken = await createAdminToken();
      const driver = await setupDriverWithPendingKyc();
      const reason = 'Photo de permis illisible';

      await request(app.getHttpServer())
        .put(`/admin/drivers/${driver.user.id}/kyc/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rejectionReason: reason })
        .expect(HttpStatus.OK);

      const dbDriver = await prisma.driver.findUnique({ where: { userId: driver.user.id } });
      expect(dbDriver?.kycStatus).toBe('REJECTED');

      const submission = await prisma.kycSubmission.findFirst({
        where: { driverId: driver.user.id },
        orderBy: { createdAt: 'desc' },
      });
      expect(submission?.status).toBe('REJECTED');
      expect(submission?.rejectionReason).toBe(reason);
    });

    it('returns 404 when no pending KYC submission exists', async () => {
      const adminToken = await createAdminToken();
      const driver = await registerAndVerifyDriver(); // no KYC submitted

      await request(app.getHttpServer())
        .put(`/admin/drivers/${driver.user.id}/kyc/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  // ── withdrawals ───────────────────────────────────────────────────────────

  describe('Withdrawal management', () => {
    async function setupDriverWithPendingWithdrawal(amount = 25) {
      const driver = await registerAndVerifyDriver();

      // seed wallet with a balance
      const wallet = await prisma.wallet.findUnique({ where: { driverId: driver.user.id } });
      await prisma.wallet.update({
        where: { id: wallet!.id },
        data: { balance: amount, entries: { create: { type: 'CREDIT', amount, status: 'COMPLETED' } } },
      });

      // verify email and request withdrawal via API
      const withdrawRes = await request(app.getHttpServer())
        .post('/driver/me/wallet/withdrawals')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .send({ amount })
        .expect(HttpStatus.OK);

      const entry = await prisma.walletEntry.findFirst({
        where: { walletId: wallet!.id, type: 'DEBIT', status: 'PENDING' },
      });

      return { driver, wallet: wallet!, withdrawalEntry: entry!, withdrawRes };
    }

    it('GET /admin/withdrawals returns pending withdrawal requests', async () => {
      const adminToken = await createAdminToken();
      const { driver } = await setupDriverWithPendingWithdrawal();

      const res = await request(app.getHttpServer())
        .get('/admin/withdrawals?status=PENDING')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      const withdrawals = res.body as { wallet: { driver: { userId: string } } }[];
      expect(Array.isArray(withdrawals)).toBe(true);
      expect(withdrawals.some((w) => w.wallet.driver.userId === driver.user.id)).toBe(true);
    });

    it('admin can approve a withdrawal (COMPLETED)', async () => {
      const adminToken = await createAdminToken();
      const { withdrawalEntry } = await setupDriverWithPendingWithdrawal();

      await request(app.getHttpServer())
        .patch(`/admin/withdrawals/${withdrawalEntry.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'COMPLETED' })
        .expect(HttpStatus.OK);

      const updated = await prisma.walletEntry.findUnique({ where: { id: withdrawalEntry.id } });
      expect(updated?.status).toBe('COMPLETED');
    });

    it('admin can cancel a withdrawal and the balance is refunded', async () => {
      const adminToken = await createAdminToken();
      const { driver, withdrawalEntry } = await setupDriverWithPendingWithdrawal(30);

      await request(app.getHttpServer())
        .patch(`/admin/withdrawals/${withdrawalEntry.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'CANCELLED' })
        .expect(HttpStatus.OK);

      const updated = await prisma.walletEntry.findUnique({ where: { id: withdrawalEntry.id } });
      expect(updated?.status).toBe('CANCELLED');

      // balance should be restored
      const wallet = await prisma.wallet.findUnique({ where: { driverId: driver.user.id } });
      expect(wallet?.balance).toBeCloseTo(30, 1);
    });

    it('returns 409 when processing an already-completed withdrawal', async () => {
      const adminToken = await createAdminToken();
      const { withdrawalEntry } = await setupDriverWithPendingWithdrawal();

      await request(app.getHttpServer())
        .patch(`/admin/withdrawals/${withdrawalEntry.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'COMPLETED' })
        .expect(HttpStatus.OK);

      // second attempt
      await request(app.getHttpServer())
        .patch(`/admin/withdrawals/${withdrawalEntry.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'COMPLETED' })
        .expect(HttpStatus.CONFLICT);
    });
  });

  // ── handshake reset ───────────────────────────────────────────────────────

  describe('POST /admin/orders/:orderId/reset', () => {
    it('resets remaining handshake attempts to 3 on both handshakes', async () => {
      const adminToken = await createAdminToken();
      const merchant = await registerAndVerifyMerchant();
      const driver = await registerAndVerifyDriver();

      const storeRes = await request(app.getHttpServer())
        .post(`/merchants/${merchant.user.id}/stores`)
        .set('Authorization', `Bearer ${merchant.accessToken}`)
        .send({ name: 'HS Store', address: 'Allee Condillac, 38400 Grenoble', latitude: 45.188, longitude: 5.724 })
        .expect(HttpStatus.CREATED);
      const storeId = (storeRes.body as { id: string }).id;

      // make driver available so they can be notified
      await request(app.getHttpServer())
        .patch('/driver/me/availability')
        .set('Authorization', `Bearer ${driver.accessToken}`);

      const orderRes = await request(app.getHttpServer())
        .post(`/merchants/${merchant.user.id}/stores/${storeId}/orders`)
        .set('Authorization', `Bearer ${merchant.accessToken}`)
        .send({
          customerName: 'Reset Test',
          customerPhone: '+33699999999',
          dropOffAddress: '2 impasse Voltaire, 38000 Grenoble',
          type: 'DOCUMENTS',
        })
        .expect(HttpStatus.CREATED);
      const orderId = (orderRes.body as { orderId: string }).orderId;

      await request(app.getHttpServer())
        .post(`/driver/me/missions/${orderId}/accept`)
        .set('Authorization', `Bearer ${driver.accessToken}`);

      // burn 2 attempts on handshake A via driver endpoint (which actually decrements)
      for (let i = 0; i < 2; i++) {
        await request(app.getHttpServer())
          .post(`/driver/me/missions/${orderId}/handshake/merchant/verify`)
          .set('Authorization', `Bearer ${driver.accessToken}`)
          .send({ code: '000000' });
      }

      const before = await prisma.handshake.findFirst({ where: { orderId, type: 'A' } });
      expect(before?.remainingAttemps).toBe(1);

      // admin resets
      await request(app.getHttpServer())
        .post(`/admin/orders/${orderId}/reset`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      const afterA = await prisma.handshake.findFirst({ where: { orderId, type: 'A' } });
      const afterB = await prisma.handshake.findFirst({ where: { orderId, type: 'B' } });
      expect(afterA?.remainingAttemps).toBe(3);
      expect(afterB?.remainingAttemps).toBe(3);
    });
  });
});
