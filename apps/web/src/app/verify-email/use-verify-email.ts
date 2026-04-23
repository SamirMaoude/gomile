"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { verifyEmailToken } from "@/lib/auth-client";

export type VerifyEmailStatus = "loading" | "success" | "error";

export function useVerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<VerifyEmailStatus>("loading");
  const [message, setMessage] = useState(
    "Verification de votre adresse email en cours...",
  );

  useEffect(() => {
    let isActive = true;

    async function runVerification() {
      if (!token) {
        if (isActive) {
          setStatus("error");
          setMessage("Le lien de verification est invalide ou incomplet.");
        }
        return;
      }

      try {
        const response = await verifyEmailToken(token);

        if (!isActive) {
          return;
        }

        setStatus("success");
        setMessage(response.message || "Email verifie avec succes.");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Verification de l'email impossible pour le moment.",
        );
      }
    }

    void runVerification();

    return () => {
      isActive = false;
    };
  }, [token]);

  return {
    message,
    status,
  };
}
