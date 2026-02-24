import { Permission } from "./permission.types";

interface IBasicUser extends BasicUser {
  id: string;
  active: boolean;
}

export interface User extends IBasicUser {
  UserPermissions?: UserPermission[];
}

export interface BasicUser {
  initials: string;
  firstName: string;
  lastName: string;
  username: string;
}

interface UserPermission {
  Permission: Permission;
  assignedBy: string;
}

