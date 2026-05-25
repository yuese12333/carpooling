const express = require('express');

const authMiddleware = require('../middleware/auth-middleware');
const adminAuthMiddleware = require('../middleware/admin-auth-middleware');

const {
  listAdminUsersController,
  updateAdminUserStatusController,
  updateAdminUserRoleController,
} = require('../controller/admin-controller');

const router = express.Router();

router.get('/users', authMiddleware, adminAuthMiddleware, listAdminUsersController);
router.post('/users/status', authMiddleware, adminAuthMiddleware, updateAdminUserStatusController);
router.post('/users/role', authMiddleware, adminAuthMiddleware, updateAdminUserRoleController);

module.exports = router;

