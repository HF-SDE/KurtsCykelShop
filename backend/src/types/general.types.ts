import{ NextFunction, Request, Response } from "express";
import { Query } from "express-serve-static-core";

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

export interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  hasMore: boolean;
}

interface BaseAPIResponse {
  status: Status;
  message?: string;
}

interface APIResponseWithData<T = null | undefined> extends BaseAPIResponse {
  data: T;
  error: never;
}

interface APIResponseError<E = null | undefined> extends BaseAPIResponse   {
  data: never;
  error: E;
}

export type APIResponse<T = null | undefined, E = null | undefined> = APIResponseWithData<T> | APIResponseError<E> | BaseAPIResponse;

export type ExpressFunction = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;

export type TypedQuery<T> = Partial<T> & Query;
