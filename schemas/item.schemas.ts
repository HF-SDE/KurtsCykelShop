import { z } from "zod";

export const CreateItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  quantity: z.coerce.number().int().positive("Quantity must be a positive integer"),
  unitId: z.uuid(),
  minSellQuantity: z.coerce.number().int().positive("Minimum sell quantity must be a positive integer"),
  isPublic: z.boolean(),
  price: z.coerce.number().positive("Price must be a positive number"),
  purchasePrice: z.coerce.number().positive("Purchase price must be a positive number"),
});

export type CreateItemType = z.infer<typeof CreateItemSchema>;
