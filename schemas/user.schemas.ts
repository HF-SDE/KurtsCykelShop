import { z } from "zod";

import { EmailSchema, UuidSchema } from "./general.schemas";

const usernameSchema = z.string().regex(/^[a-zA-Z0-9]+$/, "Username must be alphanumeric");

export const getUserSchema = z.object({
  id: UuidSchema.optional(),
  username: usernameSchema.optional(),
  email: EmailSchema.optional(),
});

export const createUserSchema = z.object({
  name: z.string().min(1),
  username: usernameSchema,
  initials: z.string().max(6),
  active: z.boolean().optional(),
  password: z.string().min(8),
  UserRoles: z.array(z.string()).optional(),
});

export const patchUserSchema = z.object({
  name: z.string().min(1),
  username: usernameSchema,
  initials: z.string().max(6),
  active: z.boolean(),
  password: z.string().min(8).optional(),
  UserRoles: z.array(z.string()).optional(),
});

export const updateUserSchema = z.object({
  username: usernameSchema.optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: EmailSchema.optional(),
  initials: z.string().max(6).optional(),
  active: z.boolean().optional(),
  password: z.string().min(8).optional(),
  UserRoles: z.array(z.string()).optional(),
});

export const resetUserPasswordSchema = z.object({
  password: z.string().min(8),
});
