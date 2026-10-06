import { getSteadfastConfig, STEADFAST_ENDPOINTS, STEADFAST_STATUS_MAP } from '../config/steadfast.config';

export interface SteadfastParcelPayload {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  note?: string;
}

export interface SteadfastConsignment {
  consignment_id: number | string;
  invoice: string;
  tracking_code: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  status: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
  delivery_charge?: number;
}

export interface SteadfastCreateOrderResponse {
  status: number;
  message: string;
  consignment: SteadfastConsignment;
  errors?: Record<string, string[]>;
}

export interface SteadfastTrackingResponse {
  status: number;
  delivery_status: string;
  mapped_status?: string;
  consignment?: SteadfastConsignment;
}

export interface SteadfastBalanceResponse {
  status: number;
  current_balance: number;
}

export class SteadfastService {
  private static instance: SteadfastService;

  private constructor() {}

  public static getInstance(): SteadfastService {
    if (!SteadfastService.instance) {
      SteadfastService.instance = new SteadfastService();
    }
    return SteadfastService.instance;
  }

  private getHeaders(): HeadersInit {
    const config = getSteadfastConfig();
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Api-Key': config.apiKey,
      'Secret-Key': config.secretKey,
    };
  }

  /**
   * Books a single parcel shipment with Steadfast Courier
   */
  public async createOrder(payload: SteadfastParcelPayload): Promise<SteadfastCreateOrderResponse> {
    const config = getSteadfastConfig();
    const endpoint = `${config.apiUrl}${STEADFAST_ENDPOINTS.CREATE_ORDER}`;

    // Normalize phone number (strip whitespace, ensure standard 11 digits)
    const normalizedPhone = payload.recipient_phone.replace(/\D/g, '').slice(-11);

    const body = {
      invoice: payload.invoice,
      recipient_name: payload.recipient_name.trim(),
      recipient_phone: normalizedPhone,
      recipient_address: payload.recipient_address.trim(),
      cod_amount: Math.round(payload.cod_amount),
      note: payload.note || 'Handle with care - BazaarPulse Order',
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as SteadfastCreateOrderResponse;

    if (!response.ok || data.status !== 200) {
      const errorDetail = data.errors ? JSON.stringify(data.errors) : data.message || response.statusText;
      throw new Error(`Steadfast Booking Failed: ${errorDetail}`);
    }

    return data;
  }

  /**
   * Bulk booking for warehouse batch shipments
   */
  public async createBulkOrders(orders: SteadfastParcelPayload[]): Promise<any> {
    const config = getSteadfastConfig();
    const endpoint = `${config.apiUrl}${STEADFAST_ENDPOINTS.BULK_CREATE_ORDER}`;

    const formattedData = orders.map((o) => ({
      invoice: o.invoice,
      recipient_name: o.recipient_name,
      recipient_phone: o.recipient_phone.replace(/\D/g, '').slice(-11),
      recipient_address: o.recipient_address,
      cod_amount: Math.round(o.cod_amount),
      note: o.note || '',
    }));

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ data: formattedData }),
    });

    const result = await response.json();
    if (!response.ok || result.status !== 200) {
      throw new Error(`Bulk booking failed: ${result.message || response.statusText}`);
    }

    return result;
  }

  /**
   * Check parcel status by tracking code
   */
  public async getStatusByTrackingCode(trackingCode: string): Promise<SteadfastTrackingResponse> {
    const config = getSteadfastConfig();
    const endpoint = `${config.apiUrl}${STEADFAST_ENDPOINTS.STATUS_BY_TRACKING(trackingCode)}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    const data = (await response.json()) as SteadfastTrackingResponse;

    if (!response.ok || data.status !== 200) {
      throw new Error(`Tracking lookup failed for code ${trackingCode}: ${response.statusText}`);
    }

    return {
      ...data,
      mapped_status: STEADFAST_STATUS_MAP[data.delivery_status] || 'PROCESSING',
    };
  }

  /**
   * Check parcel status by Consignment ID
   */
  public async getStatusByConsignmentId(cid: string | number): Promise<SteadfastTrackingResponse> {
    const config = getSteadfastConfig();
    const endpoint = `${config.apiUrl}${STEADFAST_ENDPOINTS.STATUS_BY_CID(cid)}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    const data = (await response.json()) as SteadfastTrackingResponse;
    return {
      ...data,
      mapped_status: STEADFAST_STATUS_MAP[data.delivery_status] || 'PROCESSING',
    };
  }

  /**
   * Check parcel status by Merchant Invoice
   */
  public async getStatusByInvoice(invoice: string): Promise<SteadfastTrackingResponse> {
    const config = getSteadfastConfig();
    const endpoint = `${config.apiUrl}${STEADFAST_ENDPOINTS.STATUS_BY_INVOICE(invoice)}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    const data = (await response.json()) as SteadfastTrackingResponse;
    return {
      ...data,
      mapped_status: STEADFAST_STATUS_MAP[data.delivery_status] || 'PROCESSING',
    };
  }

  /**
   * Checks merchant current wallet / COD collected balance
   */
  public async getCurrentBalance(): Promise<SteadfastBalanceResponse> {
    const config = getSteadfastConfig();
    const endpoint = `${config.apiUrl}${STEADFAST_ENDPOINTS.GET_BALANCE}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    const data = (await response.json()) as SteadfastBalanceResponse;
    return data;
  }
}
