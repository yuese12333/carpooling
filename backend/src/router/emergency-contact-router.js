/**
 * 文件功能：紧急联系人路由层
 * 关联业务：紧急联系人管理、行程共享通知
 */
const express = require('express');
const {
  getContactListController,
  addContactController,
  updateContactController,
  deleteContactController,
  sendTripShareController,
} = require('../controller/emergency-contact-controller');
const authMiddleware = require('../middleware/auth-middleware');

const router = express.Router();

// 所有紧急联系人接口都需要登录
router.use(authMiddleware);

// 获取紧急联系人列表
router.get('/', getContactListController);

// 添加紧急联系人
router.post('/', addContactController);

// 更新紧急联系人
router.put('/:id', updateContactController);

// 删除紧急联系人
router.delete('/:id', deleteContactController);

// 发送行程共享通知
router.post('/send-trip-share', sendTripShareController);

module.exports = router;
