import { z } from "zod";

export const RoleNameSchema = z
  .string()
  .trim()
  .min(2, "Role name must be at least 2 characters")
  .max(50, "Role name must be at most 50 characters");

export const RoleSchema = z.object({
  id: z.string().uuid(),
  name: RoleNameSchema,
  description: z.string().trim().max(255).optional().nullable(),
  permissions: z.array(z.string().uuid()).default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CreateRoleSchema = z.object({
  name: RoleNameSchema,
  description: z.string().trim().max(255).optional(),
  permissions: z.array(z.string().uuid()).default([]),
});

export const UpdateRoleSchema = z
  .object({
    name: RoleNameSchema.optional(),
    description: z.string().trim().max(255).nullable().optional(),
    permissions: z.array(z.string().uuid()).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export const RoleIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type Role = z.infer<typeof RoleSchema>;
export type CreateRoleInput = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;
