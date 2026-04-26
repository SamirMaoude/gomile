"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { login, logout } from "@/lib/auth-client";

function buildUsername(email: string) {
  const base = email.split("@")[0]?.trim() ?? "";

  const formatted = base
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return formatted || email;
}

export function useLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleShowPassword() {
    setShowPassword((value) => !value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setError("Renseignez votre adresse e-mail et votre mot de passe.");
      return;
    }

    try {
      const session = await login({ email, password });

      if (session.user.role !== "MERCHANT" && session.user.role !== "ADMIN") {
        await logout();
        setError("Ce compte n'est pas un compte marchand.");
        return;
      }

      window.localStorage.setItem("username", buildUsername(email));
      setSuccess("Connexion reussie. Redirection vers votre dashboard...");

      startTransition(() => {
        router.replace("/merchant/dashboard");
        router.refresh();
      });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Connexion impossible pour le moment.",
      );
    }
  }

  return {
    error,
    handleSubmit,
    isPending,
    showPassword,
    success,
    toggleShowPassword,
  };
}
