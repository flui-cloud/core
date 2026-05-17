export interface JwtPayload {
  sub: string;
  email: string;
  iss: string;
  aud: string | string[];
  'urn:zitadel:iam:org:project:roles'?: Record<string, Record<string, string>>;
}
