export interface APIResponse<T = null | undefined> {
  status: Status;
  message?: string;
  data?: T | null;
}
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
