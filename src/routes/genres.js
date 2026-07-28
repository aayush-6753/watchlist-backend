const express = require('express');
const router = express.Router();

const { getAllGenres, getMoviesByGenre } = require('../services/genreService');

// GET /api/genres - Get list of all distinct saved genres
router.get('/', getAllGenres);

// GET /api/genres/:genreName - Fetch movies matching a genre (e.g., /api/genres/Sci-Fi)
router.get('/:genreName', getMoviesByGenre);

module.exports = router;