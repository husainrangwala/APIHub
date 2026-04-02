import { db } from '../../config/db';
import { users } from '../../db/schema';
import type { NewUser } from '../../db/schema';
import bcrypt from 'bcryptjs';
import { AppError } from '../../lib/errors';

const hashPassword = async (password: string): Promise<string> => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
};

const signup = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
        const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, email),
        });

        if (user) {
            throw new AppError('Email already in use', 409);
        }
        const passwordHash = await hashPassword(password);
        const newUser: NewUser = {
            email,
            passwordHash,
            firstName,
            lastName,
        };
        const [createdUser] = await db.insert(users).values(newUser).returning();
        if (!createdUser) {
            throw new Error('Failed to create user');
        }

        return {
            id: createdUser.id,
            email: createdUser.email,
            firstName: createdUser.firstName,
            lastName: createdUser.lastName,
            createdAt: createdUser.createdAt,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error('Signup Error:', error);
        throw new Error('Internal Server Error');
    }
};

export const authService = {
    signup,
};
