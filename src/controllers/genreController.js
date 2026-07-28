const Movie = require('../models/Movie');

// GET /api/genres - Get list of unique genres currently in your database
exports.getAllGenres = async (req, res) => {
    try {
        const genres = await Movie.distinct('genres');
        res.json({ count: genres.length, data: genres });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/genres/:genreName - Get saved movies matching a specific genre
exports.getMoviesByGenre = async (req, res) => {
    try {
        const { genreName } = req.params;
        // Case-insensitive regex match inside the genres array
        const movies = await Movie.find({
            genres: { $regex: new RegExp(`^${genreName}$`, 'i') }
        });

        res.json({ count: movies.length, genre: genreName, data: movies });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};