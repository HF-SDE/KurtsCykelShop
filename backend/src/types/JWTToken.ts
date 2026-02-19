export interface UserToken {
  sub: string;
  jti: string;
  username: string;
  firstName?: string;
  lastName?: string;
  permissions?: string[];
  initials?: string;
}
