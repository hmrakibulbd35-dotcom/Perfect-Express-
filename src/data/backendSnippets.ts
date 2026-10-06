/**
 * Production Backend Snippets for bKash Payment Gateway and Steadfast Courier API
 */

export const BKASH_BACKEND_CONTROLLER_CODE = `// ==============================================================================
// Express / Node.js - bKash Tokenized Checkout Controller & Service (v1.2.0-beta)
// File: src/server/controllers/bkash.controller.ts
// ==============================================================================

import { Request, Response } from 'express';

// ------------------------------------------------------------------------------
// 1. bKash Configuration & Environment
// ------------------------------------------------------------------------------
const BKASH_CONFIG = {
  baseUrl: process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
  appKey: process.env.BKASH_APP_KEY || '',
  appSecret: process.env.BKASH_APP_SECRET || '',
  username: process.env.BKASH_USERNAME || '',
  password: process.env.BKASH_PASSWORD || '',
  callbackUrl: process.env.BKASH_CALLBACK_URL || 'http://localhost:3000/api/v1/payments/bkash/callback'
};

// ------------------------------------------------------------------------------
// 2. Production bKash Service with In-Memory Token Caching
// ------------------------------------------------------------------------------
export class BkashService {
  private static instance: BkashService;
  private cachedToken: string | null = null;
  private cachedRefreshToken: string | null = null;
  private tokenExpiresAt: number = 0; // Unix millisecond timestamp

  public static getInstance(): BkashService {
    if (!BkashService.instance) {
      BkashService.instance = new BkashService();
    }
    return BkashService.instance;
  }

  /**
   * Retrieves or re-grants a valid authentication ID token.
   * Auto-refreshes before expiry to prevent 401s and token rate limiting.
   */
  public async getValidIdToken(): Promise<string> {
    const now = Date.now();
    // Use cached token if valid for more than 5 minutes
    if (this.cachedToken && (this.tokenExpiresAt - now > 5 * 60 * 1000)) {
      return this.cachedToken;
    }

    // Attempt token refresh if available
    if (this.cachedRefreshToken && this.tokenExpiresAt > now) {
      try {
        return await this.refreshToken();
      } catch (err) {
        console.warn('[bKash] Token refresh failed, falling back to grant token', err);
      }
    }

    return await this.grantToken();
  }

  /**
   * Request new grant token from bKash OAuth endpoint
   */
  public async grantToken(): Promise<string> {
    const endpoint = \`\${BKASH_CONFIG.baseUrl}/tokenized/checkout/token/grant\`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        username: BKASH_CONFIG.username,
        password: BKASH_CONFIG.password
      },
      body: JSON.stringify({
        app_key: BKASH_CONFIG.appKey,
        app_secret: BKASH_CONFIG.appSecret
      })
    });

    const data: any = await response.json();
    if (!response.ok || data.statusCode !== '0000') {
      throw new Error(\`bKash Grant Token Failed: \${data.statusMessage || response.statusText}\`);
    }

    this.cachedToken = data.id_token;
    this.cachedRefreshToken = data.refresh_token;
    this.tokenExpiresAt = Date.now() + (Number(data.expires_in) || 3600) * 1000;
    return this.cachedToken;
  }

  /**
   * Refresh existing token
   */
  public async refreshToken(): Promise<string> {
    const endpoint = \`\${BKASH_CONFIG.baseUrl}/tokenized/checkout/token/refresh\`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        username: BKASH_CONFIG.username,
        password: BKASH_CONFIG.password
      },
      body: JSON.stringify({
        app_key: BKASH_CONFIG.appKey,
        app_secret: BKASH_CONFIG.appSecret,
        refresh_token: this.cachedRefreshToken
      })
    });

    const data: any = await response.json();
    if (!response.ok || data.statusCode !== '0000') {
      throw new Error(\`bKash Token Refresh Failed: \${data.statusMessage}\`);
    }

    this.cachedToken = data.id_token;
    this.cachedRefreshToken = data.refresh_token;
    this.tokenExpiresAt = Date.now() + (Number(data.expires_in) || 3600) * 1000;
    return this.cachedToken;
  }

  /**
   * Step 1: Create payment session and retrieve bKash redirect URL
   */
  public async createPayment(params: {
    amount: number | string;
    merchantInvoiceNumber: string;
    payerReference?: string;
  }) {
    const token = await this.getValidIdToken();
    const endpoint = \`\${BKASH_CONFIG.baseUrl}/tokenized/checkout/create\`;

    const payload = {
      mode: '0011',
      payerReference: params.payerReference || 'Customer',
      callbackURL: BKASH_CONFIG.callbackUrl,
      amount: Number(params.amount).toFixed(2),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: params.merchantInvoiceNumber
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        'X-APP-Key': BKASH_CONFIG.appKey
      },
      body: JSON.stringify(payload)
    });

    const data: any = await response.json();
    if (!response.ok || data.statusCode !== '0000') {
      throw new Error(\`bKash Create Payment Failed: \${data.statusMessage || response.statusText} (Code: \${data.statusCode})\`);
    }

    return data;
  }

  /**
   * Step 2: Execute payment authorization upon customer OTP + PIN entry
   */
  public async executePayment(paymentID: string) {
    const token = await this.getValidIdToken();
    const endpoint = \`\${BKASH_CONFIG.baseUrl}/tokenized/checkout/execute\`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        'X-APP-Key': BKASH_CONFIG.appKey
      },
      body: JSON.stringify({ paymentID })
    });

    const data: any = await response.json();
    if (!response.ok || data.statusCode !== '0000') {
      throw new Error(\`bKash Execute Payment Failed: \${data.statusMessage || response.statusText} (Code: \${data.statusCode})\`);
    }

    return data;
  }

  /**
   * Step 3: Query payment status by paymentID
   */
  public async queryPayment(paymentID: string) {
    const token = await this.getValidIdToken();
    const endpoint = \`\${BKASH_CONFIG.baseUrl}/tokenized/checkout/payment/status\`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        'X-APP-Key': BKASH_CONFIG.appKey
      },
      body: JSON.stringify({ paymentID })
    });

    return await response.json();
  }

  /**
   * Step 4: Refund an executed transaction
   */
  public async refundPayment(params: { paymentID: string; amount: number; trxID: string; sku?: string; reason?: string }) {
    const token = await this.getValidIdToken();
    const endpoint = \`\${BKASH_CONFIG.baseUrl}/tokenized/checkout/payment/refund\`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        'X-APP-Key': BKASH_CONFIG.appKey
      },
      body: JSON.stringify({
        paymentID: params.paymentID,
        amount: Number(params.amount).toFixed(2),
        trxID: params.trxID,
        sku: params.sku || 'REFUND-SKU',
        reason: params.reason || 'Customer Requested Refund'
      })
    });

    const data: any = await response.json();
    if (!response.ok || data.statusCode !== '0000') {
      throw new Error(\`bKash Refund Failed: \${data.statusMessage}\`);
    }
    return data;
  }
}

// ------------------------------------------------------------------------------
// 3. Express Controller Handlers
// ------------------------------------------------------------------------------
export class BkashController {
  private static service = BkashService.getInstance();

  /**
   * POST /api/v1/payments/bkash/create
   * Initiates payment from cart/checkout
   */
  public static async createPayment(req: Request, res: Response) {
    try {
      const { orderId, amount, invoiceNumber, payerReference } = req.body;
      const invoice = invoiceNumber || \`INV-\${Date.now()}\`;

      const result = await BkashController.service.createPayment({
        amount: amount || '100.00',
        merchantInvoiceNumber: invoice,
        payerReference: payerReference || '01700000000'
      });

      return res.status(200).json({
        success: true,
        paymentID: result.paymentID,
        bkashURL: result.bkashURL,
        merchantInvoiceNumber: result.merchantInvoiceNumber
      });
    } catch (error: any) {
      console.error('[bKash Controller Create Error]:', error.message);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET/POST /api/v1/payments/bkash/callback
   * Processes the return callback from bKash payment window
   */
  public static async executeCallback(req: Request, res: Response) {
    try {
      const paymentID = (req.query.paymentID || req.body.paymentID) as string;
      const status = (req.query.status || req.body.status) as string;

      if (!paymentID) {
        return res.status(400).json({ success: false, error: 'Missing paymentID parameter' });
      }

      if (status === 'cancel') {
        return res.redirect(\`/checkout?status=cancelled&paymentID=\${paymentID}\`);
      }

      if (status === 'failure') {
        return res.redirect(\`/checkout?status=failed&paymentID=\${paymentID}\`);
      }

      // Execute authorized transaction
      const executed = await BkashController.service.executePayment(paymentID);

      if (executed.statusCode === '0000') {
        // In production database:
        // 1. Mark Order status as PAID and PROCESSING
        // 2. Save TrxID in PaymentTransaction table
        // 3. Send SMS notification to customer
        // 4. Trigger automated Steadfast courier consignment booking
        return res.redirect(
          \`/order-success?paymentID=\${paymentID}&trxID=\${executed.trxID}&invoice=\${executed.merchantInvoiceNumber}\`
        );
      }

      return res.redirect(\`/checkout?status=failed&error=\${encodeURIComponent(executed.statusMessage)}\`);
    } catch (error: any) {
      console.error('[bKash Controller Callback Error]:', error.message);
      return res.redirect(\`/checkout?status=error&message=\${encodeURIComponent(error.message)}\`);
    }
  }

  /**
   * POST /api/v1/payments/bkash/refund
   * Issues refund to customer's bKash wallet
   */
  public static async refundPayment(req: Request, res: Response) {
    try {
      const { paymentID, amount, trxID, reason } = req.body;
      const refund = await BkashController.service.refundPayment({ paymentID, amount, trxID, reason });
      return res.status(200).json({ success: true, refund });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
`;

