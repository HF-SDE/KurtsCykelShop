import { APIResponse, Status } from "@api-types/general.types";
import { Permission, PermissionGroup, Prisma, User } from "@prisma";
import prisma from "@prisma-instance";
import { getPermissionSchema } from "@schemas/permission.schemas";
import { getPermissionGroupsSchema } from "@schemas/permissionGroups.schemas";
import { createUserSchema, getUserSchema, patchUserSchema, updateUserSchema } from "@schemas/user.schemas";
import { z } from "zod";

type GetUsersInput = z.input<typeof getUserSchema>;
type GetPermissionsInput = z.input<typeof getPermissionSchema>;
type GetPermissionGroupsInput = z.input<typeof getPermissionGroupsSchema>;
type CreateUserInput = z.input<typeof createUserSchema>;
type UpdateUserInput = z.input<typeof updateUserSchema>;
type PatchUserInput = z.input<typeof patchUserSchema>;

type UserWithRoles = Prisma.UserGetPayload<{
  include: {
    roles: {
      include: {
        permissions: true;
      };
    };
  };
}>;

/**
 * Retrieves users with roles and permissions.
 * @param {GetUsersInput} query - Query string filters.
 * @param {GetUsersInput} params - Route params.
 * @returns {Promise<APIResponse<UserWithRoles[]>>} User list response.
 */
export async function getUsers(query: GetUsersInput, params: GetUsersInput): Promise<APIResponse<UserWithRoles[]>> {
  const validation = getUserSchema.safeParse({ ...query, ...params });

  if (!validation.success) {
    return {
      status: Status.InvalidDetails,
      message: validation.error.message,
    };
  }

  const where = validation.data as Prisma.UserWhereInput;

  const data = await prisma.user.findMany({
    ...(Object.keys(where).length > 0 ? { where } : {}),
    include: {
      roles: {
        include: {
          permissions: true,
        },
      },
    },
  });

  return {
    status: Status.Success,
    message: "Users retrieved successfully",
    data,
  };
}

/**
 * Retrieves permissions with optional filters.
 * @param {GetPermissionsInput} query - Query string filters.
 * @param {GetPermissionsInput} params - Route params.
 * @returns {Promise<APIResponse<Permission[]>>} Permission list response.
 */
export async function getPermissions(
  query: GetPermissionsInput,
  params: GetPermissionsInput,
): Promise<APIResponse<Permission[]>> {
  const validation = getPermissionSchema.safeParse({ ...query, ...params });

  if (!validation.success) {
    return {
      status: Status.InvalidDetails,
      message: validation.error.message,
    };
  }

  const where = validation.data as Prisma.PermissionWhereInput;

  const data = await prisma.permission.findMany({
    ...(Object.keys(where).length > 0 ? { where } : {}),
  });

  return {
    status: Status.Success,
    message: "Permissions retrieved successfully",
    data,
  };
}

/**
 * Retrieves permission groups with optional filters.
 * @param {GetPermissionGroupsInput} query - Query string filters.
 * @param {GetPermissionGroupsInput} params - Route params.
 * @returns {Promise<APIResponse<PermissionGroup[]>>} Permission group list response.
 */
export async function getPermissionGroups(
  query: GetPermissionGroupsInput,
  params: GetPermissionGroupsInput,
): Promise<APIResponse<PermissionGroup[]>> {
  const validation = getPermissionGroupsSchema.safeParse({ ...query, ...params });

  if (!validation.success) {
    return {
      status: Status.InvalidDetails,
      message: validation.error.message,
    };
  }

  const where = validation.data as Prisma.PermissionGroupWhereInput;

  const data = await prisma.permissionGroup.findMany({
    ...(Object.keys(where).length > 0 ? { where } : {}),
  });

  return {
    status: Status.Success,
    message: "Permission groups retrieved successfully",
    data,
  };
}

/**
 * Creates a new user.
 * @param {CreateUserInput} body - Request body payload.
 * @returns {Promise<APIResponse<User>>} Created user response.
 */
export async function createUser(body: CreateUserInput): Promise<APIResponse<User>> {
  const validation = createUserSchema.safeParse(body);

  if (!validation.success) {
    return {
      status: Status.InvalidDetails,
      message: validation.error.message,
    };
  }

  const data = await prisma.user.create({ data: validation.data as never });

  return {
    status: Status.Created,
    message: "User created successfully",
    data,
  };
}

/**
 * Updates a user by id.
 * @param {string | undefined} id - User id.
 * @param {UpdateUserInput} body - Request body payload.
 * @returns {Promise<APIResponse<User>>} Updated user response.
 */
export async function updateUser(id: string | undefined, body: UpdateUserInput): Promise<APIResponse<User>> {
  if (!id) {
    return {
      status: Status.MissingDetails,
      message: "Missing id",
    };
  }

  const validation = updateUserSchema.safeParse(body);

  if (!validation.success) {
    return {
      status: Status.InvalidDetails,
      message: validation.error.message,
    };
  }

  const data = await prisma.user.update({
    where: { id },
    data: validation.data as never,
  });

  return {
    status: Status.Updated,
    message: "User updated successfully",
    data,
  };
}

/**
 * Patches a user by id.
 * @param {string | undefined} id - User id.
 * @param {PatchUserInput} body - Request body payload.
 * @returns {Promise<APIResponse<User>>} Patched user response.
 */
export async function patchUser(id: string | undefined, body: PatchUserInput): Promise<APIResponse<User>> {
  if (!id) {
    return {
      status: Status.MissingDetails,
      message: "Missing id",
    };
  }

  const validation = patchUserSchema.safeParse(body);

  if (!validation.success) {
    return {
      status: Status.InvalidDetails,
      message: validation.error.message,
    };
  }

  const data = await prisma.user.update({
    where: { id },
    data: validation.data as never,
  });

  return {
    status: Status.Updated,
    message: "User patched successfully",
    data,
  };
}
