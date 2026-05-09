"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { logout, registerMerchant } from "@/lib/auth-client";

export function useRegister() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleShowPassword() {
    setShowPassword((value) => !value);
  }

  function handlePhoneChange(value: string) {
    setPhone(value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const phoneRaw = String(formData.get("phone") ?? "").trim();
    const phoneDigits = phoneRaw.replace(/\D/g, "");
    const phone = phoneDigits.length > 4 ? phoneRaw : undefined;

    if (!name || !email || !password) {
      setError("Renseignez le nom du commerce, l'e-mail et le mot de passe.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    try {
      const session = await registerMerchant({
        name,
        email,
        password,
        ...(phone ? { phone } : {}),
      });

      if (session.user.role === "ADMIN") {
        setError("Attention, il y a tentative de hack.");
        return;
      }

      if (session.user.role !== "MERCHANT") {
        setError("Le compte créé n'est pas un compte marchand.");
        return;
      }

      const Swal = (await import("sweetalert2")).default;

      await Swal.fire({
        icon: "success",
        title: "Valide ton compte mail",
        text: "Un lien d'activation par mail est arrivé dans votre boîte ",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      try {
        await logout();
      } catch {
        // Best-effort cleanup before sending the user to the login page.
      }

      startTransition(() => {
        router.replace("/merchant/login");
        router.refresh();
      });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Inscription impossible pour le moment.",
      );
    }
  }

  return {
    error,
    handleSubmit,
    handlePhoneChange,
    isPending,
    phone,
    showPassword,
    toggleShowPassword,
  };
}
