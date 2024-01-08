import * as jose from 'jose';
import * as crypto from 'node:crypto';

export const JWT_ALGORITHM = 'HS256';

export async function createJWT(algorithm: string, jwtSecret: string, payload: object): Promise<string> {
  return await new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: algorithm })
    .setIssuedAt()
    .setExpirationTime('2d')
    .sign(crypto.createSecretKey(jwtSecret, 'utf-8'));
}
