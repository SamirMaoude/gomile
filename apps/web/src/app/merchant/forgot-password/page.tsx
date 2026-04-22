"use client";

import Link from "next/link";

import { styles } from "./styles";

import Button from "@/components/ui/design-system/button/button";
import Background from "@/components/ui/auth/background";
import Form from "@/components/ui/design-system/forms/form";
import Input from "@/components/ui/design-system/input/input";
import ErrorMessage from "@/components/ui/design-system/messages/errorMessage";
import SuccessMessage from "@/components/ui/design-system/messages/successMessage";
import Typography from "@/components/ui/design-system/typography";
import MailIcon from "@/components/ui/icons/MailIcon";
import { Logo } from "@/components/Logo/Logo";
import { useForgotPassword } from "./use-forgot-password";

export default function ForgotPasswordPage() {
  const { email, errorMessage, handleEmailChange, handleSubmit, successMessage } =
    useForgotPassword();

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
            Mot de passe oublie
          </Typography>

          <Typography
            variant="p"
            Component="p"
            theme="body"
            className={styles.description}
          >
            Saisissez votre adresse email pour recevoir un lien de
            reinitialisation.
          </Typography>
        </div>

        <Form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldsGroup}>
            <Input
              id="email"
              name="email"
              type="email"
              label="Adresse email"
              placeholder="Entrez votre adresse email"
              value={email}
              onChange={handleEmailChange}
              autoComplete="email"
              leftIcon={<MailIcon className={styles.inputIcon} />}
              containerClassName={styles.inputContainer}
              inputWrapperClassName={styles.inputWrapper}
            />
          </div>

          {errorMessage ? (
            <ErrorMessage className={styles.message}>
              {errorMessage}
            </ErrorMessage>
          ) : null}

          {successMessage ? (
            <SuccessMessage className={styles.message}>
              {successMessage}
            </SuccessMessage>
          ) : null}

          <Button type="submit" fullWidth className={styles.submitButton}>
            Envoyer le lien
          </Button>
        </Form>

        <div className={styles.footer}>
          <Link href="/merchant/login" className={styles.link}>
            <Typography variant="span" Component="span" theme="link">
              Retour a la connexion
            </Typography>
          </Link>
        </div>
      </div>
    </Background>
  );
}
