import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import {PrismaService} from "../src/prisma/prisma.service";

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

  // Test registration of a driver with kyc
  it('registers a driver with kyc', async () => {
    const email = `driver_${Date.now()}@test.local`;

    const res = await request(app.getHttpServer())
        .post('/auth/register/driver')
        .send({
          email,
          password: 'TacosDeLyon',
          firstName: 'Riku',
          lastName: 'le DRIVER',
          avatarUrl: 'https://example.test/avatar/riku-driver.jpg',
          gender: 'MALE',
          phone: '0612345678',
          documentUrl: 'https://example.test/kyc/riku-driver-id.jpg',
          dateOfBirth: '2000-01-02',
          address: '22 boulevard Clemenceau, 38100 Grenoble',
        })
        .expect(HttpStatus.CREATED);

    expect(res.body.user.email).toBe(email);
    expect(res.body.user.role).toBe('DRIVER');

    const driver = await prisma.driver.findUnique(
        {
          where: {userId: res.body.user.id},
          include: { kycSubmissions: true}
        }
    )

    expect(driver).not.toBeNull();
    expect(driver?.firstName).toBe('Riku');
    expect(driver?.lastName).toBe('le DRIVER');
    expect(driver?.phone).toBe('0612345678');
    expect(driver?.avatarUrl).toBe('https://example.test/avatar/riku-driver.jpg');
    expect(driver?.gender).toBe('MALE');
    expect(driver?.address).toBe('22 boulevard Clemenceau, 38100 Grenoble');
    expect(driver?.kycStatus).toBe('PENDING');

  });

  it('registers a driver without kyc', async() => {
    const email = `driver_${Date.now()}@test.local`;

    const  res = await request(app.getHttpServer())
        .post('/auth/register/driver')
        .send({
          email,
          password: 'TacosDeLyon',
          firstName: 'RikuSansPapier',
          lastName: 'le DRIVER',
          avatarUrl: 'https://example.test/avatar/riku-driver.jpg',
          gender: 'MALE',
          phone: '0612345678',
          dateOfBirth: '2000-01-02',
          address: '22 boulevard Clemenceau, 38100 Grenoble',
        }).expect(HttpStatus.CREATED);
      expect(res.body.user.email).toBe(email);
      expect(res.body.user.role).toBe('DRIVER');
      // no need to reverify if the fields are correct, just verify the state to be NOT SUBMITTED
      const driver = await prisma.driver.findUnique(
          {
            where: {userId: res.body.user.id},
            include: { kycSubmissions: true}
          }
      )
      expect(driver).not.toBeNull();
      expect(driver?.kycStatus).toBe('NOT_SUBMITTED');
      expect(driver?.kycSubmissions).toHaveLength(0);
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

  // Test login
  it('logs in an existing user', async () => {
    const email = `login_${Date.now()}@test.local`;
    const password = 'TacosDeLyon';

    await request(app.getHttpServer())
        .post('/auth/register/merchant')
        .send({ email, password, name: 'Login Merchant' })
        .expect(HttpStatus.CREATED);

    const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(HttpStatus.OK);

    expect(res.body.user.email).toBe(email);
    expect(res.body.user.role).toBe('MERCHANT');
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
        .send({ email, password: 'UnTacosMauvais' })
        .expect(HttpStatus.UNAUTHORIZED);
  });
});
