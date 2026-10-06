import React from 'react';
import { X, Printer, Download, CheckCircle, QrCode } from 'lucide-react';
import { Order } from '../../types';
import { useApp } from '../../context/AppContext';

export const InvoiceModal: React.FC = () => {
  const { invoiceOrder, closeInvoice } = useApp();

  if (!invoiceOrder) return null;

  const order = invoiceOrder;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-900 border border-slate-200">
        
        {/* Modal Controls Toolbar (Hidden in Print) */}
        <div className="print:hidden bg-slate-900 text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Customer Tax Invoice · {order.orderNumber}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={closeInvoice}
              className="text-slate-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Page */}
        <div className="p-8 sm:p-10 space-y-8 bg-white" id="printable-invoice">
          
          {/* Header & Company Details */}
          <div className="flex items-start justify-between border-b pb-6 border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center font-black text-lg">
                  B
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950">
                  Bazaar<span className="text-emerald-600">Pulse</span>
                </h1>
              </div>
              <p className="text-xs text-slate-500 max-w-xs">
                BazaarPulse Logistics & Commerce Ltd.<br />
                Plot 48, Level 7, Gulshan Avenue, Dhaka-1212, Bangladesh<br />
                BIN: 002948192-0101 · Support: +880 9612 000 000
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs uppercase tracking-widest font-black text-emerald-600 block">
                Official Invoice
              </span>
              <p className="text-base font-mono font-bold text-slate-900 mt-1">
                {order.orderNumber}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Date: {new Date(order.createdAt).toLocaleDateString('en-GB')}
              </p>
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800">
                <span>Status:</span>
                <span className="font-mono">{order.paymentStatus}</span>
              </div>
            </div>
          </div>

          {/* Billing & Shipping Information */}
          <div className="grid grid-cols-2 gap-8 text-xs">
            <div>
              <h4 className="font-bold uppercase tracking-wider text-slate-400 mb-2">
                Billed To:
              </h4>
              <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
              <p className="text-slate-600 mt-0.5">{order.shippingAddress.fullAddress}</p>
              <p className="text-slate-600 font-mono mt-1">Phone: {order.customerPhone}</p>
              {order.customerEmail && <p className="text-slate-600">Email: {order.customerEmail}</p>}
            </div>

            <div className="text-right">
              <h4 className="font-bold uppercase tracking-wider text-slate-400 mb-2">
                Logistics & Dispatch:
              </h4>
              <p className="font-bold text-slate-900">
                Partner: {order.courierShipment?.courier || 'Steadfast'} Courier
              </p>
              <p className="text-slate-600 font-mono">
                Consignment: {order.courierShipment?.consignmentId || 'STF-PENDING'}
              </p>
              <p className="text-slate-600 font-mono">
                Tracking: {order.courierShipment?.trackingCode || 'UNTRACKED'}
              </p>
              <p className="text-slate-600 mt-1">
                Payment: <span className="font-bold">{order.paymentMethod}</span>
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-900 font-bold uppercase tracking-wider">
                  <th className="py-2.5 pr-2">SL</th>
                  <th className="py-2.5">Item Description & SKU</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Unit Price</th>
                  <th className="py-2.5 text-right">Amount (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="py-3 pr-2 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3">
                      <span className="font-bold text-slate-900 block">{item.productTitle}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        SKU: {item.productSku} {item.variantLabel ? `· ${item.variantLabel}` : ''}
                      </span>
                    </td>
                    <td className="py-3 text-center font-mono font-medium">{item.quantity}</td>
                    <td className="py-3 text-right font-mono">৳{item.price.toLocaleString()}</td>
                    <td className="py-3 text-right font-mono font-bold">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Calculation */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">৳{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge:</span>
                <span className="font-mono">৳{order.deliveryFee.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount ({order.couponCode || 'Promo'}):</span>
                  <span className="font-mono">-৳{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t-2 border-slate-900">
                <span>Total Payable:</span>
                <span className="font-mono text-emerald-600">
                  ৳{order.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Barcode & Signature Footer */}
          <div className="pt-8 border-t border-slate-200 flex items-end justify-between text-[11px] text-slate-500">
            <div className="space-y-1">
              <div className="font-mono font-bold tracking-widest text-slate-800 text-sm">
                |||| | ||||| |||| |||||| ||||| |||
              </div>
              <p className="text-[10px] text-slate-400">
                This is a computer-generated tax invoice. No signature required.
              </p>
            </div>

            <div className="text-right space-y-1">
              <div className="w-32 border-b border-slate-400 mb-1" />
              <p className="font-bold text-slate-700">Authorized Officer</p>
              <p className="text-[10px] text-slate-400">BazaarPulse Operations</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
