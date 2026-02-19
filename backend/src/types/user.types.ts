import { Prisma } from '@prisma';

import { Permission } from './permission.types';

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
  email: string;
  username: string;
}

interface UserPermission {
  Permission: Permission;
  assignedBy: string;
}

export interface TransformedUser extends IBasicUser {
  UserPermissions: Prisma.UserCreateWithoutRolesInput[] &
    {
      code: string;
      description: string;
    }[]; // Match the mapped structure
}
