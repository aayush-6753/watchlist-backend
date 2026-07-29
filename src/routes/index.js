const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const movieRoutes = require('./movies');
const searchRoutes = require('./search');
const genreRoutes = require('./genres');

router.use('/auth', authRoutes);
router.use('/movies', movieRoutes);
router.use('/search', searchRoutes);
router.use('/genres', genreRoutes);

router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date()
    });
});

module.exports = router;