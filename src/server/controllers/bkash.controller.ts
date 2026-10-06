import { Request, Response } from 'express';
import { BkashService } from '../services/bkash.service';

/**
 * Controller for bKash Tokenized Checkout Payment Gateway
 */
export class BkashController {
  private static bkashService = BkashService.getInstance();

  /**
   * POST /api/v1/payments/bkash/create
   * Initiates payment creation and generates the secure bKash Checkout URL
   */
  public static async createPayment(req: Request, res: Response) {
    try {
      const { orderId, amount, invoiceNumber, payerReference, callbackUrl } = req.body;

      if (!amount && !orderId) {
        return res.status(400).json({
          success: false,
          error: 'Either orderId or amount must be provided',
        });
      }

      const generatedInvoice = invoiceNumber || `INV-${Date.now()}`;

      // In production with database:
      // const order = await prisma.order.findUnique({ where: { id: orderId } });
      // const payableAmount = order ? order.total : amount;

      const response = await BkashController.bkashService.createPayment({
        amount: amount || '100.00',
        merchantInvoiceNumber: generatedInvoice,
        payerReference: payerReference || '01700000000',
        callbackUrl,
      });

      console.info(`[bKash] Payment initiated for invoice ${generatedInvoice}, PaymentID: ${response.paymentID}`);

      return res.status(200).json({
        success: true,
        paymentID: response.paymentID,
        bkashURL: response.bkashURL,
        merchantInvoiceNumber: response.merchantInvoiceNumber,
        amount: response.amount,
      });
    } catch (error: any) {
      console.error('[bKash Controller Error - createPayment]:', error.message || error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to initiate bKash payment',
      });
    }
  }

  /**
   * GET/POST /api/v1/payments/bkash/callback
   * Handles user redirect from bKash payment authorization window
   */
  public static async executeCallback(req: Request, res: Response) {
    try {
      const paymentID = (req.query.paymentID || req.body.paymentID) as string;
      const status = (req.query.status || req.body.status) as string;

      if (!paymentID) {
        return res.status(400).json({ success: false, error: 'Missing paymentID parameter' });
      }

      // Handle user cancellation
      if (status === 'cancel') {
        console.warn(`[bKash] Payment cancelled by user for paymentID: ${paymentID}`);
        // In full stack Next.js / Express:
        if (req.headers.accept?.includes('text/html')) {
          return res.redirect(`/checkout?status=cancelled&paymentID=${paymentID}`);
        }
        return res.status(200).json({
          success: false,
          status: 'cancelled',
          message: 'Payment was cancelled by the customer.',
        });
      }

      // Handle user failure
      if (status === 'failure') {
        console.warn(`[bKash] Payment failed on bKash gateway for paymentID: ${paymentID}`);
        if (req.headers.accept?.includes('text/html')) {
          return res.redirect(`/checkout?status=failed&paymentID=${paymentID}`);
        }
        return res.status(400).json({
          success: false,
          status: 'failed',
          message: 'Payment was rejected or failed.',
        });
      }

      // If status === 'success', execute payment authorization
      const executeResult = await BkashController.bkashService.executePayment(paymentID);

      if (executeResult.statusCode === '0000') {
        console.info(`[bKash] Payment executed successfully! TrxID: ${executeResult.trxID}`);

        // In production with database (Prisma):
        // await prisma.$transaction([
        //   prisma.paymentTransaction.update({
        //     where: { paymentGatewayId: paymentID },
        //     data: { transactionId: executeResult.trxID, status: 'COMPLETED', gatewayResponse: executeResult }
        //   }),
        //   prisma.order.update({
        //     where: { orderNumber: executeResult.merchantInvoiceNumber },
        //     data: { paymentStatus: 'COMPLETED', status: 'PROCESSING' }
        //   })
        // ]);

        if (req.headers.accept?.includes('text/html')) {
          return res.redirect(
            `/order-success?paymentID=${paymentID}&trxID=${executeResult.trxID}&invoice=${executeResult.merchantInvoiceNumber}`
          );
        }

        return res.status(200).json({
          success: true,
          status: 'completed',
          trxID: executeResult.trxID,
          paymentID: executeResult.paymentID,
          amount: executeResult.amount,
          customerMsisdn: executeResult.customerMsisdn,
          merchantInvoiceNumber: executeResult.merchantInvoiceNumber,
          executedAt: executeResult.paymentExecuteTime,
        });
      } else {
        return res.status(400).json({
          success: false,
          statusCode: executeResult.statusCode,
          error: executeResult.statusMessage,
        });
      }
    } catch (error: any) {
      console.error('[bKash Controller Error - executeCallback]:', error.message || error);
      if (req.headers.accept?.includes('text/html')) {
        return res.redirect(`/checkout?status=error&message=${encodeURIComponent(error.message)}`);
      }
      return res.status(500).json({
        success: false,
        error: error.message || 'Error occurred while executing bKash payment',
      });
    }
  }

  /**
   * GET /api/v1/payments/bkash/query/:paymentID
   * Queries payment status directly from bKash
   */
  public static async queryPayment(req: Request, res: Response) {
    try {
      const { paymentID } = req.params;
      const data = await BkashController.bkashService.queryPayment(paymentID);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/v1/payments/bkash/search/:trxID
   * Search transaction details by TrxID
   */
  public static async searchTransaction(req: Request, res: Response) {
    try {
      const { trxID } = req.params;
      const data = await BkashController.bkashService.searchTransaction(trxID);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /api/v1/payments/bkash/refund
   * Issues refund for a completed transaction
   */
  public static async refundPayment(req: Request, res: Response) {
    try {
      const { paymentID, amount, trxID, sku, reason } = req.body;

      if (!paymentID || !amount || !trxID) {
        return res.status(400).json({
          success: false,
          error: 'paymentID, amount, and trxID are required for refund',
        });
      }

      const refundResult = await BkashController.bkashService.refundPayment({
        paymentID,
        amount,
        trxID,
        sku,
        reason,
      });

      console.info(`[bKash] Refund successful! RefundTrxID: ${refundResult.refundTrxID}`);

      return res.status(200).json({
        success: true,
        refundTrxID: refundResult.refundTrxID,
        originalTrxID: refundResult.originalTrxID,
        amount: refundResult.amount,
        currency: refundResult.currency,
      });
    } catch (error: any) {
      console.error('[bKash Controller Error - refundPayment]:', error.message || error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Refund request failed',
      });
    }
  }
}
