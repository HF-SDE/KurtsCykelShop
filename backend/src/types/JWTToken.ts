import { type Permission } from "@permission-types";

export interface UserToken {
  sub: string;
  jti: string;
  username: string;
  firstName?: string;
  lastName?: string;
  permissions?: Permission[];
  initials?: string;
}
