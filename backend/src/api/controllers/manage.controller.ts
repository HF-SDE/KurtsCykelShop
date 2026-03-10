import { getPermissionSchema } from "@schemas/permission.schemas";
import { getPermissionGroupsSchema } from "@schemas/permissionGroups.schemas";
import { createUserSchema, getUserSchema, patchUserSchema, updateUserSchema } from "@schemas/user.schemas";
import * as ManageService from "@services/manage.service";
import { getHttpStatusCode } from "@utils/Utils";
import { Request, Response } from "express";
import { z } from "zod";

type GetUsersInput = z.input<typeof getUserSchema>;
type GetPermissionsInput = z.input<typeof getPermissionSchema>;
type GetPermissionGroupsInput = z.input<typeof getPermissionGroupsSchema>;
type CreateUserInput = z.input<typeof createUserSchema>;
type UpdateUserInput = z.input<typeof updateUserSchema>;
type PatchUserInput = z.input<typeof patchUserSchema>;
type ResetUserPasswordInput = { password: string };
type SetUserAccountStatusInput = { active: boolean };

/**
 * Returns users with roles and permissions.
 * @param {Request<Record<string, string>, unknown, unknown, GetUsersInput>} req - Express request.
 * @param {Response} res - Express response.
 * @returns {Promise<void>} No return value.
 */
export async function getUsers(req: Request, res: Response): Promise<void> {
  const response = await ManageService.getUsers(req.query as GetUsersInput, req.params as GetUsersInput);

  res.status(getHttpStatusCode(response.status)).json(response).end();
}

/**
 * Returns permissions.
 * @param {Request<Record<string, string>, unknown, unknown, GetPermissionsInput>} req - Express request.
 * @param {Response} res - Express response.
 * @returns {Promise<void>} No return value.
 */
export async function getPermissions(req: Request, res: Response): Promise<void> {
  const response = await ManageService.getPermissions(
    req.query as GetPermissionsInput,
    req.params as GetPermissionsInput,
  );

  res.status(getHttpStatusCode(response.status)).json(response).end();
}

/**
 * Returns permission groups.
 * @param {Request<Record<string, string>, unknown, unknown, GetPermissionGroupsInput>} req - Express request.
 * @param {Response} res - Express response.
 * @returns {Promise<void>} No return value.
 */
export async function getPermissionGroups(req: Request, res: Response): Promise<void> {
  const response = await ManageService.getPermissionGroups(
    req.query as GetPermissionGroupsInput,
    req.params as GetPermissionGroupsInput,
  );

  res.status(getHttpStatusCode(response.status)).json(response).end();
}

/**
 * Creates a new user.
 * @param {Request<Record<string, string>, unknown, CreateUserInput>} req - Express request.
 * @param {Response} res - Express response.
 * @returns {Promise<void>} No return value.
 */
export async function createUser(
  req: Request<Record<string, string>, unknown, CreateUserInput>,
  res: Response,
): Promise<void> {
  const response = await ManageService.createUser(req.body);

  res.status(getHttpStatusCode(response.status)).json(response).end();
}

/**
 * Updates an existing user.
 * @param {Request<{ id?: string }, unknown, UpdateUserInput>} req - Express request.
 * @param {Response} res - Express response.
 * @returns {Promise<void>} No return value.
 */
export async function updateUser(
  req: Request<{ id?: string }, unknown, UpdateUserInput>,
  res: Response,
): Promise<void> {
  const response = await ManageService.updateUser(
    typeof req.params.id === "string" ? req.params.id : undefined,
    req.body,
  );

  res.status(getHttpStatusCode(response.status)).json(response).end();
}

/**
 * Patches an existing user.
 * @param {Request<{ id?: string }, unknown, PatchUserInput>} req - Express request.
 * @param {Response} res - Express response.
 * @returns {Promise<void>} No return value.
 */
export async function patchUser(req: Request<{ id?: string }, unknown, PatchUserInput>, res: Response): Promise<void> {
  const response = await ManageService.patchUser(
    typeof req.params.id === "string" ? req.params.id : undefined,
    req.body,
  );

  res.status(getHttpStatusCode(response.status)).json(response).end();
}

/**
 * Resets a user's password.
 * @param {Request<{ id?: string }, unknown, ResetUserPasswordInput>} req - Express request.
 * @param {Response} res - Express response.
 * @returns {Promise<void>} No return value.
 */
export async function resetUserPassword(
  req: Request<{ id?: string }, unknown, ResetUserPasswordInput>,
  res: Response,
): Promise<void> {
  const response = await ManageService.resetUserPassword(
    typeof req.params.id === "string" ? req.params.id : undefined,
    req.body,
  );

  res.status(getHttpStatusCode(response.status)).json(response).end();
}

/**
 * Sets a user's account status (active/disabled).
 * @param {Request<{ id?: string }, unknown, SetUserAccountStatusInput>} req - Express request.
 * @param {Response} res - Express response.
 * @returns {Promise<void>} No return value.
 */
export async function setUserAccountStatus(
  req: Request<{ id?: string }, unknown, SetUserAccountStatusInput>,
  res: Response,
): Promise<void> {
  const response = await ManageService.setUserAccountStatus(
    typeof req.params.id === "string" ? req.params.id : undefined,
    req.body,
  );

  res.status(getHttpStatusCode(response.status)).json(response).end();
}
