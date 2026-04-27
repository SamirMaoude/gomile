// Error factory
export interface ApiErrorDefinition {
  statusCode: number;
  message: string;
}

export interface ApiErrorPayload<T extends string> {
  code: T;
  message: string;
  statusCode: number;
}

export function createApiError<T extends string>(
  code: T,
  errors: Record<T, ApiErrorDefinition>,
): ApiErrorPayload<T> {
  const definition = errors[code];
  return {
    code,
    message: definition.message,
    statusCode: definition.statusCode,
  };
}
