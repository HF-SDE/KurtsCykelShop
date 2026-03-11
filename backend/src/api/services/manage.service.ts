import { APIResponse, Status } from "@api-types/general.types";
import prisma from "@prisma-instance";
import { Permission, PermissionGroup, Prisma, User } from "@prisma/client";
import { getPermissionSchema } from "@schemas/permission.schemas";
import { getPermissionGroupsSchema } from "@schemas/permissionGroups.schemas";
import { createUserSchema, getUserSchema, patchUserSchema, updateUserSchema } from "@schemas/user.schemas";
import { hash } from "argon2";
import { z } from "zod";

type GetUsersInput = z.input<typeof getUserSchema>;
type GetPermissionsInput = z.input<typeof getPermissionSchema>;
type GetPermissionGroupsInput = z.input<typeof getPermissionGroupsSchema>;
type CreateUserInput = z.input<typeof createUserSchema>;
type UpdateUserInput = z.input<typeof updateUserSchema>;
type PatchUserInput = z.input<typeof patchUserSchema>;
const resetUserPasswordBodySchema = z.object({
  password: z.string().min(8),
});
type ResetUserPasswordInput = z.infer<typeof resetUserPasswordBodySchema>;
const setUserAccountStatusBodySchema = z.object({
  active: z.boolean(),
});
type SetUserAccountStatusInput = z.infer<typeof setUserAccountStatusBodySchema>;

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

  const { id, code, permissionGroupId } = { ...query, ...params };

  const data = await prisma.permission.findMany({
    where: {
      id,
      code,
      permissionGroupId,
    },
    include: {
      permissionGroup: true,
    },
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

  console.log("Creating user with data:", validation.data);

  const data = await prisma.user.create({
    data: {
      username: validation.data.username,
      firstName: validation.data.firstName,
      lastName: validation.data.lastName,
      email: validation.data.email,
      initials: validation.data.initials,
      isActive: validation.data.active ?? true,
      password: await hash(validation.data.password),
      roles: {
        connect: validation.data.UserRoles?.map((roleId) => ({ id: roleId })) ?? [],
      },
    },
  });

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

  const { username, email, initials, firstName, lastName, active, password, UserRoles } = validation.data;

  const hashedPassword = password ? await hash(password) : undefined;

  const data = await prisma.user.update({
    where: { id },
    data: {
      username,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      email,
      initials,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      firstName,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      lastName,
      isActive: active,
      password: hashedPassword,
      roles: {
        connect: UserRoles?.map((roleId) => ({ id: roleId })) ?? [],
      },
    },
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

/**
 * Resets a user password by id.
 * @param {string | undefined} id - User id.
 * @param {ResetUserPasswordInput} body - Request body payload.
 * @returns {Promise<APIResponse<void>>} Password reset response.
 */
export async function resetUserPassword(
  id: string | undefined,
  body: ResetUserPasswordInput,
): Promise<APIResponse<void>> {
  if (!id) {
    return {
      status: Status.MissingDetails,
      message: "Missing id",
    };
  }

  const validation = resetUserPasswordBodySchema.safeParse(body);

  if (!validation.success) {
    return {
      status: Status.InvalidDetails,
      message: validation.error.message,
    };
  }

  const hashedPassword = await hash(validation.data.password);

  await prisma.user.update({
    where: { id },
    data: {
      password: hashedPassword,
    },
  });

  return {
    status: Status.Updated,
    message: "User password reset successfully",
  };
}

/**
 * Enables or disables a user account.
 * @param {string | undefined} id - User id.
 * @param {SetUserAccountStatusInput} body - Request body payload.
 * @returns {Promise<APIResponse<void>>} Account status update response.
 */
export async function setUserAccountStatus(
  id: string | undefined,
  body: SetUserAccountStatusInput,
): Promise<APIResponse<void>> {
  if (!id) {
    return {
      status: Status.MissingDetails,
      message: "Missing id",
    };
  }

  const validation = setUserAccountStatusBodySchema.safeParse(body);

  if (!validation.success) {
    return {
      status: Status.InvalidDetails,
      message: validation.error.message,
    };
  }

  await prisma.user.update({
    where: { id },
    data: {
      isActive: validation.data.active,
    },
  });

  return {
    status: Status.Updated,
    message: validation.data.active ? "User account enabled" : "User account disabled",
  };
}
