import { z } from "zod";

export const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const TokenSchema = z.object({
  token: z.string().regex(/^([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-+/=]*)$/),
});

export type LoginType = z.infer<typeof LoginSchema>;
export type TokenType = z.infer<typeof TokenSchema>;
