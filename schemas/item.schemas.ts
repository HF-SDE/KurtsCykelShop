import { z } from "zod";

export const ItemFiltersSchema = z.object({
  isPublic: z
    .string()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined))
    .optional(),
  statusId: z.uuid().optional(),
  locationId: z.uuid().optional(),
  vendorId: z.uuid().optional(),
});

export const CreateItemSchema = z.object({
  name: z.string().min(1, "Navn er påkrævet"),
  description: z.string().optional(),
  quantity: z.coerce.number().int().positive("Antal skal være et positivt heltal"),
  unitId: z.uuid("Enhed er påkrævet"),
  minSellQuantity: z.coerce.number().int().positive("Minimums salgsantal skal være et positivt heltal"),
  isPublic: z.boolean(),
  price: z.coerce.number().positive("Pris skal være et positivt tal"),
  purchasePrice: z.coerce.number().positive("Indkøbspris skal være et positivt tal"),
  vendorId: z.uuid("Leverandør er påkrævet"),
  statusId: z.uuid("Status er påkrævet"),
  locationId: z.uuid("Lokation er påkrævet"),
  barcodes: z.array(z.string()).optional(),
});

export const EditItemSchema = CreateItemSchema.partial();

export type ItemFiltersType = z.infer<typeof ItemFiltersSchema>;
export type CreateItemType = z.infer<typeof CreateItemSchema>;
export type EditItemType = z.infer<typeof EditItemSchema>;
