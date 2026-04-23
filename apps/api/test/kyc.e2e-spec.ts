import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

const driverPayload = (email: string) => ({
  email,
  password: 'Password123!',
  firstName: 'Kyc',
  lastName: 'Driver',
  avatarUrl: 'https://example.test/avatar/kyc-driver.jpg',
  gender: 'MALE',
  phone: `+336${Date.now().toString().slice(-8)}`,
  dateOfBirth: '2000-01-02',
  address: '22 boulevard Clemenceau, 38000 Grenoble',
  deliveryCity: 'Grenoble',
  deliveryRadius: 10,
  transportType: 'BIKE',
});

describe('KycController (e2e)', () => {
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

  async function createAdminAccessToken() {
    const email = `riku_le_admin${Date.now()}@test.local`;
    const password = 'Password123!';
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        role: 'ADMIN',
      },
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ identifier: email, password })
      .expect(HttpStatus.OK);

    return (loginResponse.body as AuthTokensResponse).accessToken;
  }

  async function registerDriverWithKyc() {
    const email = `driver_${Date.now()}@test.local`;
    const response = await request(app.getHttpServer())
      .post('/auth/register/driver')
      .send(driverPayload(email))
      .expect(HttpStatus.CREATED);

    const auth = response.body as AuthTokensResponse;

    // Create a KYC submission directly since there is no submission endpoint yet
    const submission = await prisma.kycSubmission.create({
      data: {
        driverId: auth.user.id,
      },
    });
    await prisma.driver.update({
      where: { userId: auth.user.id },
      data: { kycStatus: 'PENDING' },
    });

    const driver = await prisma.driver.findUnique({
      where: { userId: auth.user.id },
    });

    expect(driver).not.toBeNull();

    return { auth, driver: driver!, submission };
  }

  it('allows a driver to read their own KYC status', async () => {
    const { auth, submission } = await registerDriverWithKyc();

    const response = await request(app.getHttpServer())
      .get('/livreurs/me/kyc')
      .set('Authorization', `Bearer ${auth.accessToken}`)
      .expect(HttpStatus.OK);

    expect(response.body.status).toBe('PENDING');
    expect(response.body.latestSubmission).toMatchObject({
      id: submission.id,
      status: 'PENDING',
      documentUrl: 'https://example.test/kyc/kyc-driver-id.jpg',
      rejectionReason: null,
    });
  });

  it('allows an admin to approve a driver KYC submission', async () => {
    const adminAccessToken = await createAdminAccessToken();
    const { driver, submission } = await registerDriverWithKyc();

    await request(app.getHttpServer())
      .put(`/livreurs/${driver.userId}/kyc-approve`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(HttpStatus.OK)
      .expect({ message: 'KYC approved' });

    const updatedDriver = await prisma.driver.findUnique({
      where: { userId: driver.userId },
    });
    const updatedSubmission = await prisma.kycSubmission.findUnique({
      where: { id: submission.id },
    });

    expect(updatedDriver?.kycStatus).toBe('ACCEPTED');
    expect(updatedSubmission?.status).toBe('ACCEPTED');
    expect(updatedSubmission?.rejectionReason).toBeNull();
  });

  it('allows an admin to reject a driver KYC submission', async () => {
    const adminAccessToken = await createAdminAccessToken();
    const { driver, submission } = await registerDriverWithKyc();
    const rejectionReason = 'Document is unreadable';

    await request(app.getHttpServer())
      .put(`/livreurs/${driver.userId}/kyc-reject`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ rejectionReason })
      .expect(HttpStatus.OK)
      .expect({ message: 'KYC rejected' });

    const updatedDriver = await prisma.driver.findUnique({
      where: { userId: driver.userId },
    });
    const updatedSubmission = await prisma.kycSubmission.findUnique({
      where: { id: submission.id },
    });

    expect(updatedDriver?.kycStatus).toBe('REJECTED');
    expect(updatedSubmission?.status).toBe('REJECTED');
    expect(updatedSubmission?.rejectionReason).toBe(rejectionReason);
  });

  it('forbids a merchant from approving KYC', async () => {
    const merchantEmail = `merchant_${Date.now()}@test.local`;
    const merchantResponse = await request(app.getHttpServer())
      .post('/auth/register/merchant')
      .send({
        email: merchantEmail,
        password: 'Password123!',
        name: 'Test Merchant',
      })
      .expect(HttpStatus.CREATED);

    const merchantAuth = merchantResponse.body as AuthTokensResponse;
    const { driver } = await registerDriverWithKyc();

    await request(app.getHttpServer())
      .put(`/livreurs/${driver.userId}/kyc-approve`)
      .set('Authorization', `Bearer ${merchantAuth.accessToken}`)
      .expect(HttpStatus.FORBIDDEN);
  });
});
