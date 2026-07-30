const express = require('express');
const router = express.Router();

// 1. Destructure verifyEmail along with register and login
const { register, login, verifyEmail } = require('../controllers/authController');

// 2. Import the Validation Middleware
const validate = require('../middleware/validateMiddleware');

// 3. Import the Schemas
const { registerSchema, loginSchema } = require('../validators/authValidator');

// 4. Connect them
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/verify-email', verifyEmail); // 👈 Works now!

module.exports = router;