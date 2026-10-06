import { getBkashConfig, BKASH_ENDPOINTS, BKASH_STATUS_CODES } from '../config/bkash.config';

export interface BkashTokenResponse {
  statusCode: string;
  statusMessage: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

export interface BkashCreatePaymentResponse {
  statusCode: string;
  statusMessage: string;
  paymentID: string;
  bkashURL: string;
  callbackURL: string;
  successCallbackURL: string;
  failureCallbackURL: string;
  cancelledCallbackURL: string;
  amount: string;
  intent: string;
  currency: string;
  paymentCreateTime: string;
  transactionStatus: string;
  merchantInvoiceNumber: string;
}

export interface BkashExecutePaymentResponse {
  statusCode: string;
  statusMessage: string;
  paymentID: string;
  payerReference?: string;
  customerMsisdn?: string;
  trxID: string;
  amount: string;
  transactionStatus: string;
  paymentExecuteTime: string;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
}

export interface BkashRefundResponse {
  statusCode: string;
  statusMessage: string;
  originalTrxID: string;
  refundTrxID: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  charge: string;
}

export class BkashService {
  private static instance: BkashService;
  private cachedToken: string | null = null;
  private cachedRefreshToken: string | null = null;
  private tokenExpiresAt: number = 0; // Unix millisecond timestamp

  private constructor() {}

  public static getInstance(): BkashService {
    if (!BkashService.instance) {
      BkashService.instance = new BkashService();
    }
    return BkashService.instance;
  }

  /**
   * Retrieves a valid authentication token.
   * Leverages caching to avoid repeated grant calls and token rate limits.
   */
  public async getValidIdToken(): Promise<string> {
    const now = Date.now();
    // Re-use token if it has at least 5 minutes of remaining life
    if (this.cachedToken && this.tokenExpiresAt - now > 5 * 60 * 1000) {
      return this.cachedToken;
    }

    // Try refreshing first if we have a refresh token
    if (this.cachedRefreshToken && this.tokenExpiresAt - now <= 5 * 60 * 1000 && this.tokenExpiresAt > now) {
      try {
        return await this.refreshToken();
      } catch (err) {
        console.warn('[bKash] Token refresh failed, falling back to grant token', err);
      }
    }

    return await this.grantToken();
  }

