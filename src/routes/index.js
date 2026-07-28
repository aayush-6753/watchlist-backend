const express = require('express');
const router = express.Router();

const movieRoutes = require('./movies');
const searchRoutes = require('./search');
const genreRoutes = require('./genres');

router.use('/movies', movieRoutes);
router.use('/search', searchRoutes);
router.use('/genres', genreRoutes);

module.exports = router;