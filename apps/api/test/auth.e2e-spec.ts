import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

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
  firstName: 'Riku',
  lastName: 'le DRIVER',
  avatarUrl: 'https://example.test/avatar/riku-driver.jpg',
  gender: 'MALE',
  phone: `+336${Date.now().toString().slice(-8)}`,
  dateOfBirth: '2000-01-02',
  address: '22 boulevard Clemenceau, 38000 Grenoble',
  deliveryCity: 'Grenoble',
  deliveryRadius: 10,
  transportType: 'BIKE',
});

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  // Initialize application
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
  });

  // Close application
  afterAll(async () => {
    await app.close();
  });

  // Test registration, refresh, logout, token should be rotated and old one should be rejected
  it('register -> refresh rotates token -> old refresh rejected -> logout invalidates refresh', async () => {
    // Create unique email
    const email = `merchant_${Date.now()}@test.local`;
    const password = 'Password123!';

    // Register merchant
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register/merchant')
      .send({
        email,
        password,
        name: 'Test Merchant',
      })
      .expect(HttpStatus.CREATED);
    const registerBody = registerRes.body as AuthTokensResponse;

    // Check tokens
    expect(registerBody.accessToken).toMatch(jwtPattern);
    expect(registerBody.refreshToken).toMatch(jwtPattern);
    expect(typeof registerBody.user.id).toBe('string');
    expect(registerBody.user.email).toBe(email);
    expect(registerBody.user.role).toBe('MERCHANT');

    // Refresh token
    const refreshToken1 = registerBody.refreshToken;

    // Refresh token
    const refreshRes = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${refreshToken1}`)
      .expect(HttpStatus.OK);

    const refreshBody = refreshRes.body as AuthTokensResponse;
    // Check new tokens
    expect(refreshBody.accessToken).toMatch(jwtPattern);
    expect(refreshBody.refreshToken).toMatch(jwtPattern);
    expect(typeof refreshBody.user.id).toBe('string');
    expect(refreshBody.user.email).toBe(email);
    expect(refreshBody.user.role).toBe('MERCHANT');

    // Extract new tokens
    const accessToken2 = refreshBody.accessToken;
    const refreshToken2 = refreshBody.refreshToken;

    // New refresh token should be different from the first one
    expect(refreshToken2).not.toBe(refreshToken1);

    // Old refresh token should be rejected
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${refreshToken1}`)
      .expect(HttpStatus.UNAUTHORIZED);

    // Logout
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken2}`)
      .expect(HttpStatus.OK);

    // Refresh token should be rejected after logout
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${refreshToken2}`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('registers a driver', async () => {
    const email = `driver_${Date.now()}@test.local`;

    const res = await request(app.getHttpServer())
      .post('/auth/register/driver')
      .send(driverPayload(email))
      .expect(HttpStatus.CREATED);

    const body = res.body as AuthTokensResponse;
    expect(body.user.email).toBe(email);
    expect(body.user.role).toBe('DRIVER');

    const driver = await prisma.driver.findUnique({
      where: { userId: body.user.id },
    });

    const user = await prisma.user.findUnique({
      where: { id: body.user.id },
    });

    expect(driver).not.toBeNull();
    expect(driver?.firstName).toBe('Riku');
    expect(driver?.lastName).toBe('le DRIVER');
    expect(driver?.gender).toBe('MALE');
    expect(driver?.address).toBe('22 boulevard Clemenceau, 38000 Grenoble');
    expect(driver?.transportType).toBe('BIKE');
    expect(driver?.kycStatus).toBe('NOT_SUBMITTED');
    expect(driver?.gomileCode).toMatch(/^GM-[A-F0-9]{6}-\d{4}$/);
    expect(user?.phone).not.toBeNull();
  });

  // Test duplication email
  it('rejects duplicate email', async () => {
    const email = `dup_${Date.now()}@test.local`;
    const payload = {
      email,
      password: 'TacosDeGrenoble',
      name: 'Riku le DRIVER',
    };

    // Register once
    await request(app.getHttpServer())
      .post('/auth/register/merchant')
      .send(payload)
      .expect(HttpStatus.CREATED);

    // Register twice should be rejected
    await request(app.getHttpServer())
      .post('/auth/register/merchant')
      .send(payload)
      .expect(HttpStatus.CONFLICT);
  });

  // Test login by email
  it('logs in an existing user by email', async () => {
    const email = `login_${Date.now()}@test.local`;
    const password = 'TacosDeLyon';

    await request(app.getHttpServer())
      .post('/auth/register/merchant')
      .send({ email, password, name: 'Login Merchant' })
      .expect(HttpStatus.CREATED);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ identifier: email, password })
      .expect(HttpStatus.OK);

    const loginBody = res.body as AuthTokensResponse;
    expect(loginBody.user.email).toBe(email);
    expect(loginBody.user.role).toBe('MERCHANT');
  });

  // Test login by phone
  it('logs in a driver by phone number', async () => {
    const email = `phone_login_${Date.now()}@test.local`;
    const phone = `+336${Date.now().toString().slice(-8)}`;

    await request(app.getHttpServer())
      .post('/auth/register/driver')
      .send({ ...driverPayload(email), phone })
      .expect(HttpStatus.CREATED);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ identifier: phone, password: 'Password123!' })
      .expect(HttpStatus.OK);

    const phoneLoginBody = res.body as AuthTokensResponse;
    expect(phoneLoginBody.user.email).toBe(email);
    expect(phoneLoginBody.user.role).toBe('DRIVER');
  });

  // Test invalid password
  it('rejects invalid password', async () => {
    const email = `badpw_${Date.now()}@test.local`;
    const password = 'UnTacosEstBon';

    await request(app.getHttpServer())
      .post('/auth/register/merchant')
      .send({ email, password, name: 'MauvaisTacos Merchant' })
      .expect(HttpStatus.CREATED);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ identifier: email, password: 'UnTacosMauvais' })
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
