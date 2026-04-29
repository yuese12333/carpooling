const express = require('express');

const authMiddleware = require('../middleware/auth-middleware');
const adminAuthMiddleware = require('../middleware/admin-auth-middleware');

const {
  listAdminUsersController,
  updateAdminUserStatusController,
  updateAdminUserRoleController,
} = require('../controller/admin-controller');

const router = express.Router();

router.get('/users/list', authMiddleware, adminAuthMiddleware, listAdminUsersController);
router.post('/users/update-status', authMiddleware, adminAuthMiddleware, updateAdminUserStatusController);
router.post('/users/update-role', authMiddleware, adminAuthMiddleware, updateAdminUserRoleController);

module.exports = router;

