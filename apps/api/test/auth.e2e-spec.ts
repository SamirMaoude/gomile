import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;


  // Initialize application
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // Close application
  afterAll(async () => {
    await app.close();
  });

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

    // Check tokens
    expect(registerRes.body.accessToken).toMatch(jwtPattern);
    expect(registerRes.body.refreshToken).toMatch(jwtPattern);

    // Refresh token
    const refreshToken1 = registerRes.body.refreshToken as string;

    // Refresh token
    const refreshRes = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${refreshToken1}`)
      .expect(HttpStatus.OK);

    // Check new tokens
    expect(refreshRes.body.accessToken).toMatch(jwtPattern);
    expect(refreshRes.body.refreshToken).toMatch(jwtPattern);

    // Extract new tokens
    const accessToken2 = refreshRes.body.accessToken as string;
    const refreshToken2 = refreshRes.body.refreshToken as string;

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
});
