/**
 * bKash Payment Gateway Configuration
 * Supports Tokenized Checkout API v1.2.0-beta / v2.0
 */

export interface BkashConfig {
  baseUrl: string;
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
  callbackUrl: string;
}

export const getBkashConfig = (): BkashConfig => {
  return {
    baseUrl: process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
    appKey: process.env.BKASH_APP_KEY || 'sandbox_app_key',
    appSecret: process.env.BKASH_APP_SECRET || 'sandbox_app_secret',
    username: process.env.BKASH_USERNAME || 'sandbox_username',
    password: process.env.BKASH_PASSWORD || 'sandbox_password',
    callbackUrl: process.env.BKASH_CALLBACK_URL || `${process.env.APP_URL || 'http://localhost:3000'}/api/v1/payments/bkash/callback`,
  };
};

export const BKASH_ENDPOINTS = {
  GRANT_TOKEN: '/tokenized/checkout/token/grant',
  REFRESH_TOKEN: '/tokenized/checkout/token/refresh',
  CREATE_PAYMENT: '/tokenized/checkout/create',
  EXECUTE_PAYMENT: '/tokenized/checkout/execute',
  QUERY_PAYMENT: '/tokenized/checkout/payment/status',
  SEARCH_TRANSACTION: '/tokenized/checkout/general/searchTransaction',
  REFUND_TRANSACTION: '/tokenized/checkout/payment/refund',
} as const;

/**
 * Standard bKash error messages mapping
 */
export const BKASH_STATUS_CODES: Record<string, string> = {
  '0000': 'Payment Successful',
  '2001': 'Invalid App Key',
  '2002': 'Invalid Payment ID',
  '2005': 'Invalid Forwarding URL',
  '2006': 'Invalid Currency',
  '2014': 'Invalid Amount',
  '2015': 'Invalid Merchant Invoice Number',
  '2019': 'Payment ID has already been executed',
  '2023': 'Insufficient Balance in customer account',
  '2029': 'Duplicate for All Transactions',
  '2056': 'Payment Cancelled by User',
  '2057': 'Payment Cancelled by bKash',
  '5003': 'Internal bKash Server Error',
};
