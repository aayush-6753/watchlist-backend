const { searchByTitle, getDetailsByImdbId } = require('../services/omdbService');

exports.searchExternal = async (req, res) => {
    try {
        const { q, type } = req.query;
        if (!q) return res.status(400).json({ error: 'Query parameter "q" is required' });

        const results = await searchByTitle(q, type);
        res.json({ count: results.length, data: results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getExternalDetails = async (req, res) => {
    try {
        const details = await getDetailsByImdbId(req.params.imdbId);
        res.json({ data: details });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};