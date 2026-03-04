import { type Permission as PermissionCode } from "@permission-types";

export interface Permission {
  id: string;
  code: PermissionCode;
  description?: string;
  permissionGroupId: string;
  createdAt: string;
  updatedAt: string;
  isAssigned?: boolean;
  permissionGroup?: {
    id: string;
    name: string;
  };
}
