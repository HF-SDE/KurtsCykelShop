import { type Permission as PermissionCode } from "@permission-types";

export interface Permission {
  id: string;
  code: PermissionCode;
  description?: string;
}
