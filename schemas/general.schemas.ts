import { z } from "zod";

export const UuidSchema = z.uuid("Invalid UUID v4 format");

export const EmailSchema = z.email("Invalid email address");

export const StringOrNumberSchema = z.union([
  z.number(),
  z.string().transform((val, ctx) => {
    const parsed = Number(val);
    if (isNaN(parsed)) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid number format",
      });
      return z.NEVER;
    }
    return parsed;
  }),
]);
