import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/emails/email.service';
import { UploadService } from 'src/upload/upload.service';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('$2b$10$hashed'),
  compare: jest.fn().mockResolvedValue(true),
}));

import * as bcrypt from 'bcrypt';

const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  merchant: { findUnique: jest.fn() },
  driver: { findUnique: jest.fn(), create: jest.fn() },
  driverDocument: { createMany: jest.fn() },
  $transaction: jest.fn().mockImplementation((ops) =>
    Array.isArray(ops) ? Promise.all(ops) : ops(mockPrisma),
  ),
};

const mockJwt = {
  signAsync: jest.fn().mockResolvedValue('mock.jwt.token'),
};

const mockEmail = {
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordReset: jest.fn().mockResolvedValue(undefined),
};

const mockUpload = {
  commitFile: jest.fn().mockImplementation((url: string) => Promise.resolve(url.replace('uploads/', 'documents/'))),
  deleteFile: jest.fn().mockResolvedValue(undefined),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrisma.user.update.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: EmailService, useValue: mockEmail },
        { provide: UploadService, useValue: mockUpload },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('registerAdmin', () => {
    it('creates admin user and sends verification email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'u1', email: 'admin@test.com', role: Role.ADMIN });

      const result = await service.registerAdmin('admin@test.com', 'Password1!');

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: Role.ADMIN, email: 'admin@test.com' }),
        }),
      );
      expect(mockEmail.sendVerificationEmail).toHaveBeenCalledWith('admin@test.com', 'Admin', expect.stringContaining('verify-email'));
      expect(result.message).toBeDefined();
    });

    it('throws ConflictException if email already taken', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(service.registerAdmin('taken@test.com', 'pass')).rejects.toThrow(ConflictException);
    });

    it('throws BadRequestException for invalid email format', async () => {
      await expect(service.registerAdmin('notanemail', 'pass')).rejects.toThrow(BadRequestException);
    });
  });

  describe('registerMerchant', () => {
    const dto = {
      email: 'merchant@test.com',
      password: 'Password1!',
      name: 'Mon Commerce',
      phone: '+33600000001',
    };

    it('creates merchant with 30-day trial and sends verification email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'u2', email: dto.email, role: Role.MERCHANT });

      const result = await service.registerMerchant(dto);

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: Role.MERCHANT,
            merchant: expect.objectContaining({ create: expect.objectContaining({ name: dto.name }) }),
          }),
        }),
      );
      expect(mockEmail.sendVerificationEmail).toHaveBeenCalled();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('throws ConflictException if email already taken', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'existing' });
      await expect(service.registerMerchant(dto)).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException if phone already taken', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(null)  // email check
        .mockResolvedValueOnce({ id: 'existing' }); // phone check
      await expect(service.registerMerchant(dto)).rejects.toThrow(ConflictException);
    });

    it('hashes password before storing', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'u2', email: dto.email, role: Role.MERCHANT });

      await service.registerMerchant(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ password: '$2b$10$hashed' }),
        }),
      );
    });
  });

  describe('registerDriver', () => {
    const dto = {
      email: 'driver@test.com',
      phone: '+33611111111',
      password: 'Password1!',
      firstName: 'Jean',
      lastName: 'Dupont',
      dateOfBirth: '1990-01-01',
      gender: 'MALE' as const,
      avatarUrl: 'https://bucket.s3.eu.amazonaws.com/uploads/avatar.jpg',
      address: '1 rue Test',
      deliveryCity: 'Paris',
      deliveryRadius: 10,
      transportType: 'BIKE' as const,
    };

    beforeEach(() => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.driver.findUnique.mockResolvedValue(null); // for gomileCode uniqueness check
      mockPrisma.user.create.mockResolvedValue({ id: 'u3', email: dto.email, role: Role.DRIVER });
      mockPrisma.driverDocument.createMany.mockResolvedValue({ count: 0 });
    });

    it('commits avatar and documents before DB write', async () => {
      await service.registerDriver(dto);
      expect(mockUpload.commitFile).toHaveBeenCalledWith(dto.avatarUrl);
    });

    it('creates user with DRIVER role and returns tokens', async () => {
      const result = await service.registerDriver(dto);
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: Role.DRIVER }),
        }),
      );
      expect(result.accessToken).toBeDefined();
    });

    it('deletes committed files and rethrows if DB creation fails', async () => {
      const dbError = new Error('DB error');
      mockPrisma.user.create.mockRejectedValue(dbError);

      await expect(service.registerDriver(dto)).rejects.toThrow('DB error');
      expect(mockUpload.deleteFile).toHaveBeenCalled();
    });

    it('sends verification email after successful creation', async () => {
      await service.registerDriver(dto);
      expect(mockEmail.sendVerificationEmail).toHaveBeenCalledWith(
        dto.email,
        dto.firstName,
        expect.stringContaining('verify-email'),
      );
    });

    it('stores lowercase email', async () => {
      await service.registerDriver({ ...dto, email: 'DRIVER@TEST.COM' });
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: 'driver@test.com' }),
        }),
      );
    });
  });

  describe('login', () => {
    const mockUser = {
      id: 'u1',
      email: 'user@test.com',
      phone: '+33600000001',
      password: '$2b$10$hashed',
      role: Role.MERCHANT,
    };

    it('logs in by email and returns tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ identifier: 'user@test.com', password: 'Password1!' });

      expect(result.accessToken).toBeDefined();
      expect(result.user.email).toBe('user@test.com');
    });

    it('logs in by phone number', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ identifier: '+33600000001', password: 'Password1!' });
      expect(result.accessToken).toBeDefined();
    });

    it('throws UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login({ identifier: 'nope@test.com', password: 'pass' })).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException if password does not match', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login({ identifier: 'user@test.com', password: 'wrongpass' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('returns new access token with existing refresh token', async () => {
      const result = await service.refresh('u1', 'user@test.com', Role.DRIVER, 'existing-refresh-token');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBe('existing-refresh-token');
      expect(result.user).toEqual({ id: 'u1', email: 'user@test.com', role: Role.DRIVER });
    });
  });

  describe('logout', () => {
    it('clears refresh token from DB', async () => {
      await service.logout('u1');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { refreshToken: null },
      });
    });
  });

  describe('verifyEmail', () => {
    it('marks email as verified on valid token', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1',
        emailVerificationExpiry: new Date(Date.now() + 10000),
      });

      const result = await service.verifyEmail({ token: 'valid-token' });
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ emailVerified: true, emailVerificationToken: null }),
        }),
      );
      expect(result.message).toBeDefined();
    });

    it('throws BadRequestException if token not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      await expect(service.verifyEmail({ token: 'bad-token' })).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if token expired', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1',
        emailVerificationExpiry: new Date(Date.now() - 1000),
      });
      await expect(service.verifyEmail({ token: 'expired-token' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('forgotPassword', () => {
    it('stores OTP hash and sends reset email when user exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'u1',
        email: 'user@test.com',
        role: Role.MERCHANT,
      });
      mockPrisma.merchant.findUnique.mockResolvedValue({ name: 'Mon Commerce' });

      const result = await service.forgotPassword({ email: 'user@test.com' });

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ passwordResetToken: expect.any(String) }),
        }),
      );
      expect(mockEmail.sendPasswordReset).toHaveBeenCalled();
      expect(result.message).toBeDefined();
    });

    it('returns same message even if user does not exist (no email enumeration)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result = await service.forgotPassword({ email: 'unknown@test.com' });
      expect(result.message).toBeDefined();
      expect(mockEmail.sendPasswordReset).not.toHaveBeenCalled();
    });
  });

  describe('verifyOtp', () => {
    const validUser = {
      id: 'u1',
      email: 'user@test.com',
      passwordResetToken: '', // will be set per test
      passwordResetExpiry: new Date(Date.now() + 60000),
    };

    it('returns reset token on valid OTP', async () => {
      // We need the stored hash to match what the service computes for the OTP
      const { createHash } = jest.requireActual('crypto');
      const otp = '123456';
      const hash = createHash('sha256').update(otp).digest('hex');

      mockPrisma.user.findUnique.mockResolvedValue({ ...validUser, passwordResetToken: hash });

      const result = await service.verifyOtp({ email: 'user@test.com', otp });
      expect(result.resetToken).toBeDefined();
    });

    it('throws BadRequestException if OTP does not match', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...validUser,
        passwordResetToken: 'wrong-hash',
      });
      await expect(service.verifyOtp({ email: 'user@test.com', otp: '999999' })).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if OTP expired', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...validUser,
        passwordResetExpiry: new Date(Date.now() - 1000),
        passwordResetToken: 'some-hash',
      });
      await expect(service.verifyOtp({ email: 'user@test.com', otp: '123456' })).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.verifyOtp({ email: 'no@test.com', otp: '123456' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPassword', () => {
    it('updates password when reset token is valid', async () => {
      const { createHash } = jest.requireActual('crypto');
      const resetToken = 'valid-reset-token';
      const hash = createHash('sha256').update(resetToken).digest('hex');

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'user@test.com',
        passwordResetToken: hash,
        passwordResetExpiry: new Date(Date.now() + 60000),
      });

      const result = await service.resetPassword({
        email: 'user@test.com',
        resetToken,
        newPassword: 'NewPassword1!',
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ password: '$2b$10$hashed', refreshToken: null }),
        }),
      );
      expect(result.message).toBeDefined();
    });

    it('throws BadRequestException on invalid reset token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'user@test.com',
        passwordResetToken: 'different-hash',
        passwordResetExpiry: new Date(Date.now() + 60000),
      });

      await expect(service.resetPassword({
        email: 'user@test.com',
        resetToken: 'wrong-token',
        newPassword: 'NewPassword1!',
      })).rejects.toThrow(BadRequestException);
    });
  });

  describe('getEmailStatus', () => {
    it('returns emailVerified true when verified', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ emailVerified: true });
      const result = await service.getEmailStatus('u1');
      expect(result.emailVerified).toBe(true);
    });

    it('returns emailVerified false when not verified', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ emailVerified: false });
      const result = await service.getEmailStatus('u1');
      expect(result.emailVerified).toBe(false);
    });

    it('throws BadRequestException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getEmailStatus('bad-id')).rejects.toThrow(BadRequestException);
    });
  });
});
