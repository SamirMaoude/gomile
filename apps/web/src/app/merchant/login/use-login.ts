"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";

import { login, logout } from "@/lib/auth-client";
import {
  getCurrentMerchantProfile,
  primeMerchantSession,
} from "@/lib/merchant-session";

export function useLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let isActive = true;

    async function restoreExistingSession() {
      try {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const session = (await response.json()) as Awaited<ReturnType<typeof login>>;

        if (session.user.role !== "MERCHANT" && session.user.role !== "ADMIN") {
          return;
        }

        primeMerchantSession(session);

        try {
          await getCurrentMerchantProfile();
        } catch {
          // Best-effort preload so the dashboard can show merchant.name immediately.
        }

        if (!isActive) {
          return;
        }

        router.replace("/merchant/dashboard");
        router.refresh();
      } catch {
        // No valid refresh token: keep the login page visible.
      }
    }

    void restoreExistingSession();

    return () => {
      isActive = false;
    };
  }, [router]);

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
      const session = await login({ identifier: email, password });

      if (session.user.role !== "MERCHANT" && session.user.role !== "ADMIN") {
        await logout();
        setError("Ce compte n'est pas un compte marchand.");
        return;
      }

      primeMerchantSession(session);

      try {
        await getCurrentMerchantProfile();
      } catch {
        // Best-effort preload so the dashboard can show merchant.name immediately.
      }

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
