import { Router } from 'express';
import type { Request, Response } from 'express';
import { SignInSchema, SignUpSchema } from './auth.types';
import { authService } from './auth.service';
import { AppError } from '../../lib/errors';

const authRouter = Router();

authRouter.post('/signup', async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, password } = SignUpSchema.parse(req.body);
        const user = await authService.signup(firstName, lastName, email, password);
        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

authRouter.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = SignInSchema.parse(req.body);
        const { token, user } = await authService.login(email, password);
        res.json({ message: 'Login successful', token, user });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export { authRouter };
