import { z } from "zod";

export const UuidSchema = z
  .string()
  .uuid("Invalid UUID v4 format");

export const EmailSchema = z
  .string()
  .email("Invalid email address");