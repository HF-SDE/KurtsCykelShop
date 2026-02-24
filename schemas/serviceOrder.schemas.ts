import { z } from "zod";

import { UuidSchema } from "./general.schemas";

/**
 * Schema for updating a service order
 */
export const ServiceOrderUpdateSchema = z.object({
  description: z.string().min(1, "Description cannot be empty").optional(),
  estimatedCompletion: z.string().datetime("Invalid date format").optional(),
  completedAt: z.string().datetime("Invalid date format").nullable().optional(),
  assignedToId: UuidSchema.nullable().optional(),
});

export type ServiceOrderUpdate = z.infer<typeof ServiceOrderUpdateSchema>;

/**
 * Schema for adding a repair to a service order
 */
export const AddRepairSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().min(1, "Description is required").max(1000, "Description too long"),
});

export type AddRepair = z.infer<typeof AddRepairSchema>;

/**
 * Schema for adding a part/product to a service order
 */
export const AddPartSchema = z.object({
  itemId: UuidSchema,
  quantity: z.number().int("Quantity must be an integer").positive("Quantity must be positive"),
});

export type AddPart = z.infer<typeof AddPartSchema>;
