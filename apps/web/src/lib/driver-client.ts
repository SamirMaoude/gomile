import { requestWithAutoRefresh } from "./protected-request";

export type UploadPresignInput = {
  filename: string;
  contentType: string;
};

export type UploadPresignResponse = {
  uploadUrl: string;
  fileUrl: string;
  viewUrl: string;
};

export type DriverDocumentType =
  | "CNI"
  | "DRIVING_LICENSE"
  | "REGISTRATION_CARD"
  | "RIB"
  | "OTHER";

export type UpdateDriverProfileInput = {
  avatarUrl?: string;
};

export type UploadDriverDocumentInput = {
  type: DriverDocumentType;
  url: string;
};

export function presignUpload(input: UploadPresignInput) {
  return requestWithAutoRefresh<UploadPresignResponse>("/api/uploads/presign", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateDriverProfile(input: UpdateDriverProfileInput) {
  return requestWithAutoRefresh<{ message: string }>("/api/driver/me/profile", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function uploadDriverDocument(input: UploadDriverDocumentInput) {
  return requestWithAutoRefresh<{ id: string; type: string; url: string }>(
    "/api/driver/me/documents",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function uploadFileToSignedUrl(
  uploadUrl: string,
  file: File,
  contentType = file.type || "application/octet-stream",
) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "content-type": contentType,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Upload du fichier impossible pour le moment.");
  }
}
