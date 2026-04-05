import { db } from '../../config/db';
import { users } from '../../db/schema';
import type { NewUser } from '../../db/schema';
import { AppError } from '../../lib/errors';
import { comparePasswords, createJWT, hashPassword } from '../../utils/auth.utils';

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

const login = async (email: string, password: string) => {
    try {
        const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, email),
        });
        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }
        const isPasswordValid = await comparePasswords(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new AppError('Invalid email or password', 401);
        }
        const token = createJWT({ id: user.id, email: user.email });

        const { passwordHash, ...userWithoutPassword } = user;
        return { token, user: userWithoutPassword };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error('Login Error:', error);
        throw new Error('Internal Server Error');
    }
};

export const authService = {
    signup,
    login,
};
