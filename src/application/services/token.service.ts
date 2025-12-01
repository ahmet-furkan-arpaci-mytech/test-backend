export interface ITokenService {
  issueToken(payload: Record<string, any>): string;
  verifyToken<T = Record<string, any>>(token: string): T;
}
