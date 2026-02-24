import { z } from "zod";

import { UuidSchema } from "./general.schemas";

export const getPermissionSchema = z.object({
  id: UuidSchema.optional(),
  code: z.string().min(1).optional(),
  permissionGroupId: UuidSchema.optional(),
});
