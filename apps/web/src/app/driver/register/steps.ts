import {
  type Gender,
  type RegisterDriverInput,
  type VehicleType,
} from "@/lib/auth-client";

export type DriverRegisterFormData = {
  address: string;
  avatarUrl: string;
  carteGriseFile: string;
  city: string;
  cniFile: string;
  dateOfBirth: string;
  deliveryCity: string;
  deliveryRadius: string;
  email: string;
  firstName: string;
  gender: Gender;
  justificatifFile: string;
  kbisFile: string;
  lastName: string;
  password: string;
  permisFile: string;
  phone: string;
  ribFile: string;
  siret: string;
  street: string;
  transportType: VehicleType | "";
  zipCode: string;
};

export type DriverRegisterField = keyof DriverRegisterFormData;
export type DriverRegisterDocumentField =
  | "cniFile"
  | "justificatifFile"
  | "permisFile"
  | "carteGriseFile"
  | "kbisFile"
  | "ribFile";
export type DriverRegisterUploadField =
  | "avatarUrl"
  | DriverRegisterDocumentField;

export type DriverRegisterErrors = Partial<
  Record<DriverRegisterField, string>
>;

export type DriverRegisterStep = {
  id: number;
  title: string;
  description: string;
};

export const driverRegisterSteps: DriverRegisterStep[] = [
  {
    id: 1,
    title: "Identité",
    description: "Renseignez vos informations de contact et d'accès.",
  },
  {
    id: 2,
    title: "Profil",
    description: "Ajoutez vos informations personnelles et d'adresse.",
  },
  {
    id: 3,
    title: "Livraison",
    description: "Précisez votre zone et votre moyen de transport.",
  },
  {
    id: 4,
    title: "Documents",
    description: "Ajoutez vos documents de vérification.",
  },
];

export const driverRegisterDocumentOptions: Array<{
  field: DriverRegisterDocumentField;
  label: string;
}> = [
  {
    field: "cniFile",
    label: "Carte d'identité",
  },
  {
    field: "justificatifFile",
    label: "Justificatif de domicile",
  },
  {
    field: "permisFile",
    label: "Permis de conduite",
  },
  {
    field: "carteGriseFile",
    label: "Carte grise",
  },
  {
    field: "kbisFile",
    label: "KBIS",
  },
  {
    field: "ribFile",
    label: "RIB",
  },
];

export const initialDriverRegisterFormData: DriverRegisterFormData = {
  address: "",
  avatarUrl: "",
  carteGriseFile: "",
  city: "",
  cniFile: "",
  dateOfBirth: "",
  deliveryCity: "",
  deliveryRadius: "",
  email: "",
  firstName: "",
  gender: "UNDEFINED",
  justificatifFile: "",
  kbisFile: "",
  lastName: "",
  password: "",
  permisFile: "",
  phone: "",
  ribFile: "",
  siret: "",
  street: "",
  transportType: "",
  zipCode: "",
};

export function normalizeDriverRegisterFormData(
  formData: DriverRegisterFormData,
): DriverRegisterFormData {
  return {
    ...formData,
    address: formData.address.trim(),
    avatarUrl: formData.avatarUrl.trim(),
    carteGriseFile: formData.carteGriseFile.trim(),
    city: formData.city.trim(),
    cniFile: formData.cniFile.trim(),
    dateOfBirth: formData.dateOfBirth.trim(),
    deliveryCity: formData.deliveryCity.trim(),
    deliveryRadius: formData.deliveryRadius.trim(),
    email: formData.email.trim(),
    firstName: formData.firstName.trim(),
    justificatifFile: formData.justificatifFile.trim(),
    kbisFile: formData.kbisFile.trim(),
    lastName: formData.lastName.trim(),
    permisFile: formData.permisFile.trim(),
    phone: formData.phone.trim(),
    ribFile: formData.ribFile.trim(),
    siret: formData.siret.trim(),
    street: formData.street.trim(),
    zipCode: formData.zipCode.trim(),
  };
}

export function buildRegisterDriverInput(
  formData: DriverRegisterFormData,
): RegisterDriverInput {
  const normalizedFormData = normalizeDriverRegisterFormData(formData);

  return {
    dateOfBirth: normalizedFormData.dateOfBirth,
    deliveryCity: normalizedFormData.deliveryCity,
    deliveryRadius: Number.parseInt(normalizedFormData.deliveryRadius, 10),
    email: normalizedFormData.email,
    firstName: normalizedFormData.firstName,
    gender: normalizedFormData.gender,
    lastName: normalizedFormData.lastName,
    password: normalizedFormData.password,
    phone: normalizedFormData.phone,
    transportType: normalizedFormData.transportType as RegisterDriverInput["transportType"],
    ...(normalizedFormData.avatarUrl ? { avatarUrl: normalizedFormData.avatarUrl } : {}),
    ...(normalizedFormData.address ? { address: normalizedFormData.address } : {}),
    ...(normalizedFormData.city ? { city: normalizedFormData.city } : {}),
    ...(normalizedFormData.zipCode ? { zipCode: normalizedFormData.zipCode } : {}),
    ...(normalizedFormData.street ? { street: normalizedFormData.street } : {}),
    ...(normalizedFormData.cniFile ? { cniFile: normalizedFormData.cniFile } : {}),
    ...(normalizedFormData.justificatifFile
      ? { justificatifFile: normalizedFormData.justificatifFile }
      : {}),
    ...(normalizedFormData.permisFile ? { permisFile: normalizedFormData.permisFile } : {}),
    ...(normalizedFormData.carteGriseFile
      ? { carteGriseFile: normalizedFormData.carteGriseFile }
      : {}),
    ...(normalizedFormData.siret ? { siret: normalizedFormData.siret } : {}),
    ...(normalizedFormData.kbisFile ? { kbisFile: normalizedFormData.kbisFile } : {}),
    ...(normalizedFormData.ribFile ? { ribFile: normalizedFormData.ribFile } : {}),
  };
}
