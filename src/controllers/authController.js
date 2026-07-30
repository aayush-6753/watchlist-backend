const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, verifyToken, userId) => {
    // 1. Create the transporter using Mailtrap SMTP
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 2525,
        secure: false, // false for port 2525, 587, or 25
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const verifyUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verifyToken}&id=${userId}`;

    // 2. Send the email
    await transporter.sendMail({
        from: `"Your App" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: 'Verify your email address',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Welcome!</h2>
                <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
                <p><a href="${verifyUrl}" style="background: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
                <p>Or copy and paste this link in your browser:</p>
                <p><a href="${verifyUrl}">${verifyUrl}</a></p>
                <p>This link will expire in 24 hours.</p>
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
        await sendVerificationEmail(user.email, verifyToken, user._id);

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