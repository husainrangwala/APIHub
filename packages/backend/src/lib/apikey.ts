import crypto from 'crypto';

export const generateApiKey = (): string => {
    const rawKey = 'apihub_' + crypto.randomBytes(32).toString('hex');
    return rawKey;
};

export const hashApiKey = (key: string): string => {
    return crypto.createHash('sha256').update(key).digest('hex');
};
