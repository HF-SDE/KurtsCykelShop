import { APIResponse, Status } from "@api-types/general.types";
import { PermissionWithAssignment, RoleWithPermissions } from "@api-types/role.types";
import prisma from "@prisma-instance";
import { Prisma, Role } from "@prisma/client";
import { CreateRoleSchema, GetRoleSchema, UpdateRoleSchema } from "@schemas/role.schemas";
import { z } from "zod";

type GetRoleInput = z.input<typeof GetRoleSchema>;
type CreateRoleInput = z.input<typeof CreateRoleSchema>;
type UpdateRoleInput = z.input<typeof UpdateRoleSchema>;

/**
 * Retrieves all roles with optional filters.
 * @param {GetRoleInput} query - Query string filters.
 * @returns {Promise<APIResponse<Role[]>>} Role list response.
 */
export async function getRoles(query: GetRoleInput): Promise<APIResponse<Role[]>> {
  const validation = GetRoleSchema.safeParse(query);

  if (!validation.success) {
    return {
      status: Status.InvalidDetails,
      message: validation.error.message,
    };
  }

  const { id, name, withPermissions, withAllPermissions, withPermissionGroups } = validation.data;

  if (withPermissionGroups && !withPermissions) {
    return {
      status: Status.InvalidDetails,
      message: "withPermissionGroups requires withPermissions to be true",
    };
  }

  if (id || name) {
    const exist = await prisma.role.findUnique({
      where: {
        id,
        OR: [{ name: { contains: name, mode: "insensitive" } }],
      },
      include: {
        permissions: {
          include: {
            permissionGroup: withPermissionGroups,
          },
        },
      },
    });

    if (!exist) {
      return {
        status: Status.NotFound,
        message: "Role(s) not found",
      };
    }
  }

  const data = await prisma.role.findMany({
    where: {
      id: id || undefined,
      name: {
        contains: name,
        mode: "insensitive",
      },
    },
    include: {
      permissions: {
        include: {
          permissionGroup: withPermissionGroups,
        },
      },
    },
  });

  if (withPermissions && withAllPermissions) {
    const roles: RoleWithPermissions[] = [];

    const allPermissions = await prisma.permission.findMany({
      include: {
        permissionGroup: withPermissionGroups,
      },
    });
    for (const role of data) {
      roles.push({
        ...role,
        permissions: allPermissions.map((permission) => ({
          ...permission,
          isAssigned: role.permissions?.some((p) => p.id === permission.id) || false,
        })),
      });
    }

    return {
      status: Status.Success,
      message: "Roles retrieved successfully",
      data: roles,
    };
  } else if (withAllPermissions && !withPermissions) {
    return {
      status: Status.InvalidDetails,
      message: "withAllPermissions requires withPermissions to be true",
    };
  } else
    return {
      status: Status.Success,
      message: "Roles retrieved successfully",
      data: data,
    };
}

/**
 * Retrieves a single role by ID.
 * @param {string | undefined} id - Role ID.
 * @param {GetRoleInput} query - Query string filters.
 * @returns {Promise<APIResponse<RoleWithPermissions>>} Role response.
 */
export async function getRole(id: string | undefined, query: GetRoleInput): Promise<APIResponse<RoleWithPermissions>> {
  const validation = GetRoleSchema.safeParse(query);
  if (!validation.success) {
    return {
      status: Status.InvalidDetails,
      message: validation.error.message,
    };
  }

  if (!id) {
    return {
      status: Status.MissingDetails,
      message: "Role ID is required",
    };
  }

  const { withPermissions, withAllPermissions, withPermissionGroups } = validation.data;

  const data = await prisma.role.findUnique({
    where: { id },
    include: {
      permissions: withPermissions
        ? {
            include: {
              permissionGroup: withPermissionGroups,
            },
          }
        : false,
    },
  });

  if (!data) {
    return {
      status: Status.NotFound,
      message: "Role not found",
    };
  }

  const permissions: PermissionWithAssignment[] = [];

  if (withAllPermissions) {
    const allPermissions = await prisma.permission.findMany({
      include: {
        permissionGroup: withPermissionGroups,
      },
    });
    permissions.push(
      ...allPermissions.map((permission) => ({
        ...permission,
        isAssigned: data?.permissions?.some((p) => p.id === permission.id) || false,
      })),
    );
  }

  const response = {
    ...data,
    permissions: withAllPermissions ? permissions : data?.permissions,
  };

  return {
    status: Status.Success,
    message: "Role retrieved successfully",
    data: response,
  };
}

/**
 * Creates a new role.
 * @param {CreateRoleInput} body - Request body payload.
 * @returns {Promise<APIResponse<Role>>} Created role response.
 */
export async function createRole(body: CreateRoleInput): Promise<APIResponse<Role>> {
  const validation = CreateRoleSchema.safeParse(body);

  if (!validation.success) {
    return {
      status: Status.InvalidDetails,
      message: validation.error.message,
    };
  }

  try {
    const data = await prisma.role.create({
      data: {
        name: validation.data.name,
        description: validation.data.description || null,
        permissions: validation.data.permissions
          ? {
              connect: validation.data.permissions.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        permissions: true,
        users: true,
      },
    });

    return {
      status: Status.Created,
      message: "Role created successfully",
      data,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          status: Status.Failed,
          message: "Role name already exists",
        };
      }
    }
    throw error;
  }
}

/**
 * Updates an existing role.
 * @param {string | undefined} id - Role ID.
 * @param {UpdateRoleInput} body - Request body payload.
 * @returns {Promise<APIResponse<Role>>} Updated role response.
 */
export async function updateRole(id: string | undefined, body: UpdateRoleInput): Promise<APIResponse<Role>> {
  if (!id) {
    return {
      status: Status.MissingDetails,
      message: "Role ID is required",
    };
  }

  const validation = UpdateRoleSchema.safeParse(body);

  if (!validation.success) {
    return {
      status: Status.InvalidDetails,
      message: validation.error.message,
    };
  }

  try {
    for (const permission of body.permissions || []) {
      if (!permission) continue;

      const existingPermission = await prisma.permission.findUnique({
        where: { id: permission },
      });

      if (!existingPermission) {
        return {
          status: Status.InvalidDetails,
          message: `Permission with ID ${permission} does not exist`,
        };
      }

      await prisma.permission.update({
        where: { id: permission },
        data: { roles: { connect: { id } } },
      });
    }

    const updatedRole = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          where: { id: { notIn: body.permissions || [] } },
        },
      },
    });

    console.log("Updated role with disconnected permissions:", updatedRole);

    await prisma.role.update({
      where: { id },
      data: {
        name: validation.data.name,
        description: validation.data.description || null,
        permissions: {
          disconnect: updatedRole?.permissions.map((p) => ({ id: p.id })) || [],
        },
      },
    });

    return {
      status: Status.Updated,
      message: "Role updated successfully",
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          status: Status.NotFound,
          message: "Role not found",
        };
      }
      if (error.code === "P2002") {
        return {
          status: Status.Failed,
          message: "Role name already exists",
        };
      }
    }
    throw error;
  }
}
