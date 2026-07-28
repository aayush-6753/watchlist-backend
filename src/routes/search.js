const express = require('express');
const router = express.Router();
const { searchExternal, getExternalDetails } = require('../controllers/searchController');

// GET /api/search?q=Inception&type=movie
router.get('/', searchExternal);

// GET /api/search/details/:imdbId
router.get('/details/:imdbId', getExternalDetails);

module.exports = router;