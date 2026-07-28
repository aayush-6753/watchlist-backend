const express = require('express');
const router = express.Router();

const { getAllMovies, addMovie, toggleWatchedStatus, getMovieById, updateMovieDetails, deleteMovie } = require('../services/movieService');


// GET /api/movies - Get all saved movies
router.get('/', getAllMovies);

// POST /api/movies - Add movie to watchlist
router.post('/', addMovie);

// PATCH /api/movies/:id/watched - Toggle watched status
router.patch('/:id/watched', toggleWatched);

// GET /api/movies/:id - Get single movie
router.get('/:id', getMovieById);

// PATCH /api/movies/:id - Update movie details
router.patch('/:id', updateMovie);

// DELETE /api/movies/:id - Remove movie
router.delete('/:id', deleteMovie);

module.exports = router;