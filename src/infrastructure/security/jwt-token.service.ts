import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { injectable } from "inversify";
import { ITokenService } from "../../application/services/token.service";

const JWT_SECRET: Secret = process.env.JWT_SECRET ?? "change-me";
const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) ?? "1h";

@injectable()
export class JwtTokenService implements ITokenService {
  issueToken(payload: Record<string, any>): string {
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
    return jwt.sign(payload, JWT_SECRET, options);
  }

  verifyToken<T = Record<string, any>>(token: string): T {
    return jwt.verify(token, JWT_SECRET) as T;
  }
}
