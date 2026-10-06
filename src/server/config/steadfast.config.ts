/**
 * Steadfast Courier Service API Configuration
 * Production API portal: https://portal.steadfast.com.bd/api/v1
 */

export interface SteadfastConfig {
  apiUrl: string;
  apiKey: string;
  secretKey: string;
  webhookSecret?: string;
}

export const getSteadfastConfig = (): SteadfastConfig => {
  return {
    apiUrl: process.env.STEADFAST_API_URL || 'https://portal.steadfast.com.bd/api/v1',
    apiKey: process.env.STEADFAST_API_KEY || '',
    secretKey: process.env.STEADFAST_SECRET_KEY || '',
    webhookSecret: process.env.STEADFAST_WEBHOOK_SECRET || '',
  };
};

export const STEADFAST_ENDPOINTS = {
  CREATE_ORDER: '/create_order',
  BULK_CREATE_ORDER: '/create_order/bulk-order',
  STATUS_BY_TRACKING: (code: string) => `/status_by_trackingcode/${code}`,
  STATUS_BY_CID: (cid: string | number) => `/status_by_cid/${cid}`,
  STATUS_BY_INVOICE: (invoice: string) => `/status_by_invoice/${invoice}`,
  GET_BALANCE: '/get_balance',
} as const;

/**
 * Steadfast delivery statuses mapped to standard internal order statuses
 */
export const STEADFAST_STATUS_MAP: Record<string, string> = {
  in_review: 'PROCESSING',
  pending: 'PROCESSING',
  accepted: 'SHIPPED',
  in_transit: 'SHIPPED',
  delivered: 'DELIVERED',
  partial_delivered: 'DELIVERED',
  cancelled: 'CANCELLED',
  hold: 'PROCESSING',
  return: 'RETURNED',
};
