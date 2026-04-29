const prisma = require('../config/prisma');
const { logger, maskSensitive } = require('../utils/logger');

async function listAdminUsersDao({ page, pageSize, phone, userName, role, status }, requestId) {
  const where = {};

  if (typeof phone === 'string' && phone.trim()) {
    where.phone = { contains: phone.trim() };
  }

  if (typeof userName === 'string' && userName.trim()) {
    where.user_name = { contains: userName.trim() };
  }

  if (typeof role === 'string' && role.trim()) {
    where.role = role.trim();
  }

  if (typeof status === 'string' && status.trim()) {
    where.status = status.trim();
  }

  const skip = (page - 1) * pageSize;

  const [total, users] = await Promise.all([
    prisma.authUser.count({ where }),
    prisma.authUser.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { created_at: 'desc' },
      select: {
        user_id: true,
        phone: true,
        user_name: true,
        role: true,
        status: true,
        created_at: true,
      },
    }),
  ]);

  logger.info({
    module: 'admin-dao',
    operate: 'list-admin-users',
    requestId,
    params: maskSensitive({ page, pageSize, phone, userName, role, status }),
    result: `total:${total}`,
  });

  return {
    list: users.map((u) => ({
      userId: u.user_id,
      phone: u.phone,
      userName: u.user_name,
      role: u.role,
      status: u.status,
      createdAt: u.created_at,
    })),
    total,
    page,
    pageSize,
  };
}

async function updateAdminUserStatusDao({ targetUserId, status, adminUserId }, requestId) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.authUser.findUnique({
      where: { user_id: targetUserId },
      select: { status: true },
    });

    if (!current) {
      const error = new Error('目标用户不存在');
      error.statusCode = 404;
      throw error;
    }

    const prevStatus = current.status;

    await tx.authUser.update({
      where: { user_id: targetUserId },
      data: { status },
    });

    await tx.adminAuditLog.create({
      data: {
        admin_user_id: adminUserId,
        action: 'update-status',
        target_user_id: targetUserId,
        detail: {
          from: prevStatus,
          to: status,
        },
      },
    });

    logger.info({
      module: 'admin-dao',
      operate: 'update-admin-user-status',
      requestId,
      params: maskSensitive({ targetUserId, status }),
      result: 'success',
    });

    return { targetUserId, status };
  });
}

async function updateAdminUserRoleDao({ targetUserId, role, adminUserId }, requestId) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.authUser.findUnique({
      where: { user_id: targetUserId },
      select: { role: true },
    });

    if (!current) {
      const error = new Error('目标用户不存在');
      error.statusCode = 404;
      throw error;
    }

    const prevRole = current.role;

    await tx.authUser.update({
      where: { user_id: targetUserId },
      data: { role },
    });

    await tx.adminAuditLog.create({
      data: {
        admin_user_id: adminUserId,
        action: 'update-role',
        target_user_id: targetUserId,
        detail: {
          from: prevRole,
          to: role,
        },
      },
    });

    logger.info({
      module: 'admin-dao',
      operate: 'update-admin-user-role',
      requestId,
      params: maskSensitive({ targetUserId, role }),
      result: 'success',
    });

    return { targetUserId, role };
  });
}

module.exports = {
  listAdminUsersDao,
  updateAdminUserStatusDao,
  updateAdminUserRoleDao,
};

