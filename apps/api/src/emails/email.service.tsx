import { Injectable } from "@nestjs/common";
import { Resend } from "resend";
import { ResetPasswordEmail } from "./reset-password";
import { VerifyEmail } from "./verify-email";
import { TrialExpiring } from "./trial-expiring";
import { AccountLocked } from "./account-locked";
import { SubscriptionRenewing } from "./subscription-renewing";
import { PaymentFailed } from "./payment-failed";
import { render } from "react-email";
import { Tier } from "@prisma/client";

@Injectable()
export class EmailService {
  private readonly resend = new Resend(process.env.RESEND_API_KEY);

  async sendPasswordReset(to: string, name: string, otp: string) {
    const html = await render(<ResetPasswordEmail email={to} name={name} resetOtp={otp} />);
    await this.resend.emails.send({
      from: 'noreply@gomile.delivery',
      to,
      subject: 'Reset your password',
      html,
    });
  }

  async sendVerificationEmail(to: string, name: string, verifyUrl: string) {
    const html = await render(<VerifyEmail email={to} name={name} verifyUrl={verifyUrl} />);
    await this.resend.emails.send({
      from: 'noreply@gomile.delivery',
      to,
      subject: 'Verify your Gomile account',
      html,
    });
  }

  async sendTrialExpiring(to: string, name: string, trialEndsAt: Date, upgradeUrl: string) {
    const html = await render(<TrialExpiring email={to} name={name} trialEndsAt={trialEndsAt} upgradeUrl={upgradeUrl} />);
    await this.resend.emails.send({
      from: 'noreply@gomile.delivery',
      to,
      subject: 'Your Gomile trial expires in 10 days',
      html,
    });
  }

  async sendAccountLocked(to: string, name: string, upgradeUrl: string) {
    const html = await render(<AccountLocked email={to} name={name} upgradeUrl={upgradeUrl} />);
    await this.resend.emails.send({
      from: 'noreply@gomile.delivery',
      to,
      subject: 'Your Gomile store has been locked',
      html,
    });
  }

  async sendSubscriptionRenewing(to: string, name: string, plan: Tier, renewalDate: Date, portalUrl: string) {
    const html = await render(<SubscriptionRenewing email={to} name={name} plan={plan} renewalDate={renewalDate} portalUrl={portalUrl} />);
    await this.resend.emails.send({
      from: 'noreply@gomile.delivery',
      to,
      subject: `Your Gomile ${plan} plan renews in 10 days`,
      html,
    });
  }

  async sendPaymentFailed(to: string, name: string, billingUrl: string) {
    const html = await render(<PaymentFailed email={to} name={name} billingUrl={billingUrl} />);
    await this.resend.emails.send({
      from: 'noreply@gomile.delivery',
      to,
      subject: 'Payment failed — action required',
      html,
    });
  }
}
