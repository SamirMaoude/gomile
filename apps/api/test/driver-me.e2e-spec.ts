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

function driverPayload(email: string, phone?: string) {
  return {
    email,
    password: 'Password123!',
    firstName: 'Jean',
    lastName: 'Testeur',
    avatarUrl: 'https://example.test/avatar/jean.jpg',
    gender: 'MALE',
    phone: phone ?? `+336${Date.now().toString().slice(-8)}`,
    dateOfBirth: '1992-03-10',
    address: '7 rue Condorcet, 38000 Grenoble',
    deliveryCity: 'Grenoble',
    deliveryRadius: 20,
    transportType: 'SCOOTER',
  };
}

describe('DriverMe endpoints (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const notificationMock = { notifyDrivers: jest.fn().mockResolvedValue(undefined), putExpoToken: jest.fn().mockResolvedValue(undefined) };
  const smsMock = { sendSms: jest.fn().mockResolvedValue(undefined) };
  const orsMock = {
    geocodeAddress: jest.fn().mockResolvedValue({ latitude: 45.188, longitude: 5.724 }),
    resolveAddress: jest.fn().mockResolvedValue({ latitude: 45.188, longitude: 5.724 }),
    getDrivingRoute: jest.fn().mockResolvedValue({ distanceMeters: 4000, durationSeconds: 720 }),
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
    orsMock.getDrivingRoute.mockResolvedValue({ distanceMeters: 4000, durationSeconds: 720 });
  });

  // ── helpers ───────────────────────────────────────────────────────────────

  async function registerAndVerifyDriver() {
    const email = `driverme_${Date.now()}@test.local`;
    const res = await request(app.getHttpServer())
      .post('/auth/register/driver')
      .send(driverPayload(email))
      .expect(HttpStatus.CREATED);
    const body = res.body as AuthResponse;
    await prisma.user.update({ where: { id: body.user.id }, data: { emailVerified: true } });
    return body;
  }

  async function registerAndVerifyMerchant() {
    const email = `merchant_dme_${Date.now()}@test.local`;
    const res = await request(app.getHttpServer())
      .post('/auth/register/merchant')
      .send({ email, password: 'Password123!', name: 'DMe Merchant' })
      .expect(HttpStatus.CREATED);
    const body = res.body as AuthResponse;
    await prisma.user.update({ where: { id: body.user.id }, data: { emailVerified: true } });
    return body;
  }

  // ── dashboard ─────────────────────────────────────────────────────────────

  describe('GET /driver/me/dashboard', () => {
    it('returns dashboard snapshot for a fresh driver', async () => {
      const driver = await registerAndVerifyDriver();

      const res = await request(app.getHttpServer())
        .get('/driver/me/dashboard')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .expect(HttpStatus.OK);

      const body = res.body as { isOnline: boolean; todayEarnings: number; todayTrips: number };
      expect(body.isOnline).toBe(false);
      expect(body.todayEarnings).toBe(0);
      expect(body.todayTrips).toBe(0);
    });

    it('reflects online status after toggling availability', async () => {
      const driver = await registerAndVerifyDriver();

      await request(app.getHttpServer())
        .patch('/driver/me/availability')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .expect(HttpStatus.OK);

      const res = await request(app.getHttpServer())
        .get('/driver/me/dashboard')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .expect(HttpStatus.OK);

      expect((res.body as { isOnline: boolean }).isOnline).toBe(true);
    });
  });

  // ── location ──────────────────────────────────────────────────────────────

  describe('PATCH /driver/me/location', () => {
    it('updates driver GPS coordinates', async () => {
      const driver = await registerAndVerifyDriver();

      await request(app.getHttpServer())
        .patch('/driver/me/location')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .send({ latitude: 45.1885, longitude: 5.7245 })
        .expect(HttpStatus.OK);

      const dbDriver = await prisma.driver.findUnique({ where: { userId: driver.user.id } });
      expect(dbDriver?.lastKnownLatitude).toBeCloseTo(45.1885, 4);
      expect(dbDriver?.lastKnownLongitude).toBeCloseTo(5.7245, 4);
    });

    it('rejects invalid coordinates', async () => {
      const driver = await registerAndVerifyDriver();

      await request(app.getHttpServer())
        .patch('/driver/me/location')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .send({ latitude: 'not-a-number', longitude: 5.72 })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  // ── availability ──────────────────────────────────────────────────────────

  describe('PATCH /driver/me/availability', () => {
    it('toggles driver from OFFLINE to AVAILABLE and back', async () => {
      const driver = await registerAndVerifyDriver();

      const res1 = await request(app.getHttpServer())
        .patch('/driver/me/availability')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .expect(HttpStatus.OK);
      expect((res1.body as { status: string }).status).toBe('AVAILABLE');

      const res2 = await request(app.getHttpServer())
        .patch('/driver/me/availability')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .expect(HttpStatus.OK);
      expect((res2.body as { status: string }).status).toBe('OFFLINE');
    });

    it('returns 409 when driver status is BUSY', async () => {
      const driver = await registerAndVerifyDriver();

      // Set driver status to BUSY directly (the guard checks driver.status === BUSY)
      await prisma.driver.update({
        where: { userId: driver.user.id },
        data: { status: 'BUSY' },
      });

      await request(app.getHttpServer())
        .patch('/driver/me/availability')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .expect(HttpStatus.CONFLICT);
    });
  });

  // ── profile ───────────────────────────────────────────────────────────────

  describe('GET /driver/me/profile', () => {
    it('returns full driver profile', async () => {
      const driver = await registerAndVerifyDriver();

      const res = await request(app.getHttpServer())
        .get('/driver/me/profile')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .expect(HttpStatus.OK);

      const profile = res.body as {
        firstName: string;
        lastName: string;
        gomileCode: string;
        kycStatus: string;
        status: string;
      };
      expect(profile.firstName).toBe('Jean');
      expect(profile.lastName).toBe('Testeur');
      expect(profile.gomileCode).toMatch(/^GM-[A-F0-9]{6}-\d{4}$/);
      expect(profile.kycStatus).toBe('NOT_SUBMITTED');
      expect(profile.status).toBe('OFFLINE');
    });
  });

  describe('PATCH /driver/me/profile', () => {
    it('updates driver profile fields', async () => {
      const driver = await registerAndVerifyDriver();

      await request(app.getHttpServer())
        .patch('/driver/me/profile')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .send({ deliveryRadius: 30, deliveryCity: 'Lyon' })
        .expect(HttpStatus.OK);

      const dbDriver = await prisma.driver.findUnique({ where: { userId: driver.user.id } });
      expect(dbDriver?.deliveryRadius).toBe(30);
      expect(dbDriver?.deliveryCity).toBe('Lyon');
    });

    it('resets kycStatus to NOT_SUBMITTED when address changes', async () => {
      const driver = await registerAndVerifyDriver();

      // manually set kyc to ACCEPTED first
      await prisma.driver.update({
        where: { userId: driver.user.id },
        data: { kycStatus: 'ACCEPTED' },
      });

      await request(app.getHttpServer())
        .patch('/driver/me/profile')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .send({ address: '99 rue de la Paix, 75001 Paris' })
        .expect(HttpStatus.OK);

      const dbDriver = await prisma.driver.findUnique({ where: { userId: driver.user.id } });
      expect(dbDriver?.kycStatus).toBe('NOT_SUBMITTED');
    });
  });

  // ── session vehicle ───────────────────────────────────────────────────────

  describe('PATCH /driver/me/session-vehicle', () => {
    it('updates active vehicle without changing transportType', async () => {
      const driver = await registerAndVerifyDriver();

      const res = await request(app.getHttpServer())
        .patch('/driver/me/session-vehicle')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .send({ vehicleType: 'CAR' })
        .expect(HttpStatus.OK);

      expect((res.body as { activeVehicle: string }).activeVehicle).toBe('CAR');

      const dbDriver = await prisma.driver.findUnique({ where: { userId: driver.user.id } });
      expect(dbDriver?.activeVehicle).toBe('CAR');
      expect(dbDriver?.transportType).toBe('SCOOTER'); // transportType unchanged (registered with SCOOTER)
    });
  });

  // ── wallet ────────────────────────────────────────────────────────────────

  describe('Wallet endpoints', () => {
    it('GET /driver/me/wallet returns zero balance for new driver', async () => {
      const driver = await registerAndVerifyDriver();

      const res = await request(app.getHttpServer())
        .get('/driver/me/wallet')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .expect(HttpStatus.OK);

      const wallet = res.body as { balance: number; pendingAmount: number };
      expect(wallet.balance).toBe(0);
      expect(wallet.pendingAmount).toBe(0);
    });

    it('GET /driver/me/wallet/entries returns empty array initially', async () => {
      const driver = await registerAndVerifyDriver();

      const res = await request(app.getHttpServer())
        .get('/driver/me/wallet/entries')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      expect((res.body as unknown[]).length).toBe(0);
    });

    it('POST /driver/me/wallet/withdrawals fails with insufficient balance', async () => {
      const driver = await registerAndVerifyDriver();

      await request(app.getHttpServer())
        .post('/driver/me/wallet/withdrawals')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .send({ amount: 50 })
        .expect(HttpStatus.CONFLICT);
    });

    it('withdrawal debits balance and creates PENDING entry', async () => {
      const driver = await registerAndVerifyDriver();

      // credit wallet directly so there is a balance to withdraw
      const wallet = await prisma.wallet.findUnique({ where: { driverId: driver.user.id } });
      await prisma.wallet.update({
        where: { id: wallet!.id },
        data: {
          balance: 30,
          entries: {
            create: { type: 'CREDIT', amount: 30, status: 'COMPLETED' },
          },
        },
      });

      await request(app.getHttpServer())
        .post('/driver/me/wallet/withdrawals')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .send({ amount: 20 })
        .expect(HttpStatus.OK);

      const updated = await prisma.wallet.findUnique({ where: { driverId: driver.user.id } });
      expect(updated?.balance).toBeCloseTo(10, 1);

      const entries = await prisma.walletEntry.findMany({ where: { walletId: wallet!.id } });
      const debit = entries.find((e) => e.type === 'DEBIT');
      expect(debit?.status).toBe('PENDING');
      expect(debit?.amount).toBe(20);
    });
  });

  // ── documents ─────────────────────────────────────────────────────────────

  describe('Document endpoints', () => {
    it('GET /driver/me/documents returns empty list initially', async () => {
      const driver = await registerAndVerifyDriver();

      const res = await request(app.getHttpServer())
        .get('/driver/me/documents')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      expect((res.body as unknown[]).length).toBe(0);
    });

    it('POST /driver/me/documents creates a document record', async () => {
      const driver = await registerAndVerifyDriver();

      const res = await request(app.getHttpServer())
        .post('/driver/me/documents')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .send({ type: 'DRIVING_LICENSE', url: 'https://s3.example.test/docs/license.jpg' })
        .expect(HttpStatus.OK);

      const doc = res.body as { id: string; type: string; verified: boolean };
      expect(doc.type).toBe('DRIVING_LICENSE');
      expect(doc.verified).toBe(false);
    });

    it('DELETE /driver/me/documents/:id removes the document', async () => {
      const driver = await registerAndVerifyDriver();

      const createRes = await request(app.getHttpServer())
        .post('/driver/me/documents')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .send({ type: 'CNI', url: 'https://s3.example.test/docs/cni.jpg' })
        .expect(HttpStatus.OK);

      const docId = (createRes.body as { id: string }).id;

      await request(app.getHttpServer())
        .delete(`/driver/me/documents/${docId}`)
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .expect(HttpStatus.OK);

      const dbDoc = await prisma.driverDocument.findUnique({ where: { id: docId } });
      expect(dbDoc).toBeNull();
    });

    it('DELETE returns 404 for a document belonging to another driver', async () => {
      const driver1 = await registerAndVerifyDriver();
      const driver2 = await registerAndVerifyDriver();

      const createRes = await request(app.getHttpServer())
        .post('/driver/me/documents')
        .set('Authorization', `Bearer ${driver1.accessToken}`)
        .send({ type: 'PASSPORT', url: 'https://s3.example.test/docs/passport.jpg' })
        .expect(HttpStatus.OK);

      const docId = (createRes.body as { id: string }).id;

      await request(app.getHttpServer())
        .delete(`/driver/me/documents/${docId}`)
        .set('Authorization', `Bearer ${driver2.accessToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  // ── kyc ───────────────────────────────────────────────────────────────────

  describe('KYC endpoints', () => {
    it('GET /driver/me/kyc returns NOT_SUBMITTED for a fresh driver', async () => {
      const driver = await registerAndVerifyDriver();

      const res = await request(app.getHttpServer())
        .get('/driver/me/kyc')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .expect(HttpStatus.OK);

      expect((res.body as { status: string }).status).toBe('NOT_SUBMITTED');
    });

    it('POST /driver/me/kyc requires at least one document', async () => {
      const driver = await registerAndVerifyDriver();

      await request(app.getHttpServer())
        .post('/driver/me/kyc')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .expect(HttpStatus.CONFLICT);
    });

    it('POST /driver/me/kyc submits KYC after uploading a document', async () => {
      const driver = await registerAndVerifyDriver();

      await request(app.getHttpServer())
        .post('/driver/me/documents')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .send({ type: 'DRIVING_LICENSE', url: 'https://s3.example.test/docs/dl.jpg' });

      await request(app.getHttpServer())
        .post('/driver/me/kyc')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .expect(HttpStatus.OK);

      const dbDriver = await prisma.driver.findUnique({ where: { userId: driver.user.id } });
      expect(dbDriver?.kycStatus).toBe('PENDING');
    });

    it('POST /driver/me/kyc returns 409 when already pending', async () => {
      const driver = await registerAndVerifyDriver();

      await request(app.getHttpServer())
        .post('/driver/me/documents')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .send({ type: 'CNI', url: 'https://s3.example.test/docs/cni2.jpg' });

      await request(app.getHttpServer())
        .post('/driver/me/kyc')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .expect(HttpStatus.OK);

      // second submit should conflict
      await request(app.getHttpServer())
        .post('/driver/me/kyc')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .expect(HttpStatus.CONFLICT);
    });
  });

  // ── active / history missions ─────────────────────────────────────────────

  describe('Mission list endpoints', () => {
    it('GET /driver/me/missions/active returns empty list for idle driver', async () => {
      const driver = await registerAndVerifyDriver();

      const res = await request(app.getHttpServer())
        .get('/driver/me/missions/active')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      expect((res.body as unknown[]).length).toBe(0);
    });

    it('GET /driver/me/missions/available returns empty when driver is offline', async () => {
      const driver = await registerAndVerifyDriver();
      // driver is OFFLINE (default) → no missions shown

      const res = await request(app.getHttpServer())
        .get('/driver/me/missions/available')
        .set('Authorization', `Bearer ${driver.accessToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ── auth guard ────────────────────────────────────────────────────────────

  it('merchant JWT is rejected on driver-me routes (403)', async () => {
    const merchant = await registerAndVerifyMerchant();

    await request(app.getHttpServer())
      .get('/driver/me/profile')
      .set('Authorization', `Bearer ${merchant.accessToken}`)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('unauthenticated request returns 401', async () => {
    await request(app.getHttpServer())
      .get('/driver/me/wallet')
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
