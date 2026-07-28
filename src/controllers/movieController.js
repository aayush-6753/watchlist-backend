const Movie = require('../models/Movie');

// GET /api/movies - Get all saved items
exports.getMovies = async (req, res) => {
    try {
        const movies = await Movie.find().sort({ createdAt: -1 });
        res.json({ count: movies.length, data: movies });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/movies - Add a movie/series to watchlist
exports.addMovie = async (req, res) => {
    try {
        const { imdbId, title, posterUrl, genres, type } = req.body;

        const existingMovie = await Movie.findOne({ imdbId });
        if (existingMovie) {
            return res.status(400).json({ error: 'Already in your watchlist' });
        }

        const movie = await Movie.create({ imdbId, title, posterUrl, genres, type });
        res.status(201).json({ message: 'Movie added', data: movie });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PATCH /api/movies/:id/watched - Toggle watched status
exports.toggleWatched = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ error: 'Movie not found' });

        movie.watched = !movie.watched;
        await movie.save();

        res.json({ message: `Marked as ${movie.watched ? 'watched' : 'unwatched'}`, data: movie });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /api/movies/:id - Delete item
exports.deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id);
        if (!movie) return res.status(404).json({ error: 'Movie not found' });

        res.json({ message: 'Movie deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};