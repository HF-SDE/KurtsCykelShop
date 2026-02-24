import { z } from "zod";

import { UuidSchema } from "./general.schemas";

export const getPermissionGroupsSchema = z.object({
  id: UuidSchema.optional(),
});
