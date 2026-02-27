import { z } from "zod";

import { StringOrNumberSchema, UuidSchema } from "./general.schemas";

// Alternative simpler version using coerce (uncomment to use instead):
// export const StringOrNumberSchema = z.coerce.number();

export const timeRangeEnum = ["all", "today", "week", "month", "quarter", "year"] as const;
export const statusEnum = ["completed", "cancelled", "in-progress", "pending"] as const;

export type timeRangeTypesFromEnum = (typeof timeRangeEnum)[number];
export type statusTypesFromEnum = (typeof statusEnum)[number];

export const ServiceOrdersPaginatedSchema = z.object({
  page: StringOrNumberSchema.optional(),
  limit: StringOrNumberSchema.optional(),
  search: z.string().optional(),
  timeRange: z.enum(timeRangeEnum).optional(),
  statuses: z.array(z.enum(statusEnum)).optional(),
});

/**
 * Schema for updating a service order
 */
export const ServiceOrderUpdateSchema = z.object({
  description: z.string().min(1, "Description cannot be empty").optional(),
  status: z.enum(statusEnum).optional(),
  estimatedCompletion: z.string().datetime("Invalid date format").optional(),
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

/**
 * Schema for creating a new service order.
 * Either provide an existing customerId OR full customer details to create a new one.
 */
export const ServiceOrderCreateSchema = z
  .object({
    // Existing customer ID (optional - if provided, uses existing customer)
    customerId: UuidSchema.optional(),

    // New customer fields (required if customerId is not provided)
    customerFirstName: z.string().min(1, "Fornavn er påkrævet").max(100).optional(),
    customerLastName: z.string().min(1, "Efternavn er påkrævet").max(100).optional(),
    customerEmail: z.email("Ugyldig email").optional(),
    customerPhone: z.string().max(20).optional(),

    // Service order fields
    description: z.string().min(1, "Beskrivelse er påkrævet").max(2000, "Beskrivelse er for lang"),
    estimatedCompletion: z.string().datetime("Ugyldigt datoformat"),
    assignedToId: UuidSchema.nullable().optional(),
  })
  .refine(
    (data) => {
      // Either customerId must be set, or all required customer fields must be provided
      if (data.customerId) return true;
      return !!data.customerFirstName && !!data.customerLastName && !!data.customerEmail;
    },
    {
      message: "Enten kunde-ID eller fulde kundeoplysninger (fornavn, efternavn, email) er påkrævet",
      path: ["customerId"],
    },
  );

export type ServiceOrderCreate = z.infer<typeof ServiceOrderCreateSchema>;

/**
 * Schema for searching customers by query string
 */
export const CustomerSearchSchema = z.object({
  q: z.string().max(200).optional(),
});

export type CustomerSearch = z.infer<typeof CustomerSearchSchema>;
