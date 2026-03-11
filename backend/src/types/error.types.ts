// import { Status } from "./general.types";
import { Status } from "./general.types";

// // For validation errors with field-specific messages
export interface ValidationError {
  status: Status;
  message: string;
  fieldErrors: {
    [field: string]: string[];
  };
}

// For general application errors
export interface AppError {
  status: Status;
  message: string;
  details?: unknown;
}

// Result tuple type for service layer - enables [data, error] destructuring
export type EitherDataOrError<T, E = AppError> = [data: T, error: null] | [data: null, error: E];

type Result<E extends { status: Status }, S> = [E, null] | [null, S];

export function ok<S>(value: S): Result<never, S> {
  return [null, value];
}

export function err<const R extends Status, E extends { status: R }>(error: E): Result<E, never> {
  return [error, null];
}
