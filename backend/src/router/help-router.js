const express = require('express');
const router = express.Router();
const { listHelpCategoriesController } = require('../controller/help-controller');

/** GET /api/help/categories */
router.get('/categories', listHelpCategoriesController);

module.exports = router;
