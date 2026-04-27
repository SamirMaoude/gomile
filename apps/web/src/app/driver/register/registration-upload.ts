import {
  presignUpload,
  updateDriverProfile,
  uploadDriverDocument,
  uploadFileToSignedUrl,
  type DriverDocumentType,
} from "@/lib/driver-client";
import type {
  DriverRegisterDocumentField,
  DriverRegisterUploadField,
} from "./steps";

export type DriverRegisterFiles = Partial<
  Record<DriverRegisterUploadField, File | null>
>;

type UploadDriverRegistrationAssetsInput = {
  files: DriverRegisterFiles;
  selectedDocumentFields: DriverRegisterDocumentField[];
  onUploadedUrl?: (field: DriverRegisterUploadField, fileUrl: string) => void;
};

const documentTypeByField: Record<
  DriverRegisterDocumentField,
  DriverDocumentType
> = {
  cniFile: "CNI",
  justificatifFile: "OTHER",
  permisFile: "DRIVING_LICENSE",
  carteGriseFile: "REGISTRATION_CARD",
  kbisFile: "OTHER",
  ribFile: "RIB",
};

function resolveContentType(file: File) {
  if (file.type) {
    return file.type;
  }

  if (file.name.toLowerCase().endsWith(".pdf")) {
    return "application/pdf";
  }

  return "application/octet-stream";
}

async function uploadSingleFile(file: File) {
  const contentType = resolveContentType(file);
  const { uploadUrl, fileUrl } = await presignUpload({
    filename: file.name,
    contentType,
  });

  await uploadFileToSignedUrl(uploadUrl, file);
  return fileUrl;
}

export async function uploadDriverRegistrationAssets({
  files,
  selectedDocumentFields,
  onUploadedUrl,
}: UploadDriverRegistrationAssetsInput) {
  const otherDocumentFields = selectedDocumentFields.filter(
    (field) => documentTypeByField[field] === "OTHER" && files[field],
  );

  if (otherDocumentFields.length > 1) {
    throw new Error(
      "Le backend actuel permet un seul document de type autre via l'endpoint upload. Choisissez soit justificatif de domicile soit KBIS.",
    );
  }

  if (files.avatarUrl) {
    const avatarUrl = await uploadSingleFile(files.avatarUrl);
    await updateDriverProfile({ avatarUrl });
    onUploadedUrl?.("avatarUrl", avatarUrl);
  }

  for (const field of selectedDocumentFields) {
    const file = files[field];

    if (!file) {
      continue;
    }

    const url = await uploadSingleFile(file);
    await uploadDriverDocument({
      type: documentTypeByField[field],
      url,
    });
    onUploadedUrl?.(field, url);
  }
}
