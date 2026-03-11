import { z } from "zod";

export const CreateUnitSchema = z.object({
  name: z.string().min(1, "Navn er påkrævet"),
  code: z.string().min(1, "Kode er påkrævet"),
});

export const EditUnitSchema = CreateUnitSchema.partial();

export type CreateUnitType = z.infer<typeof CreateUnitSchema>;
export type EditUnitType = z.infer<typeof EditUnitSchema>;
