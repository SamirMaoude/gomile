export const DRIVER_ERROR = {
  DRIVER_BUSY: {
    statusCode: 409,
    message: 'Driver has an ongoing order, some actions are restricted',
  },
  INSUFFICIENT_BALANCE: {
    statusCode: 409,
    message: 'Insufficient balance to complete this withdrawal',
  },
  INVALID_WITHDRAWAL_AMOUNT: {
    statusCode: 409,
    message: 'Withdrawal amount must be greater than 0',
  },
};
