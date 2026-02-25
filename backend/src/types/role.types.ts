import { Permission, Role } from "@prisma/client";

export interface PermissionWithAssignment extends Permission {
  isAssigned?: boolean;
}

export interface RoleWithPermissions extends Role {
  permissions?: PermissionWithAssignment[];
}
