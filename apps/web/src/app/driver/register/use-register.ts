"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ChangeEvent, type FormEvent } from "react";

import { logout, registerDriver } from "@/lib/auth-client";
import { uploadDriverRegistrationAssets, type DriverRegisterFiles } from "./registration-upload";
import {
  buildRegisterDriverInput,
  driverRegisterSteps,
  initialDriverRegisterFormData,
  normalizeDriverRegisterFormData,
  type DriverRegisterDocumentField,
  type DriverRegisterErrors,
  type DriverRegisterField,
  type DriverRegisterFormData,
  type DriverRegisterUploadField,
} from "./steps";

function isEmailValid(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

function buildStepErrors(
  stepId: number,
  formData: DriverRegisterFormData,
  files: DriverRegisterFiles,
  selectedDocumentFields: DriverRegisterDocumentField[],
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
    if (files.avatarUrl && !isImageFile(files.avatarUrl)) {
      errors.avatarUrl = "L'avatar doit etre une image.";
    }
    if (!files.avatarUrl && !normalizedFormData.avatarUrl) {
      errors.avatarUrl = "Ajoutez un avatar.";
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
    const hasCompleteAddress = Boolean(normalizedFormData.address);
    const hasStructuredAddress = Boolean(
      normalizedFormData.city &&
        normalizedFormData.zipCode &&
        normalizedFormData.street,
    );

    if (!hasCompleteAddress && !hasStructuredAddress) {
      const message =
        "Renseignez l'adresse complete ou bien la ville, le code postal et la rue.";
      errors.address = message;
      if (!normalizedFormData.city) {
        errors.city = "Renseignez votre ville.";
      }
      if (!normalizedFormData.zipCode) {
        errors.zipCode = "Renseignez votre code postal.";
      }
      if (!normalizedFormData.street) {
        errors.street = "Renseignez votre rue.";
      }
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
    const hasJustificatif =
      selectedDocumentFields.includes("justificatifFile") &&
      (Boolean(files.justificatifFile) ||
        Boolean(normalizedFormData.justificatifFile));
    const hasKbis =
      selectedDocumentFields.includes("kbisFile") &&
      (Boolean(files.kbisFile) || Boolean(normalizedFormData.kbisFile));

    if (hasJustificatif && hasKbis) {
      const message =
        "Choisissez soit justificatif de domicile soit KBIS. L'endpoint upload actuel ne garde qu'un seul document de type autre.";
      errors.justificatifFile = message;
      errors.kbisFile = message;
    }
  }

  return errors;
}

export function useRegister() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState(initialDriverRegisterFormData);
  const [files, setFiles] = useState<DriverRegisterFiles>({});
  const [selectedDocumentFields, setSelectedDocumentFields] = useState<
    DriverRegisterDocumentField[]
  >([]);
  const [errors, setErrors] = useState<DriverRegisterErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAccountCreated, setIsAccountCreated] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentStep = driverRegisterSteps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === driverRegisterSteps.length - 1;

  function clearFieldError(field: DriverRegisterField) {
    setErrors((previous) => {
      const nextErrors = { ...previous };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function updateField(field: DriverRegisterField, value: string) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    clearFieldError(field);
    setFormError(null);
  }

  function handleFileChange(
    field: DriverRegisterUploadField,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] ?? null;

    setFiles((previous) => ({
      ...previous,
      [field]: file,
    }));

    if (!file) {
      setFormData((previous) => ({
        ...previous,
        [field]: "",
      }));
    }

    clearFieldError(field);
    setFormError(null);
  }

  function addDocumentSelection(field: DriverRegisterDocumentField) {
    setSelectedDocumentFields((previous) => {
      if (previous.includes(field)) {
        return previous;
      }

      return [...previous, field];
    });

    clearFieldError(field);
    setFormError(null);
  }

  function removeDocumentSelection(field: DriverRegisterDocumentField) {
    setSelectedDocumentFields((previous) =>
      previous.filter((currentField) => currentField !== field),
    );
    setFiles((currentFiles) => ({
      ...currentFiles,
      [field]: null,
    }));
    setFormData((currentFormData) => ({
      ...currentFormData,
      [field]: "",
    }));
    clearFieldError(field);
    setFormError(null);
  }

  function removeUpload(field: DriverRegisterUploadField) {
    if (field === "avatarUrl") {
      setFiles((previous) => ({
        ...previous,
        avatarUrl: null,
      }));
      setFormData((previous) => ({
        ...previous,
        avatarUrl: "",
      }));
      clearFieldError("avatarUrl");
      setFormError(null);
      return;
    }

    removeDocumentSelection(field);
  }

  function getDisplayFileName(field: DriverRegisterUploadField) {
    const localFile = files[field];

    if (localFile) {
      return localFile.name;
    }

    if (formData[field]) {
      return "Fichier ajoute";
    }

    return "";
  }

  function getSelectedDocumentFileName(field: DriverRegisterDocumentField) {
    return getDisplayFileName(field);
  }

  function getAvatarFileName() {
    return getDisplayFileName("avatarUrl");
  }

  function toggleShowPassword() {
    setShowPassword((value) => !value);
  }

  function goToNextStep() {
    const stepErrors = buildStepErrors(
      currentStep.id,
      formData,
      files,
      selectedDocumentFields,
    );

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

  async function completeDriverAssetUpload() {
    return uploadDriverRegistrationAssets({
      files,
      selectedDocumentFields,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (currentStep.id !== 4) {
      goToNextStep();
      return;
    }

    const stepErrors = buildStepErrors(
      currentStep.id,
      formData,
      files,
      selectedDocumentFields,
    );

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      if (!isAccountCreated) {
        const uploadedUrls = await completeDriverAssetUpload();
        const registrationFormData = {
          ...formData,
          ...uploadedUrls,
        };
        const session = await registerDriver(
          buildRegisterDriverInput(registrationFormData),
        );

        if (session.user.role !== "DRIVER") {
          setFormError("Le compte cree n'est pas un compte livreur.");
          return;
        }

        setIsAccountCreated(true);
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
      if (isAccountCreated) {
        setFormError(
          submissionError instanceof Error
            ? `${submissionError.message} Le compte est cree, mais la synchronisation des fichiers n'est pas terminee.`
            : "Le compte est cree, mais la synchronisation des fichiers a echoue.",
        );
      } else {
        setFormError(
          submissionError instanceof Error
            ? submissionError.message
            : "Inscription impossible pour le moment.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    addDocumentSelection,
    avatarFileName: getAvatarFileName(),
    currentStep,
    errors,
    formData,
    formError,
    goToNextStep,
    goToPreviousStep,
    handleAvatarFileChange: (event: ChangeEvent<HTMLInputElement>) =>
      handleFileChange("avatarUrl", event),
    handleDocumentFileChange: (
      field: DriverRegisterUploadField,
      event: ChangeEvent<HTMLInputElement>,
    ) => handleFileChange(field, event),
    handleSubmit,
    isFirstStep,
    isLastStep,
    isPending: isPending || isSubmitting,
    removeDocumentSelection,
    removeUpload,
    selectedDocumentFields,
    selectedFileNames: selectedDocumentFields.reduce(
      (accumulator, field) => ({
        ...accumulator,
        [field]: getSelectedDocumentFileName(field),
      }),
      {} as Partial<Record<DriverRegisterUploadField, string>>,
    ),
    showPassword,
    steps: driverRegisterSteps,
    toggleShowPassword,
    updateField,
  };
}
