import { z } from "zod";

export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(255)
  .refine((val) => /[A-Z]/.test(val), {
    message: "Password must contain one uppercase letter",
  })
  .refine((val) => /[a-z]/.test(val), {
    message: "Password must contain one lowercase letter",
  })
  .refine((val) => /[0-9]/.test(val), {
    message: "Password must contain one number",
  })
  .refine((val) => /[!@#$%^&*(),.?":{}|<>=´`'£¤/7/\\\]§;]/.test(val), {
    message: "Password must contain one special character",
  });