export const STEADFAST_COURIER_SERVICE_CODE = `// ==============================================================================
// Express / Node.js - Steadfast Courier API Controller & Service
// File: src/server/controllers/steadfast.controller.ts
// ==============================================================================

import { Request, Response } from 'express';

// ------------------------------------------------------------------------------
// 1. Steadfast Configuration
// ------------------------------------------------------------------------------
const STEADFAST_CONFIG = {
  apiUrl: process.env.STEADFAST_API_URL || 'https://portal.steadfast.com.bd/api/v1',
  apiKey: process.env.STEADFAST_API_KEY || '',
  secretKey: process.env.STEADFAST_SECRET_KEY || '',
  webhookSecret: process.env.STEADFAST_WEBHOOK_SECRET || ''
};

// ------------------------------------------------------------------------------
// 2. Steadfast Courier Service Layer
// ------------------------------------------------------------------------------
export class SteadfastService {
  private static instance: SteadfastService;

  public static getInstance(): SteadfastService {
    if (!SteadfastService.instance) {
      SteadfastService.instance = new SteadfastService();
    }
    return SteadfastService.instance;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Api-Key': STEADFAST_CONFIG.apiKey,
      'Secret-Key': STEADFAST_CONFIG.secretKey
    };
  }

  /**
   * Books a single consignment parcel with Steadfast Courier
   */
  public async createOrder(payload: {
    invoice: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    cod_amount: number;
    note?: string;
  }) {
    const endpoint = \`\${STEADFAST_CONFIG.apiUrl}/create_order\`;
    const normalizedPhone = payload.recipient_phone.replace(/\\D/g, '').slice(-11);

    const body = {
      invoice: payload.invoice,
      recipient_name: payload.recipient_name.trim(),
      recipient_phone: normalizedPhone,
      recipient_address: payload.recipient_address.trim(),
      cod_amount: Math.round(payload.cod_amount),
      note: payload.note || 'BazaarPulse E-Commerce Parcel'
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });

    const data: any = await response.json();
    if (!response.ok || data.status !== 200) {
      throw new Error(\`Steadfast Booking Failed: \${data.message || JSON.stringify(data.errors || {})}\`);
    }

    return data;
  }

  /**
   * Bulk consignment booking for daily warehouse dispatches
   */
  public async createBulkOrders(orders: Array<{
    invoice: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    cod_amount: number;
    note?: string;
  }>) {
    const endpoint = \`\${STEADFAST_CONFIG.apiUrl}/create_order/bulk-order\`;
    const formatted = orders.map((o) => ({
      invoice: o.invoice,
      recipient_name: o.recipient_name,
      recipient_phone: o.recipient_phone.replace(/\\D/g, '').slice(-11),
      recipient_address: o.recipient_address,
      cod_amount: Math.round(o.cod_amount),
      note: o.note || ''
    }));

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ data: formatted })
    });

    const data: any = await response.json();
    if (!response.ok || data.status !== 200) {
      throw new Error(\`Bulk Booking Failed: \${data.message}\`);
    }

    return data;
  }

  /**
   * Live parcel status lookup by tracking code
   */
  public async getStatusByTrackingCode(trackingCode: string) {
    const endpoint = \`\${STEADFAST_CONFIG.apiUrl}/status_by_trackingcode/\${trackingCode}\`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return await response.json();
  }

  /**
   * Live parcel status lookup by merchant invoice
   */
  public async getStatusByInvoice(invoice: string) {
    const endpoint = \`\${STEADFAST_CONFIG.apiUrl}/status_by_invoice/\${invoice}\`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return await response.json();
  }

  /**
   * Merchant current collected COD payout balance
   */
  public async getCurrentBalance() {
    const endpoint = \`\${STEADFAST_CONFIG.apiUrl}/get_balance\`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return await response.json();
  }
}

// ------------------------------------------------------------------------------
// 3. Express Controller Handlers & Webhook Listener
// ------------------------------------------------------------------------------
export class SteadfastController {
  private static service = SteadfastService.getInstance();

  /**
   * POST /api/v1/courier/steadfast/book
   * Dispatches parcel to Steadfast
   */
  public static async bookParcel(req: Request, res: Response) {
    try {
      const { invoice, recipient_name, recipient_phone, recipient_address, cod_amount, note } = req.body;

      if (!invoice || !recipient_name || !recipient_phone || !recipient_address) {
        return res.status(400).json({
          success: false,
          error: 'Missing required delivery information'
        });
      }

      const result = await SteadfastController.service.createOrder({
        invoice,
        recipient_name,
        recipient_phone,
        recipient_address,
        cod_amount: Number(cod_amount) || 0,
        note
      });

      return res.status(200).json({
        success: true,
        message: 'Parcel booked with Steadfast Courier',
        consignment: result.consignment
      });
    } catch (error: any) {
      console.error('[Steadfast Controller Error]:', error.message);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/v1/courier/steadfast/track/:trackingCode
   * Queries real-time parcel delivery status
   */
  public static async trackParcel(req: Request, res: Response) {
    try {
      const { trackingCode } = req.params;
      const status = await SteadfastController.service.getStatusByTrackingCode(trackingCode);
      return res.status(200).json({ success: true, tracking: status });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/v1/courier/steadfast/balance
   * Checks current collected merchant COD payout balance
   */
  public static async checkBalance(req: Request, res: Response) {
    try {
      const balance = await SteadfastController.service.getCurrentBalance();
      return res.status(200).json({ success: true, balance });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /api/v1/courier/steadfast/webhook
   * Webhook callback listener for delivery status events pushed by Steadfast
   */
  public static async handleCourierWebhook(req: Request, res: Response) {
    try {
      const { tracking_code, invoice, status } = req.body;
      console.info(\`[Steadfast Webhook] Parcel \${tracking_code} (\${invoice}) status updated: \${status}\`);

      // In production database:
      // Map 'delivered' -> Order 'DELIVERED' + Payment 'COMPLETED' (if COD)
      // Map 'cancelled' / 'return' -> Order 'RETURNED'

      return res.status(200).json({ success: true, message: 'Webhook event processed' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
`;

