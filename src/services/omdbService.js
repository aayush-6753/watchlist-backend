const axios = require('axios');

const OMDB_BASE_URL = 'https://www.omdbapi.com/';

/**
 * Search movies or series by title
 * @param {string} query - Title search term
 * @param {string} type - Optional filter ('movie' or 'series')
 */
exports.searchByTitle = async (query, type = '') => {
    try {
        const response = await axios.get(OMDB_BASE_URL, {
            params: {
                apikey: process.env.OMDB_API_KEY,
                s: query,  // 's' stands for search parameter
                type: type // 'movie' or 'series'
            }
        });

        if (response.data.Response === 'False') {
            return [];
        }

        // Standardize output shape
        return response.data.Search.map(item => ({
            imdbId: item.imdbID,
            title: item.Title,
            year: item.Year,
            type: item.Type,
            posterUrl: item.Poster !== 'N/A' ? item.Poster : null
        }));
    } catch (error) {
        console.error('OMDb Search Error:', error.message);
        throw new Error('Failed to query OMDb API');
    }
};

/**
 * Get full details for a title (includes genres & plot)
 * @param {string} imdbId - IMDb unique identifier (e.g., 'tt1375666')
 */
exports.getDetailsByImdbId = async (imdbId) => {
    try {
        const response = await axios.get(OMDB_BASE_URL, {
            params: {
                apikey: process.env.OMDB_API_KEY,
                i: imdbId, // 'i' stands for IMDb ID
                plot: 'short'
            }
        });

        const data = response.data;
        if (data.Response === 'False') {
            throw new Error(data.Error || 'Item not found');
        }

        return {
            imdbId: data.imdbID,
            title: data.Title,
            year: data.Year,
            type: data.Type,
            // OMDb returns genres as comma-separated string "Action, Sci-Fi" -> convert to array
            genres: data.Genre && data.Genre !== 'N/A' ? data.Genre.split(', ') : [],
            posterUrl: data.Poster !== 'N/A' ? data.Poster : null,
            plot: data.Plot !== 'N/A' ? data.Plot : ''
        };
    } catch (error) {
        console.error('OMDb Details Error:', error.message);
        throw new Error('Failed to fetch title details from OMDb');
    }
};