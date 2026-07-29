const Movie = require('../models/movieModel');

// GET /api/movies - Get all saved items for the logged-in user
exports.getAllMovies = async (req, res, next) => {
    try {
        const { type, watched, genre, sort } = req.query;

        // Scope database queries strictly to the authenticated user
        const queryObj = { user: req.user.id };

        if (type) queryObj.type = type; // "movie" or "series"
        if (watched !== undefined) queryObj.watched = watched === 'true';
        if (genre) queryObj.genres = { $regex: new RegExp(`^${genre}$`, 'i') };

        const sortBy = sort || '-createdAt'; // Default newest first

        const movies = await Movie.find(queryObj).sort(sortBy);
        res.json({ count: movies.length, data: movies });
    } catch (error) {
        next(error);
    }
};

// GET /api/movies/:id - Get a single movie by MongoDB ID (User scoped)
exports.getMovieById = async (req, res, next) => {
    try {
        const movie = await Movie.findOne({ _id: req.params.id, user: req.user.id });
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.json({ data: movie });
    } catch (error) {
        next(error);
    }
};

// POST /api/movies - Add a movie/series to user's watchlist
exports.addMovie = async (req, res, next) => {
    try {
        const { imdbId, title, posterUrl, genres, type } = req.body;

        if (!imdbId || !title) {
            return res.status(400).json({ error: 'imdbId and title are required fields' });
        }

        // Check if item already exists in THIS user's watchlist
        const existingMovie = await Movie.findOne({ imdbId, user: req.user.id });
        if (existingMovie) {
            return res.status(400).json({ error: 'Movie already exists in your watchlist' });
        }

        const newMovie = await Movie.create({
            user: req.user.id, // Attach owner user ID
            imdbId,
            title,
            posterUrl,
            genres,
            type
        });

        res.status(201).json({ message: 'Added to watchlist', data: newMovie });
    } catch (error) {
        next(error);
    }
};

// PATCH /api/movies/:id/watched - Toggle watched status (User scoped)
exports.toggleWatchedStatus = async (req, res, next) => {
    try {
        const movie = await Movie.findOne({ _id: req.params.id, user: req.user.id });
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        movie.watched = !movie.watched;
        await movie.save();

        res.json({ message: `Marked as ${movie.watched ? 'watched' : 'unwatched'}`, data: movie });
    } catch (error) {
        next(error);
    }
};

// PATCH /api/movies/:id - Update movie details (User scoped)
exports.updateMovieDetails = async (req, res, next) => {
    try {
        const movie = await Movie.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        res.json({ message: 'Movie updated successfully', data: movie });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/movies/:id - Delete item (User scoped)
exports.deleteMovie = async (req, res, next) => {
    try {
        const movie = await Movie.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        res.json({ message: 'Movie deleted successfully' });
    } catch (error) {
        next(error);
    }
};