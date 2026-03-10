import { z } from "zod";

import { PasswordSchema } from "./password.schemas";

export const ChangePasswordBase64Schema = z.object({
  newPassword: z.base64(),
  oldPassword: z.base64(),
});

export const ChangePasswordSchema = z
  .object({
    newPassword: PasswordSchema,
    oldPassword: z.string(),
  })
  .refine((data) => data.newPassword !== data.oldPassword, {
    message: "Your new password must not be the same as your old password",
    path: ["newPassword"],
  });

export const jwtTokenSchema = z
  .string()
  .regex(/^([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-+/=]*)$/, "Invalid JWT token format");
