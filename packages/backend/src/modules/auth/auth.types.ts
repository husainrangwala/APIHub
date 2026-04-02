import z from 'zod';

const SignUpSchema = z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().max(50),
    email: z.email(),
    password: z
        .string()
        .min(8)
        .max(100)
        .regex(
            /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/,
            'Password must contain at least one letter and one number',
        ),
});

export { SignUpSchema };
