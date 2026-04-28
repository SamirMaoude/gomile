"use client";

import React from "react";
import Link from "next/link";
import OtpInput from "react-otp-input";

import { styles } from "./styles";

import Button from "@/components/ui/design-system/button/button";
import Background from "@/components/ui/auth/background";
import Form from "@/components/ui/design-system/forms/form";
import Input from "@/components/ui/design-system/input/input";
import ErrorMessage from "@/components/ui/design-system/messages/errorMessage";
import SuccessMessage from "@/components/ui/design-system/messages/successMessage";
import Typography from "@/components/ui/design-system/typography";
import MailIcon from "@/components/ui/icons/MailIcon";
import PasswordKeyIcon from "@/components/ui/icons/passwordKeyIcon";
import { Logo } from "@/components/Logo/Logo";
import {
  forgotPasswordDescriptionByStep,
  forgotPasswordSubmitLabelByStep,
  forgotPasswordTitleByStep,
} from "./content";
import { useForgotPassword } from "./use-forgot-password";

export default function ForgotPasswordPage() {
  const {
    confirmPassword,
    email,
    errorMessage,
    handleConfirmPasswordChange,
    handleEmailChange,
    handleNewPasswordChange,
    handleOtpChange,
    handleSubmit,
    isSubmitting,
    newPassword,
    otp,
    step,
    successMessage,
  } = useForgotPassword();

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
            {forgotPasswordTitleByStep[step]}
          </Typography>

          <Typography
            variant="p"
            Component="p"
            theme="body"
            className={styles.description}
          >
            {forgotPasswordDescriptionByStep[step]}
          </Typography>
        </div>

        <Form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldsGroup}>
            {step === "email" || step === "otp" ? (
              <Input
                id="email"
                name="email"
                type="email"
                label="Adresse email"
                placeholder="Entrez votre adresse email"
                value={email}
                onChange={handleEmailChange}
                autoComplete="email"
                disabled={step !== "email"}
                leftIcon={<MailIcon className={styles.inputIcon} />}
                containerClassName={styles.inputContainer}
                inputWrapperClassName={styles.inputWrapper}
              />
            ) : null}

            {step === "otp" ? (
              <div className={styles.otpFieldGroup}>
                <label htmlFor="otp-0" className={styles.otpLabel}>
                  Code OTP
                </label>
                <OtpInput
                  value={otp}
                  onChange={handleOtpChange}
                  numInputs={6}
                  inputType="tel"
                  shouldAutoFocus
                  containerStyle={styles.otpContainer}
                  skipDefaultStyles
                  renderInput={(inputProps, index) => (
                    <input
                      {...(inputProps as React.InputHTMLAttributes<HTMLInputElement>)}
                      id={`otp-${index}`}
                      name={`otp-${index}`}
                      className={[
                        inputProps.className,
                        styles.otpInput,
                      ].filter(Boolean).join(" ")}
                    />
                  )}
                />
              </div>
            ) : null}

            {step === "reset" ? (
              <>
                <Input
                  id="new-password"
                  name="newPassword"
                  type="password"
                  label="Nouveau mot de passe"
                  placeholder="Entrez votre nouveau mot de passe"
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  autoComplete="new-password"
                  leftIcon={<PasswordKeyIcon className={styles.inputIcon} />}
                  containerClassName={styles.inputContainer}
                  inputWrapperClassName={styles.inputWrapper}
                />

                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  label="Confirmer le mot de passe"
                  placeholder="Confirmez votre nouveau mot de passe"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  autoComplete="new-password"
                  leftIcon={<PasswordKeyIcon className={styles.inputIcon} />}
                  containerClassName={styles.inputContainer}
                  inputWrapperClassName={styles.inputWrapper}
                />
              </>
            ) : null}
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

          {step !== "done" ? (
            <Button
              type="submit"
              fullWidth
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting
                ? "Traitement..."
                : forgotPasswordSubmitLabelByStep[
                    step as "email" | "otp" | "reset"
                  ]}
            </Button>
          ) : null}
        </Form>

        <div className={styles.footer}>
          <Link href="/merchant/login" className={styles.link}>
            <Typography variant="span" Component="span" theme="link">
              {step === "done" ? "Aller a la connexion" : "Retour a la connexion"}
            </Typography>
          </Link>
        </div>
      </div>
    </Background>
  );
}
