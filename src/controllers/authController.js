const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, username, verifyToken, userId) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 465,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const verifyUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verifyToken}&id=${userId}`;

    await transporter.sendMail({
        from: `"${process.env.APP_NAME || 'SeenIt'}" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: `Verify your ${process.env.APP_NAME || 'SeenIt'} account`,
        html: `
            <div style="background-color: #0f172a; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; max-width: 500px; margin: 0 auto; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="font-size: 26px; font-weight: 800; color: #38bdf8; margin: 0;">Welcome to ${process.env.APP_NAME || 'SeenIt'}</h1>
                </div>
                
                <div style="background-color: #1e293b; padding: 24px; border-radius: 12px; border: 1px solid #334155;">
                    <p style="font-size: 18px; font-weight: 600; color: #f8fafc; margin-top: 0;">
                        Hey ${username}! 👋
                    </p>
                    <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                        Thanks for signing up. Please verify your email address to complete your registration and activate your account.
                    </p>
                    
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${verifyUrl}" style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: #ffffff; font-weight: 700; padding: 14px 28px; text-decoration: none; border-radius: 9999px; display: inline-block; font-size: 16px; box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.39);">
                            Verify Email
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #94a3b8; margin-bottom: 8px;">
                        If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    <p style="font-size: 12px; word-break: break-all; color: #38bdf8; background-color: #0f172a; padding: 10px; border-radius: 6px; border: 1px solid #1e293b;">
                        <a href="${verifyUrl}" style="color: #38bdf8; text-decoration: none;">${verifyUrl}</a>
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 24px;">
                    <p style="font-size: 12px; color: #64748b; margin: 0;">
                        This verification link expires in 24 hours. If you did not create an account, you can ignore this email.
                    </p>
                </div>
            </div>
        `
    });
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // 1. Check if username or email is already in use
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already in use' });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Generate verification token & expiry (24 hours)
        const verifyToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

        // 4. Create user (isVerified defaults to false)
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            verificationToken: verifyToken,
            verificationTokenExpires: tokenExpiry
        });

        // 5. Send verification email
        await sendVerificationEmail(user.email, user.username, verifyToken, user._id);

        res.status(201).json({
            message: 'Registration successful! Please check your email to verify your account.'
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/auth/verify-email
exports.verifyEmail = async (req, res, next) => {
    try {
        const { token, id } = req.query;

        if (!token || !id) {
            return res.status(400).json({ error: 'Invalid verification request' });
        }

        // Find user with matching ID, valid token, and non-expired token
        const user = await User.findOne({
            _id: id,
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired verification token' });
        }

        // Mark as verified and clear tokens
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully! You can now log in.' });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password match
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Block login if email hasn't been verified yet
        if (!user.isVerified) {
            return res.status(403).json({ 
                error: 'Please verify your email address before logging in.' 
            });
        }

        // Generate JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Login successful',
            token,
            user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (error) {
        next(error);
    }
};