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

module.exports = { listPaymentsByUser, getReceiptByPaymentId };
