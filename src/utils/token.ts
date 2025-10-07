import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET no está definido");
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1h';

export interface TokenClaims extends JwtPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  [key: string]: any;
}

export function generateToken(claims: TokenClaims, options?: SignOptions): string {
  return jwt.sign(claims, JWT_SECRET!, {
    expiresIn: JWT_EXPIRES_IN,
    ...options,
  });
}

export function getClaimsFromToken(token: string): TokenClaims | null {
  try {
    return jwt.verify(token, JWT_SECRET!) as TokenClaims;
  } catch (err) {
    return null;
  }
}