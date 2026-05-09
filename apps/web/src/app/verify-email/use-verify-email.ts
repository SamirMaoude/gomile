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
    "Vérification de votre adresse e-mail en cours...",
  );

  useEffect(() => {
    let isActive = true;

    async function runVerification() {
      if (!token) {
        if (isActive) {
          setStatus("error");
          setMessage("Le lien de vérification est invalide ou incomplet.");
        }
        return;
      }

      try {
        const response = await verifyEmailToken(token);

        if (!isActive) {
          return;
        }

        setStatus("success");
        setMessage(response.message || "E-mail vérifié avec succès.");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Vérification de l'e-mail impossible pour le moment.",
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
