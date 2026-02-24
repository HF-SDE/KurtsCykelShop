// For validation errors with field-specific messages
export interface ValidationError {
  [field: string]: string[];
}

// For general application errors
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

// Result tuple type for service layer - enables [data, error] destructuring
export type EitherDataOrError<T, E = AppError> = [data: T, error: null] | [data: null, error: E];
