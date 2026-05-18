import Constants from "expo-constants";
import * as FileSystem from "expo-file-system/legacy";

import type { ApiErrorPayload } from "./api-errors";
import { createApiError } from "./api-errors";
import { getAuthTokenStore } from "./auth-storage";

const DEFAULT_API_BASE_URL = "http://localhost:3000";

type ExpoExtraConfig = {
  apiBaseUrl?: string;
};

function resolveApiBaseUrl() {
  const expoExtra = (Constants.expoConfig?.extra ?? {}) as ExpoExtraConfig;

  return (
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    expoExtra.apiBaseUrl ??
    DEFAULT_API_BASE_URL
  );
}

function buildTargetUrl(path: string) {
  return new URL(path, resolveApiBaseUrl()).toString();
}

async function parseError(response: Response) {
  const fallbackError = createApiError("REQUEST_FAILED");
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    const payload = (await response.json()) as Partial<ApiErrorPayload>;
    return payload.message ?? payload.code ?? fallbackError.message;
  }

  const text = await response.text();
  return text || fallbackError.message;
}

async function requestUploadApi<T>(path: string, init?: RequestInit): Promise<T> {
  const tokens = await getAuthTokenStore().getTokens();

  if (!tokens?.accessToken) {
    throw new Error(createApiError("AUTH_TOKEN_MISSING").message);
  }

  const response = await fetch(buildTargetUrl(path), {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${tokens.accessToken}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await parseError(response);
    throw new Error(`${path} - ${err}`);
  }

  return (await response.json()) as T;
}

function inferContentType(fileUri: string) {
  const lower = fileUri.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".pdf")) return "application/pdf";
  return "image/jpeg";
}

function inferFilename(fileUri: string, fallbackName: string) {
  const parts = fileUri.split("/");
  const lastPart = parts[parts.length - 1] || "";
  if (lastPart.includes(".")) return lastPart;
  return fallbackName;
}

// Presign avec auth (pour les uploads post-connexion, ex. re-upload de doc)
export async function presignUpload(filename: string, contentType: string) {
  return requestUploadApi<{ uploadUrl: string; fileUrl: string }>("/uploads/presign", {
    method: "POST",
    body: JSON.stringify({ filename, contentType }),
  });
}

// Presign sans auth — le endpoint /uploads/presign est public,
// utilisé pendant l'inscription avant que le compte soit créé.
async function presignUploadAnonymous(filename: string, contentType: string) {
  const response = await fetch(buildTargetUrl("/uploads/presign"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ filename, contentType }),
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await parseError(response);
    throw new Error(`/uploads/presign - ${err}`);
  }

  return (await response.json()) as { uploadUrl: string; fileUrl: string };
}

export async function uploadFileToPresignedUrl(
  uploadUrl: string,
  fileUri: string,
  contentType: string,
) {
  const result = await FileSystem.uploadAsync(uploadUrl, fileUri, {
    httpMethod: "PUT",
    headers: { "Content-Type": contentType },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  });

  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Upload S3 échoué (${result.status})`);
  }
}

// Upload post-connexion (nécessite un token)
export async function uploadLocalFile(fileUri: string, fallbackName: string) {
  if (fileUri.startsWith("http://") || fileUri.startsWith("https://")) {
    return fileUri;
  }

  const contentType = inferContentType(fileUri);
  const filename = inferFilename(fileUri, fallbackName);

  const { uploadUrl, fileUrl } = await presignUpload(filename, contentType);
  await uploadFileToPresignedUrl(uploadUrl, fileUri, contentType);

  return fileUrl;
}

// Upload pendant l'inscription, avant la création du compte (sans auth)
export async function uploadLocalFileAnonymous(fileUri: string, fallbackName: string) {
  if (fileUri.startsWith("http://") || fileUri.startsWith("https://")) {
    return fileUri;
  }

  const contentType = inferContentType(fileUri);
  const filename = inferFilename(fileUri, fallbackName);

  const { uploadUrl, fileUrl } = await presignUploadAnonymous(filename, contentType);
  await uploadFileToPresignedUrl(uploadUrl, fileUri, contentType);

  return fileUrl;
}
