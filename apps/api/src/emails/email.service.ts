import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendPasswordReset(to: string, name: string, otp: string): Promise<void> {
    // Temporary fallback while email provider integration is disabled.
    this.logger.warn(
      `Email sending disabled: password reset not sent to ${to} (${name}), otp=${otp}`,
    );
  }

  async sendVerificationEmail(
    to: string,
    name: string,
    verifyUrl: string,
  ): Promise<void> {
    // Temporary fallback while email provider integration is disabled.
    this.logger.warn(
      `Email sending disabled: verification email not sent to ${to} (${name}), url=${verifyUrl}`,
    );
  }
}
