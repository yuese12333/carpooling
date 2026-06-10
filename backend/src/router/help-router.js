const express = require('express');
const router = express.Router();
const { listHelpCategoriesController, listHelpQuestionsController } = require('../controller/help-controller');

/** GET /api/help/categories */
router.get('/categories', listHelpCategoriesController);

/** GET /api/help/questions?search=xxx&categoryId=&hot=1 */
router.get('/questions', listHelpQuestionsController);

module.exports = router;
