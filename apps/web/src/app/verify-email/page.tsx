"use client";

import { Suspense } from "react";
import Background from "@/components/ui/auth/background";
import Button from "@/components/ui/design-system/button/button";
import ErrorMessage from "@/components/ui/design-system/messages/errorMessage";
import SuccessMessage from "@/components/ui/design-system/messages/successMessage";
import Typography from "@/components/ui/design-system/typography";
import { Logo } from "@/components/Logo/Logo";
import { verifyEmailDescriptionByStatus } from "./content";
import { styles } from "./styles";
import { useVerifyEmail } from "./use-verify-email";

function VerifyEmailContent() {
  const { message, status } = useVerifyEmail();

  return (
    <Background as="section">
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <Logo size="lg" />
          </div>

          <Typography
            variant="h6"
            Component="h6"
            theme="heading"
            className={styles.title}
          >
            Verification email
          </Typography>

          <Typography
            variant="p"
            Component="p"
            theme="body"
            className={styles.description}
          >
            {verifyEmailDescriptionByStatus[status]}
          </Typography>
        </div>

        <div className={styles.form}>
          {status === "loading" ? (
            <Typography
              variant="p"
              Component="p"
              theme="body"
              className={styles.statusMessage}
            >
              {message}
            </Typography>
          ) : status === "success" ? (
            <SuccessMessage>{message}</SuccessMessage>
          ) : (
            <ErrorMessage>{message}</ErrorMessage>
          )}

          <Button
            href="/merchant/login"
            fullWidth
            className={styles.submitButton}
          >
            Aller a la connexion
          </Button>
        </div>
      </div>
    </Background>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
