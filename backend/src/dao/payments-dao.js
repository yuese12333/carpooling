const prisma = require('../config/prisma');
const { logger } = require('../utils/logger');

async function listPaymentsByUser(userId, page = 1, pageSize = 20, requestId) {
  try {
    const where = {
      order: { passenger_user_id: userId },
    };

    const [payments, total] = await Promise.all([
      prisma.orderPayment.findMany({
        where,
        include: { order: true },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.orderPayment.count({ where }),
    ]);

    return { payments, total };
  } catch (error) {
    logger.error({ module: 'payments-dao', operate: 'list-payments-by-user', params: { userId }, requestId, error: error.message });
    throw error;
  }
}

async function getReceiptByPaymentId(paymentId, requestId) {
  try {
    const receipt = await prisma.receipt.findUnique({ where: { payment_id: paymentId }, include: { payment: true } });
    return receipt;
  } catch (error) {
    logger.error({ module: 'payments-dao', operate: 'get-receipt-by-payment-id', params: { paymentId }, requestId, error: error.message });
    throw error;
  }

}

async function listPaymentMethodsByUser(userId, requestId) {
  try {
    return await prisma.paymentMethod.findMany({
      where: { user_id: userId, status: 'active' },
      orderBy: [{ is_default: 'desc' }, { created_at: 'asc' }],
    });
  } catch (error) {
    logger.error({ module: 'payments-dao', operate: 'list-payment-methods-by-user', params: { userId }, requestId, error: error.message });
    throw error;
  }
}

async function setDefaultPaymentMethod(userId, methodId, requestId) {
  try {
    return await prisma.$transaction(async (tx) => {
      const target = await tx.paymentMethod.findFirst({ where: { method_id: methodId, user_id: userId } });
      if (!target) {
        const err = new Error('支付方式不存在');
        err.statusCode = 404;
        throw err;
      }
      await tx.paymentMethod.updateMany({ where: { user_id: userId, is_default: true }, data: { is_default: false } });
      await tx.paymentMethod.update({ where: { method_id: methodId }, data: { is_default: true } });
      return { methodId };
    });
  } catch (error) {
    logger.error({ module: 'payments-dao', operate: 'set-default-payment-method', params: { userId, methodId }, requestId, error: error.message });
    throw error;
  }
}

async function getMonthlyPaymentStats(userId, monthStart, monthEnd, requestId) {
  try {
    const where = {
      payment_status: { in: ['paid', 'completed'] },
      paid_at: { gte: monthStart, lt: monthEnd },
      order: { passenger_user_id: userId },
    };
    const agg = await prisma.orderPayment.aggregate({
      where,
      _sum: { passenger_payable: true, total_amount: true },
      _count: { _all: true },
    });
    return {
      totalExpense: Number(agg._sum.passenger_payable || agg._sum.total_amount || 0),
      orderCount: agg._count._all || 0,
    };
  } catch (error) {
    logger.error({ module: 'payments-dao', operate: 'get-monthly-payment-stats', params: { userId, monthStart, monthEnd }, requestId, error: error.message });
    throw error;
  }
}

module.exports = {
  listPaymentsByUser,
  getReceiptByPaymentId,
  listPaymentMethodsByUser,
  setDefaultPaymentMethod,
  getMonthlyPaymentStats,
};
