const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const { autocomplete } = require('../controllers/search.controller');

router.get('/autocomplete',
    [query('q').optional().isString().isLength({ max: 100 }).trim()],
    autocomplete
);

module.exports = router;
