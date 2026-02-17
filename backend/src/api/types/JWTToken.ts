export interface UserToken {
  sub: string;
  jti: string;
  username: string;
  name?: string;
  permissions?: string[];
  initials?: string;
}
