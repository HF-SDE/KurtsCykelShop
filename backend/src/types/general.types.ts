import e, { NextFunction, Request, Response } from "express";
import { Query } from "express-serve-static-core";

import { AppError, EitherDataOrError, ValidationError } from "./error.types";

export enum Status {
  Unauthorized = "Unauthorized",
  Forbidden = "Forbidden",
  Success = "Success",
  Failed = "Failed",
  Found = "Found",
  NotFound = "NotFound",
  Created = "Created",
  CreationFailed = "CreationFailed",
  Deleted = "Deleted",
  DeleteFailed = "DeletionFailed",
  Updated = "Updated",
  UpdateFailed = "UpdateFailed",
  MissingDetails = "MissingDetails",
  InvalidDetails = "InvalidDetails",
  MissingCredentials = "MissingCredentials",
  InvalidCredentials = "InvalidCredentials",
  TooManyRequests = "TooManyRequests",
}

// Re-export error types for convenience
export type { ValidationError, AppError, EitherDataOrError as Result };

interface BaseAPIResponse {
  status: Status;
  message?: string;
}
interface APIResponseWithData<T> extends BaseAPIResponse {
  data: T;
  errors?: never;
}

interface APIResponseWithValidationErrors extends BaseAPIResponse {
  data?: never;
  errors: ValidationError; // Field-specific validation errors
}

interface APIResponseWithError extends BaseAPIResponse {
  data?: never;
  error: AppError; // General application error
}

export type APIResponse<T> =
  | APIResponseWithData<T>
  | APIResponseWithValidationErrors
  | APIResponseWithError
  | BaseAPIResponse;

export type ExpressFunction = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;

export type TypedQuery<T> = Partial<T> & Query;
