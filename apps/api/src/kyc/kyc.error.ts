export const KYC_ERRORS = {
  KYC_VERIFYING_IN_PROCESS: {
    statusCode: 409,
    message: 'Admin is verifying uploaded documents, please come back later',
  },
  KYC_NO_PENDING_SUBMISSIONS: {
    statusCode: 409,
    message: 'No pending KYC submissions',
  },
  KYC_SUBMISSION_NOT_FOUND: {
    statusCode: 404,
    message: 'No KYC submission found',
  },
  KYC_NO_DOCUMENTS: {
    statusCode: 409,
    message:
      'Please upload at least one document before submitting for KYC review',
  },
  KYC_ALREADY_APPROVED: {
    statusCode: 409,
    message: 'KYC already approved, no pending documents to review',
  },
};
