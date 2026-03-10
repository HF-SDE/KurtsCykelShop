// types.d.ts
import { User as PrismaUser, Role } from "@prisma/client";

declare global {
  namespace Express {
    interface User extends PrismaUser {
      roles: (Role | { permissions: [] })[];
    }
  }
}
