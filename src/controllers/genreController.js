const Movie = require('../models/movieModel');

// GET /api/genres - Get unique genres for current user
exports.getAllGenres = async (req, res, next) => {
    try {
        const genres = await Movie.distinct('genres', { user: req.user.id });
        res.json({ count: genres.length, data: genres });
    } catch (error) {
        next(error);
    }
};

// GET /api/genres/:genreName - Get user's movies by genre
exports.getMoviesByGenre = async (req, res, next) => {
    try {
        const { genreName } = req.params;
        const movies = await Movie.find({
            user: req.user.id,
            genres: { $regex: new RegExp(`^${genreName}$`, 'i') }
        });

        res.json({ count: movies.length, genre: genreName, data: movies });
    } catch (error) {
        next(error);
    }
};