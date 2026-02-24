import { APIResponse, Status } from "@api-types/general.types";
import { Prisma, Role } from "@prisma";
import prisma from "@prisma-instance";
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

  const where: Prisma.RoleWhereInput = {};
  const validated = validation.data;

  if (validated.id) {
    where.id = validated.id;
  }

  if (validated.name) {
    where.name = {
      contains: validated.name,
      mode: "insensitive",
    };
  }

  const data = await prisma.role.findMany({
    ...(Object.keys(where).length > 0 ? { where } : {}),
    include: {
      permissions: true,
    },
  });

  return {
    status: Status.Success,
    message: "Roles retrieved successfully",
    data,
  };
}

/**
 * Retrieves a single role by ID.
 * @param {string | undefined} id - Role ID.
 * @returns {Promise<APIResponse<Role>>} Role response.
 */
export async function getRole(id: string | undefined): Promise<APIResponse<Role>> {
  if (!id) {
    return {
      status: Status.MissingDetails,
      message: "Role ID is required",
    };
  }

  const data = await prisma.role.findUnique({
    where: { id },
    include: {
      permissions: true,
    },
  });

  if (!data) {
    return {
      status: Status.NotFound,
      message: "Role not found",
    };
  }

  return {
    status: Status.Success,
    message: "Role retrieved successfully",
    data,
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
    const data = await prisma.role.update({
      where: { id },
      data: {
        name: validation.data.name,
        description: validation.data.description,
        permissions: validation.data.permissions
          ? {
              set: validation.data.permissions.map((permId) => ({
                id: permId,
              })),
            }
          : undefined,
      },
      include: {
        permissions: true,
        users: true,
      },
    });

    return {
      status: Status.Updated,
      message: "Role updated successfully",
      data,
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
