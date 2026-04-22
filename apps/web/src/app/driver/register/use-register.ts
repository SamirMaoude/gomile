"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { logout, registerDriver } from "@/lib/auth-client";
import {
  buildRegisterDriverInput,
  driverRegisterSteps,
  initialDriverRegisterFormData,
  normalizeDriverRegisterFormData,
  type DriverRegisterErrors,
  type DriverRegisterField,
  type DriverRegisterFormData,
} from "./steps";

function isEmailValid(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

function isUrlValid(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function buildStepErrors(
  stepId: number,
  formData: DriverRegisterFormData,
): DriverRegisterErrors {
  const normalizedFormData = normalizeDriverRegisterFormData(formData);
  const errors: DriverRegisterErrors = {};

  if (stepId === 1) {
    if (!normalizedFormData.firstName) {
      errors.firstName = "Renseignez votre prenom.";
    }
    if (!normalizedFormData.lastName) {
      errors.lastName = "Renseignez votre nom.";
    }
    if (!normalizedFormData.email) {
      errors.email = "Renseignez votre adresse e-mail.";
    } else if (!isEmailValid(normalizedFormData.email)) {
      errors.email = "Renseignez une adresse e-mail valide.";
    }
    if (!normalizedFormData.phone) {
      errors.phone = "Renseignez votre numero de telephone.";
    } else if (normalizedFormData.phone.replace(/\D/g, "").length < 6) {
      errors.phone = "Renseignez un numero de telephone valide.";
    }
    if (
      normalizedFormData.avatarUrl &&
      !isUrlValid(normalizedFormData.avatarUrl)
    ) {
      errors.avatarUrl = "Renseignez une URL valide pour l'avatar.";
    }
    if (!formData.password) {
      errors.password = "Choisissez un mot de passe.";
    } else if (formData.password.length < 8) {
      errors.password = "Le mot de passe doit contenir au moins 8 caracteres.";
    }
  }

  if (stepId === 2) {
    if (!normalizedFormData.dateOfBirth) {
      errors.dateOfBirth = "Renseignez votre date de naissance.";
    }
    if (normalizedFormData.gender === "UNDEFINED") {
      errors.gender = "Selectionnez votre genre.";
    }
    if (!normalizedFormData.address) {
      errors.address = "Renseignez votre adresse.";
    }
  } else if (stepId === 3) {
    if (!normalizedFormData.deliveryCity) {
      errors.deliveryCity = "Renseignez votre ville de livraison.";
    }
    if (!normalizedFormData.deliveryRadius) {
      errors.deliveryRadius = "Renseignez votre rayon de livraison.";
    } else {
      const radius = Number.parseInt(normalizedFormData.deliveryRadius, 10);
      if (!Number.isInteger(radius) || radius < 1) {
        errors.deliveryRadius = "Le rayon de livraison doit etre un entier positif.";
      }
    }
    if (!normalizedFormData.transportType) {
      errors.transportType = "Selectionnez votre moyen de transport.";
    }
  } else if (stepId === 4) {
    const urlFields: Array<keyof DriverRegisterFormData> = [
      "cniFile",
      "justificatifFile",
      "permisFile",
      "carteGriseFile",
      "kbisFile",
      "ribFile",
    ];

    urlFields.forEach((field) => {
      const value = normalizedFormData[field];
      if (value && !isUrlValid(value)) {
        errors[field] = "Renseignez une URL valide.";
      }
    });

    if (
      normalizedFormData.transportType &&
      normalizedFormData.transportType !== "BIKE"
    ) {
      if (!normalizedFormData.permisFile) {
        errors.permisFile =
          "Ajoutez l'URL du permis pour ce type de transport.";
      }
      if (!normalizedFormData.carteGriseFile) {
        errors.carteGriseFile =
          "Ajoutez l'URL de la carte grise pour ce type de transport.";
      }
    }
  }

  return errors;
}

export function useRegister() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState(initialDriverRegisterFormData);
  const [errors, setErrors] = useState<DriverRegisterErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentStep = driverRegisterSteps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === driverRegisterSteps.length - 1;

  function updateField(field: DriverRegisterField, value: string) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => {
      const nextErrors = { ...previous };
      delete nextErrors[field];
      return nextErrors;
    });

    setFormError(null);
  }

  function toggleShowPassword() {
    setShowPassword((value) => !value);
  }

  function goToNextStep() {
    const stepErrors = buildStepErrors(currentStep.id, formData);

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setErrors({});
    setCurrentStepIndex((value) =>
      Math.min(value + 1, driverRegisterSteps.length - 1),
    );
  }

  function goToPreviousStep() {
    setFormError(null);
    setCurrentStepIndex((value) => Math.max(value - 1, 0));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!isLastStep) {
      goToNextStep();
      return;
    }

    const stepErrors = buildStepErrors(currentStep.id, formData);

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    try {
      const session = await registerDriver(buildRegisterDriverInput(formData));

      if (session.user.role !== "DRIVER") {
        setFormError("Le compte cree n'est pas un compte livreur.");
        return;
      }

      const Swal = (await import("sweetalert2")).default;

      await Swal.fire({
        icon: "success",
        title: "Valide ton compte mail",
        text: "Consulte ta boite mail pour activer ton compte livreur.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      try {
        await logout();
      } catch {
      }

      startTransition(() => {
        router.replace("/");
        router.refresh();
      });
    } catch (submissionError) {
      setFormError(
        submissionError instanceof Error
          ? submissionError.message
          : "Inscription impossible pour le moment.",
      );
    }
  }

  return {
    currentStep,
    errors,
    formData,
    formError,
    goToNextStep,
    goToPreviousStep,
    handleSubmit,
    isFirstStep,
    isLastStep,
    isPending,
    showPassword,
    steps: driverRegisterSteps,
    toggleShowPassword,
    updateField,
  };
}
