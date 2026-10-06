import { Router } from 'express';
import { BkashController } from '../controllers/bkash.controller';
import { SteadfastController } from '../controllers/steadfast.controller';

const router = Router();

// ==============================================================================
// 1. bKash Tokenized Checkout Payment Gateway Routes
// ==============================================================================
/**
 * @route   POST /api/v1/payments/bkash/create
 * @desc    Initiates payment and generates bKash checkout URL
 * @access  Public / Customer
 */
router.post('/payments/bkash/create', BkashController.createPayment);

/**
 * @route   GET/POST /api/v1/payments/bkash/callback
 * @desc    bKash authorization redirect callback (executes transaction upon OTP/PIN completion)
 * @access  Public (Called by bKash redirect)
 */
router.get('/payments/bkash/callback', BkashController.executeCallback);
router.post('/payments/bkash/callback', BkashController.executeCallback);

/**
 * @route   GET /api/v1/payments/bkash/query/:paymentID
 * @desc    Query payment status by paymentID
 * @access  Protected / Admin
 */
router.get('/payments/bkash/query/:paymentID', BkashController.queryPayment);

/**
 * @route   GET /api/v1/payments/bkash/search/:trxID
 * @desc    Search transaction details by bKash TrxID
 * @access  Protected / Admin
 */
router.get('/payments/bkash/search/:trxID', BkashController.searchTransaction);

/**
 * @route   POST /api/v1/payments/bkash/refund
 * @desc    Initiate refund for a completed bKash transaction
 * @access  Protected / Admin
 */
router.post('/payments/bkash/refund', BkashController.refundPayment);

// ==============================================================================
// 2. Steadfast Courier Service API Routes
// ==============================================================================
/**
 * @route   POST /api/v1/courier/steadfast/book
 * @desc    Create a single consignment parcel booking
 * @access  Protected / Admin & Warehouse Staff
 */
router.post('/courier/steadfast/book', SteadfastController.bookParcel);

/**
 * @route   POST /api/v1/courier/steadfast/bulk-book
 * @desc    Dispatch multiple parcels simultaneously
 * @access  Protected / Admin & Warehouse Staff
 */
router.post('/courier/steadfast/bulk-book', SteadfastController.bulkBookParcels);

/**
 * @route   GET /api/v1/courier/steadfast/track/:trackingCode
 * @desc    Live delivery tracking inquiry by Steadfast tracking code
 * @access  Public / Customer & Admin
 */
router.get('/courier/steadfast/track/:trackingCode', SteadfastController.trackParcel);

/**
 * @route   GET /api/v1/courier/steadfast/invoice/:invoice
 * @desc    Track delivery status by merchant invoice number
 * @access  Public / Customer & Admin
 */
router.get('/courier/steadfast/invoice/:invoice', SteadfastController.trackByInvoice);

/**
 * @route   GET /api/v1/courier/steadfast/balance
 * @desc    Check merchant current COD payout balance
 * @access  Protected / Admin
 */
router.get('/courier/steadfast/balance', SteadfastController.checkBalance);

/**
 * @route   POST /api/v1/courier/steadfast/webhook
 * @desc    Listen to automated consignment delivery updates pushed by Steadfast
 * @access  Public (Steadfast Server Webhook)
 */
router.post('/courier/steadfast/webhook', SteadfastController.handleCourierWebhook);

export default router;
