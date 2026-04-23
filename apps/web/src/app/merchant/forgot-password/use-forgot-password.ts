"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

import {
  forgotPassword,
  resetPassword,
  verifyOtp,
} from "@/lib/auth-client";

export type ForgotPasswordStep = "email" | "otp" | "reset" | "done";

function normalizeForgotPasswordError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Operation impossible pour le moment.";
  }

  if (error.message === "property email should not exist") {
    return "Le endpoint forgot-password du backend refuse actuellement le champ email. Le front utilise bien la bonne route Swagger, mais le DTO backend n'accepte pas encore ce body.";
  }

  return error.message;
}

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [step, setStep] = useState<ForgotPasswordStep>("email");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
  }

  function handleOtpChange(event: ChangeEvent<HTMLInputElement>) {
    setOtp(event.target.value);
  }

  function handleNewPasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setNewPassword(event.target.value);
  }

  function handleConfirmPasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setConfirmPassword(event.target.value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();

    setErrorMessage("");
    setSuccessMessage("");

    if (step === "email") {
      if (!trimmedEmail) {
        setErrorMessage("Veuillez renseigner votre adresse email.");
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await forgotPassword({ email: trimmedEmail });
        setStep("otp");
        setSuccessMessage(
          response.message ||
            "Si un compte existe avec cette adresse, un code OTP a ete envoye.",
        );
      } catch (error) {
        setErrorMessage(normalizeForgotPasswordError(error));
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    if (step === "otp") {
      const trimmedOtp = otp.trim();

      if (!trimmedOtp) {
        setErrorMessage("Veuillez renseigner le code OTP.");
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await verifyOtp({
          email: trimmedEmail,
          otp: trimmedOtp,
        });
        setResetToken(response.resetToken);
        setStep("reset");
        setSuccessMessage("OTP verifie. Vous pouvez maintenant changer le mot de passe.");
      } catch (error) {
        setErrorMessage(normalizeForgotPasswordError(error));
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    const trimmedPassword = newPassword.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedPassword) {
      setErrorMessage("Veuillez renseigner votre nouveau mot de passe.");
      return;
    }

    if (trimmedPassword.length < 8) {
      setErrorMessage("Le mot de passe doit contenir au moins 8 caracteres.");
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setErrorMessage("La confirmation du mot de passe ne correspond pas.");
      return;
    }

    if (!resetToken) {
      setErrorMessage("Le jeton de reinitialisation est manquant. Recommencez le flow OTP.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPassword({
        email: trimmedEmail,
        resetToken,
        newPassword: trimmedPassword,
      });
      setStep("done");
      setSuccessMessage(
        response.message || "Votre mot de passe a ete reinitialise avec succes.",
      );
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setErrorMessage(normalizeForgotPasswordError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    email,
    otp,
    newPassword,
    confirmPassword,
    step,
    errorMessage,
    handleEmailChange,
    handleOtpChange,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
    isSubmitting,
    successMessage,
  };
}
