import Constants from "expo-constants";

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
    throw new Error(await parseError(response));
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

export async function presignUpload(filename: string, contentType: string) {
  return requestUploadApi<{ uploadUrl: string; fileUrl: string }>("/uploads/presign", {
    method: "POST",
    body: JSON.stringify({ filename, contentType }),
  });
}

export async function uploadFileToPresignedUrl(
  uploadUrl: string,
  fileUri: string,
  contentType: string,
) {
  const fileResponse = await fetch(fileUri);
  const fileBlob = await fileResponse.blob();

  const putResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "content-type": contentType,
    },
    body: fileBlob,
  });

  if (!putResponse.ok) {
    throw new Error("Upload fichier échoué");
  }
}

export async function uploadLocalFile(fileUri: string, fallbackName: string) {
  if (fileUri.startsWith("http://") || fileUri.startsWith("https://")) {
    return fileUri;
  }

  const tokens = await getAuthTokenStore().getTokens();
  if (!tokens?.accessToken) {
    return undefined;
  }

  const contentType = inferContentType(fileUri);
  const filename = inferFilename(fileUri, fallbackName);

  const { uploadUrl, fileUrl } = await presignUpload(filename, contentType);
  await uploadFileToPresignedUrl(uploadUrl, fileUri, contentType);

  return fileUrl;
}
