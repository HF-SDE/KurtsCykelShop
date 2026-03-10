import { APIResponse, TypedQuery } from "@api-types/general.types";
import { RoleWithPermissions } from "@api-types/role.types";
import { Role } from "@prisma/client";
import { CreateRoleSchema, GetRoleSchema, UpdateRoleSchema } from "@schemas/role.schemas";
import * as RoleService from "@services/role.service";
import { getHttpStatusCode } from "@utils/Utils";
import { Request, Response } from "express";
import { z } from "zod";

type GetRoleInput = z.input<typeof GetRoleSchema>;
type CreateRoleInput = z.input<typeof CreateRoleSchema>;
type UpdateRoleInput = z.input<typeof UpdateRoleSchema>;

/**
 * Returns all roles with optional filters.
 * @param {Request<Record<string, string>, unknown, unknown, GetRoleInput>} req - Express request.
 * @param {Response} res - Express response.
 * @returns {Promise<void>} No return value.
 */
export async function getRoles(
  req: Request<Record<string, string>, unknown, APIResponse<Role[]>, GetRoleInput>,
  res: Response,
): Promise<void> {
  const response = await RoleService.getRoles(req.query);

  res.status(getHttpStatusCode(response.status)).json(response).end();
}

/**
 * Returns a single role by ID.
 * @param {Request<{ id?: string }, unknown, unknown, GetRoleInput>} req - Express request.
 * @param {Response} res - Express response.
 * @returns {Promise<void>} No return value.
 */
export async function getRole(
  req: Request<{ id?: string }, unknown, APIResponse<RoleWithPermissions>, TypedQuery<GetRoleInput>>,
  res: Response,
): Promise<void> {
  const response = await RoleService.getRole(typeof req.params.id === "string" ? req.params.id : undefined, req.query);

  res.status(getHttpStatusCode(response.status)).json(response).end();
}

/**
 * Creates a new role.
 * @param {Request<Record<string, string>, unknown, CreateRoleInput>} req - Express request.
 * @param {Response} res - Express response.
 * @returns {Promise<void>} No return value.
 */
export async function createRole(
  req: Request<Record<string, string>, APIResponse<Role>, CreateRoleInput>,
  res: Response,
): Promise<void> {
  const response = await RoleService.createRole(req.body);

  res.status(getHttpStatusCode(response.status)).json(response).end();
}

/**
 * Updates an existing role.
 * @param {Request<{ id?: string }, unknown, UpdateRoleInput>} req - Express request.
 * @param {Response} res - Express response.
 * @returns {Promise<void>} No return value.
 */
export async function updateRole(
  req: Request<{ id?: string }, APIResponse<Role>, UpdateRoleInput>,
  res: Response,
): Promise<void> {
  const response = await RoleService.updateRole(
    typeof req.params.id === "string" ? req.params.id : undefined,
    req.body,
  );

  res.status(getHttpStatusCode(response.status)).json(response).end();
}