export const EXPRESS_API_ROUTES_CODE = `// ==============================================================================
// Express.js Complete Route Definitions
// File: src/server/routes/api.routes.ts
// ==============================================================================

import { Router } from 'express';
import { BkashController } from '../controllers/bkash.controller';
import { SteadfastController } from '../controllers/steadfast.controller';

const router = Router();

// ------------------------------------------------------------------------------
// bKash Tokenized Checkout Payment Gateway Routes
// ------------------------------------------------------------------------------
// Initiates payment and generates bKash checkout URL
router.post('/payments/bkash/create', BkashController.createPayment);

// bKash authorization callback (executes transaction upon PIN entry)
router.get('/payments/bkash/callback', BkashController.executeCallback);
router.post('/payments/bkash/callback', BkashController.executeCallback);

// Query status by paymentID
router.get('/payments/bkash/query/:paymentID', BkashController.queryPayment);

// Search transaction details by bKash TrxID
router.get('/payments/bkash/search/:trxID', BkashController.searchTransaction);

// Process refund
router.post('/payments/bkash/refund', BkashController.refundPayment);

// ------------------------------------------------------------------------------
// Steadfast Courier Service API Routes
// ------------------------------------------------------------------------------
// Create single consignment booking
router.post('/courier/steadfast/book', SteadfastController.bookParcel);

// Batch dispatch orders
router.post('/courier/steadfast/bulk-book', SteadfastController.bulkBookParcels);

// Live tracking inquiry by Steadfast tracking code
router.get('/courier/steadfast/track/:trackingCode', SteadfastController.trackParcel);

// Track status by merchant invoice
router.get('/courier/steadfast/invoice/:invoice', SteadfastController.trackByInvoice);

// Check merchant current COD payout balance
router.get('/courier/steadfast/balance', SteadfastController.checkBalance);

// Delivery status webhook listener
router.post('/courier/steadfast/webhook', SteadfastController.handleCourierWebhook);

export default router;
`;
