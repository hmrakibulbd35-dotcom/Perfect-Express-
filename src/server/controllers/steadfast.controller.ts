import { Request, Response } from 'express';
import { SteadfastService } from '../services/steadfast.service';
import { getSteadfastConfig, STEADFAST_STATUS_MAP } from '../config/steadfast.config';

/**
 * Controller for Steadfast Courier API Integration
 */
export class SteadfastController {
  private static courierService = SteadfastService.getInstance();

  /**
   * POST /api/v1/courier/steadfast/book
   * Creates a parcel booking consignment for an order
   */
  public static async bookParcel(req: Request, res: Response) {
    try {
      const { orderId, invoice, recipient_name, recipient_phone, recipient_address, cod_amount, note } = req.body;

      // In production with database:
      // if (orderId) {
      //   const order = await prisma.order.findUnique({
      //     where: { id: orderId },
      //     include: { shippingAddress: true }
      //   });
      //   ...
      // }

      if (!invoice || !recipient_name || !recipient_phone || !recipient_address) {
        return res.status(400).json({
          success: false,
          error: 'Required fields missing: invoice, recipient_name, recipient_phone, recipient_address',
        });
      }

      const bookingResponse = await SteadfastController.courierService.createOrder({
        invoice,
        recipient_name,
        recipient_phone,
        recipient_address,
        cod_amount: Number(cod_amount) || 0,
        note,
      });

      console.info(
        `[Steadfast] Parcel booked successfully for invoice ${invoice}. Tracking: ${bookingResponse.consignment.tracking_code}`
      );

      // In production with database:
      // await prisma.courierShipment.create({
      //   data: {
      //     orderId: orderId || invoice,
      //     provider: 'STEADFAST',
      //     consignmentId: String(bookingResponse.consignment.consignment_id),
      //     trackingCode: bookingResponse.consignment.tracking_code,
      //     status: 'BOOKED',
      //     recipientName: recipient_name,
      //     recipientPhone: recipient_phone,
      //     codAmount: Number(cod_amount) || 0,
      //     bookingDetails: bookingResponse.consignment
      //   }
      // });

      return res.status(200).json({
        success: true,
        message: 'Parcel dispatched to Steadfast Courier successfully',
        consignment: bookingResponse.consignment,
      });
    } catch (error: any) {
      console.error('[Steadfast Controller Error - bookParcel]:', error.message || error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Parcel booking failed',
      });
    }
  }

  /**
   * POST /api/v1/courier/steadfast/bulk-book
   * Batch dispatch for warehouse operations
   */
  public static async bulkBookParcels(req: Request, res: Response) {
    try {
      const { orders } = req.body;

      if (!Array.isArray(orders) || orders.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Expected non-empty "orders" array in request body',
        });
      }

      const result = await SteadfastController.courierService.createBulkOrders(orders);

      return res.status(200).json({
        success: true,
        message: `Successfully sent ${orders.length} orders to Steadfast`,
        result,
      });
    } catch (error: any) {
      console.error('[Steadfast Controller Error - bulkBookParcels]:', error.message || error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Bulk booking failed',
      });
    }
  }

  /**
   * GET /api/v1/courier/steadfast/track/:trackingCode
   * Real-time tracking of parcel by Steadfast tracking code
   */
  public static async trackParcel(req: Request, res: Response) {
    try {
      const { trackingCode } = req.params;

      if (!trackingCode) {
        return res.status(400).json({ success: false, error: 'Tracking code is required' });
      }

      const trackingData = await SteadfastController.courierService.getStatusByTrackingCode(trackingCode);

      return res.status(200).json({
        success: true,
        tracking_code: trackingCode,
        raw_status: trackingData.delivery_status,
        mapped_status: trackingData.mapped_status,
        data: trackingData,
      });
    } catch (error: any) {
      console.error('[Steadfast Controller Error - trackParcel]:', error.message || error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Tracking inquiry failed',
      });
    }
  }

  /**
   * GET /api/v1/courier/steadfast/invoice/:invoice
   * Check delivery status using merchant invoice number
   */
  public static async trackByInvoice(req: Request, res: Response) {
    try {
      const { invoice } = req.params;

      const trackingData = await SteadfastController.courierService.getStatusByInvoice(invoice);

      return res.status(200).json({
        success: true,
        invoice,
        status: trackingData.delivery_status,
        mapped_status: trackingData.mapped_status,
        data: trackingData,
      });
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
      const balanceData = await SteadfastController.courierService.getCurrentBalance();
      return res.status(200).json({
        success: true,
        current_balance: balanceData.current_balance,
        currency: 'BDT',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve balance',
      });
    }
  }

  /**
   * POST /api/v1/courier/steadfast/webhook
   * Webhook callback listener for delivery status events pushed by Steadfast
   */
  public static async handleCourierWebhook(req: Request, res: Response) {
    try {
      const config = getSteadfastConfig();
      const webhookSecret = req.headers['x-steadfast-secret'] || req.headers['authorization'];

      // Optional secret validation if configured
      if (config.webhookSecret && webhookSecret !== config.webhookSecret) {
        console.warn('[Steadfast Webhook] Unauthorized webhook attempt');
        return res.status(401).json({ error: 'Unauthorized webhook call' });
      }

      const { tracking_code, consignment_id, invoice, status, updated_at } = req.body;

      console.info(
        `[Steadfast Webhook] Status update received for invoice: ${invoice}, tracking: ${tracking_code}, status: ${status}`
      );

      const mappedStatus = STEADFAST_STATUS_MAP[status] || 'PROCESSING';

      // In production with database (Prisma):
      // if (tracking_code) {
      //   const shipment = await prisma.courierShipment.update({
      //     where: { trackingCode: tracking_code },
      //     data: { status: mappedStatus as any, lastCheckedAt: new Date() }
      //   });
      //   if (mappedStatus === 'DELIVERED') {
      //     await prisma.order.update({
      //       where: { id: shipment.orderId },
      //       data: { status: 'DELIVERED', paymentStatus: 'COMPLETED' }
      //     });
      //   }
      // }

      return res.status(200).json({
        success: true,
        message: 'Webhook processed successfully',
        mapped_status: mappedStatus,
      });
    } catch (error: any) {
      console.error('[Steadfast Webhook Error]:', error.message || error);
      return res.status(500).json({ success: false, error: 'Internal webhook error' });
    }
  }
}