  /**
   * Requests a new Grant Token from bKash OAuth endpoint
   */
  public async grantToken(): Promise<string> {
    const config = getBkashConfig();
    const endpoint = `${config.baseUrl}${BKASH_ENDPOINTS.GRANT_TOKEN}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        username: config.username,
        password: config.password,
      },
      body: JSON.stringify({
        app_key: config.appKey,
        app_secret: config.appSecret,
      }),
    });

    const data = (await response.json()) as BkashTokenResponse;

    if (!response.ok || data.statusCode !== '0000') {
      throw new Error(
        `bKash Grant Token Failed: ${data.statusMessage || response.statusText} (Code: ${data.statusCode})`
      );
    }

    this.cachedToken = data.id_token;
    this.cachedRefreshToken = data.refresh_token;
    // expires_in is typically 3600 seconds
    this.tokenExpiresAt = Date.now() + (Number(data.expires_in) || 3600) * 1000;

    return this.cachedToken;
  }

  /**
   * Refreshes an existing token before it expires
   */
  public async refreshToken(): Promise<string> {
    const config = getBkashConfig();
    const endpoint = `${config.baseUrl}${BKASH_ENDPOINTS.REFRESH_TOKEN}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        username: config.username,
        password: config.password,
      },
      body: JSON.stringify({
        app_key: config.appKey,
        app_secret: config.appSecret,
        refresh_token: this.cachedRefreshToken,
      }),
    });

    const data = (await response.json()) as BkashTokenResponse;

    if (!response.ok || data.statusCode !== '0000') {
      throw new Error(`bKash Token Refresh Failed: ${data.statusMessage || response.statusText}`);
    }

    this.cachedToken = data.id_token;
    this.cachedRefreshToken = data.refresh_token;
    this.tokenExpiresAt = Date.now() + (Number(data.expires_in) || 3600) * 1000;

    return this.cachedToken;
  }

  /**
   * Initiates payment creation and returns the redirect URL (bkashURL)
   */
  public async createPayment(params: {
    amount: number | string;
    merchantInvoiceNumber: string;
    payerReference?: string;
    callbackUrl?: string;
  }): Promise<BkashCreatePaymentResponse> {
    const config = getBkashConfig();
    const token = await this.getValidIdToken();
    const endpoint = `${config.baseUrl}${BKASH_ENDPOINTS.CREATE_PAYMENT}`;

    const formattedAmount = Number(params.amount).toFixed(2);

    const payload = {
      mode: '0011',
      payerReference: params.payerReference || 'Customer',
      callbackURL: params.callbackUrl || config.callbackUrl,
      amount: formattedAmount,
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: params.merchantInvoiceNumber,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
        'X-APP-Key': config.appKey,
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as BkashCreatePaymentResponse;

    if (!response.ok || data.statusCode !== '0000') {
      const errorMsg = BKASH_STATUS_CODES[data.statusCode] || data.statusMessage || 'Payment creation failed';
      throw new Error(`[bKash Create Payment Error] ${errorMsg} (Code: ${data.statusCode})`);
    }

    return data;
  }

  /**
   * Executes payment after customer verification callback
   */
  public async executePayment(paymentID: string): Promise<BkashExecutePaymentResponse> {
    const config = getBkashConfig();
    const token = await this.getValidIdToken();
    const endpoint = `${config.baseUrl}${BKASH_ENDPOINTS.EXECUTE_PAYMENT}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
        'X-APP-Key': config.appKey,
      },
      body: JSON.stringify({ paymentID }),
    });

    const data = (await response.json()) as BkashExecutePaymentResponse;

    if (!response.ok || data.statusCode !== '0000') {
      const errorMsg = BKASH_STATUS_CODES[data.statusCode] || data.statusMessage || 'Payment execution failed';
      throw new Error(`[bKash Execute Payment Error] ${errorMsg} (Code: ${data.statusCode})`);
    }

    return data;
  }

  /**
   * Query status of an existing payment ID
   */
  public async queryPayment(paymentID: string): Promise<any> {
    const config = getBkashConfig();
    const token = await this.getValidIdToken();
    const endpoint = `${config.baseUrl}${BKASH_ENDPOINTS.QUERY_PAYMENT}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
        'X-APP-Key': config.appKey,
      },
      body: JSON.stringify({ paymentID }),
    });

    return await response.json();
  }

  /**
   * Search for a completed transaction by its bKash TrxID
   */
  public async searchTransaction(trxID: string): Promise<any> {
    const config = getBkashConfig();
    const token = await this.getValidIdToken();
    const endpoint = `${config.baseUrl}${BKASH_ENDPOINTS.SEARCH_TRANSACTION}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
        'X-APP-Key': config.appKey,
      },
      body: JSON.stringify({ trxID }),
    });

    return await response.json();
  }

  /**
   * Refund an executed transaction
   */
  public async refundPayment(params: {
    paymentID: string;
    amount: number | string;
    trxID: string;
    sku?: string;
    reason?: string;
  }): Promise<BkashRefundResponse> {
    const config = getBkashConfig();
    const token = await this.getValidIdToken();
    const endpoint = `${config.baseUrl}${BKASH_ENDPOINTS.REFUND_TRANSACTION}`;

    const payload = {
      paymentID: params.paymentID,
      amount: Number(params.amount).toFixed(2),
      trxID: params.trxID,
      sku: params.sku || 'REFUND-ITEM',
      reason: params.reason || 'Customer requested return/refund',
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
        'X-APP-Key': config.appKey,
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as BkashRefundResponse;

    if (!response.ok || data.statusCode !== '0000') {
      throw new Error(`[bKash Refund Error] ${data.statusMessage || 'Refund processing failed'}`);
    }

    return data;
  }
}
