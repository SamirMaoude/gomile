"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();

    setErrorMessage("");
    setSuccessMessage("");

    if (!trimmedEmail) {
      setErrorMessage("Veuillez renseigner votre adresse email.");
      return;
    }

    setSuccessMessage(
      "Si un compte existe avec cette adresse, un lien de reinitialisation sera envoye.",
    );
  }

  return {
    email,
    errorMessage,
    handleEmailChange,
    handleSubmit,
    successMessage,
  };
}
