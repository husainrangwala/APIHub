import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
}
const JWT_EXPIRES_IN = '7d';

const hashPassword = async (password: string): Promise<string> => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
};

const comparePasswords = async (password: string, hash: string): Promise<boolean> => {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
};

const createJWT = (payload: object): string => {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return token;
};

const decodeJwt = (token: string): jwt.JwtPayload => {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    return decoded;
};

export { hashPassword, createJWT, decodeJwt, comparePasswords };
