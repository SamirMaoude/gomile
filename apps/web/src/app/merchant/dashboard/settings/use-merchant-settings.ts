"use client";

import { useEffect, useState, type FormEvent } from "react";

import {
  getMerchantSettingsProfile,
  updateMerchantSettings,
} from "./merchant-settings.service";

type UseMerchantSettingsResult = {
  email: string;
  error: string | null;
  handleNameChange: (value: string) => void;
  handlePhoneChange: (value: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
  name: string;
  phone: string;
  success: string | null;
};

export function useMerchantSettings(): UseMerchantSettingsResult {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      try {
        const profile = await getMerchantSettingsProfile();

        if (!isActive) {
          return;
        }

        setName(profile.name);
        setPhone(profile.phone ?? "");
        setEmail(profile.email);
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger vos informations pour le moment.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, []);

  function handleNameChange(value: string) {
    setName(value);
    setError(null);
    setSuccess(null);
  }

  function handlePhoneChange(value: string) {
    setPhone(value);
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const phoneDigits = trimmedPhone.replace(/\D/g, "");
    const normalizedPhone = phoneDigits.length > 4 ? trimmedPhone : undefined;

    if (!trimmedName) {
      setError("Le nom du commerce est obligatoire.");
      return;
    }

    setIsSaving(true);

    try {
      const profile = await updateMerchantSettings({
        name: trimmedName,
        ...(normalizedPhone ? { phone: normalizedPhone } : { phone: "" }),
      });

      setName(profile.name);
      setPhone(profile.phone ?? "");
      setSuccess("Vos informations ont ete mises a jour.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Impossible de mettre a jour vos informations pour le moment.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return {
    email,
    error,
    handleNameChange,
    handlePhoneChange,
    handleSubmit,
    isLoading,
    isSaving,
    name,
    phone,
    success,
  };
}
