const { z } = require('zod');

const ALLOWED_DOMAINS = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];

const registerSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z
        .string()
        .email('Invalid email address')
        .refine((email) => {
            const domain = email.split('@')[1]?.toLowerCase();
            return ALLOWED_DOMAINS.includes(domain);
        }, { message: 'Invalid email address' }),
    password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});

// Make sure both are explicitly exported in an object
module.exports = { registerSchema, loginSchema };