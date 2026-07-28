const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    imdbId: { type: String, required: true },
    title: { type: String, required: true },
    posterUrl: { type: String },
    genres: [{ type: String }],
    type: { type: String, enum: ['movie', 'series'], default: 'movie' },
    watched: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Movie', movieSchema);