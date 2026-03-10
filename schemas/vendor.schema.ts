import { z } from "zod";

export const CreateVendorSchema = z.object({
  name: z.string().min(1, "Navn er påkrævet"),
  address: z.string().optional(),
  mail: z.email("Ugyldig email").optional(),
  phone: z.string().optional(),
  url: z.url("Ugyldig URL").optional(),
  description: z.string().optional(),
});

export const EditVendorSchema = CreateVendorSchema.partial();

export type CreateVendorType = z.infer<typeof CreateVendorSchema>;
export type EditVendorType = z.infer<typeof EditVendorSchema>;
