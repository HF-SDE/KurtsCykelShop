import { z } from "zod";

export const CreateLocationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const EditLocationSchema = CreateLocationSchema.partial();

export type CreateLocationType = z.infer<typeof CreateLocationSchema>;
export type EditLocationType = z.infer<typeof EditLocationSchema>;
