import React from 'react';
import {
  X,
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Clock,
  Printer,
  FileText,
  Phone,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OrderStatus } from '../types';

export const OrderTrackingModal: React.FC = () => {
  const { activeTrackedOrder, closeTrackingModal, openInvoice, language, t } = useApp();

  if (!activeTrackedOrder) return null;

  const order = activeTrackedOrder;

  const steps: { status: OrderStatus; labelEn: string; labelBn: string; descEn: string; descBn: string }[] = [
    {
      status: 'PENDING',
      labelEn: 'Order Placed',
      labelBn: 'অর্ডার গৃহীত হয়েছে',
      descEn: 'We have received your order details.',
      descBn: 'অর্ডারের বিবরণ সার্ভারে সফলভাবে সেভ হয়েছে।'
    },
    {
      status: 'PROCESSING',
      labelEn: 'Warehouse Packing',
      labelBn: 'প্যাকিং ও প্রসেসিং',
      descEn: 'Items picked and securely packaged for transit.',
      descBn: 'পণ্য যাচাই ও সুরক্ষামূলক বাবল র‍্যাপিং সম্পন্ন।'
    },
    {
      status: 'SHIPPED',
      labelEn: 'Dispatched with Courier',
      labelBn: 'কুরিয়ারে হস্তান্তর সম্পন্ন',
      descEn: `Handed over to ${order.courierShipment?.courier || 'Steadfast'} Courier hub.`,
      descBn: `${order.courierShipment?.courier || 'স্টিডফাস্ট'} কুরিয়ার হাবে হস্তান্তর করা হয়েছে।`
    },
    {
      status: 'DELIVERED',
      labelEn: 'Delivered',
      labelBn: 'সফলভাবে ডেলিভার্ড',
      descEn: 'Parcel handed over to customer successfully.',
      descBn: 'গ্রাহকের নিকট সফলভাবে পার্সেল পৌঁছে দেওয়া হয়েছে।'
    }
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'PROCESSING':
        return 1;
      case 'SHIPPED':
        return 2;
      case 'DELIVERED':
        return 3;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                {t.liveTracking}
              </span>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>{t.orderNumber}:</span>
                <span className="font-mono text-white">{order.orderNumber}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openInvoice(order)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Print Invoice"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">{t.printInvoice}</span>
            </button>
            <button
              onClick={closeTrackingModal}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Courier Consignment Card */}
        {order.courierShipment && (
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">{t.courierPartner}</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {order.courierShipment.courier} Courier
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">{t.consignmentId}</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {order.courierShipment.consignmentId}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">{t.trackingNumber}</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {order.courierShipment.trackingCode}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">{t.estimatedDelivery}</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {order.shippingAddress.area === 'INSIDE_DHAKA' ? '24-48 Hours' : '2-4 Days'}
              </span>
            </div>
          </div>
        )}

        {/* Live Stepper Milestones */}
        <div className="p-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
            Dispatch Milestones & Delivery Status
          </h3>

          <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {steps.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const isUpcoming = idx > currentStepIdx;

              return (
                <div key={step.status} className="relative flex items-start gap-4">
                  {/* Step Icon Node */}
                  <div
                    className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                      isPast
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
                        : isCurrent
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-200 dark:ring-emerald-900 animate-pulse'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="font-mono font-bold text-[11px]">{idx + 1}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-sm font-bold ${
                          isUpcoming
                            ? 'text-slate-400 dark:text-slate-600'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {language === 'bn' ? step.labelBn : step.labelEn}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                          In Progress
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {language === 'bn' ? step.descBn : step.descEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shipping Destination & Items Snapshot */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Recipient Details
              </span>
              <p className="text-slate-600 dark:text-slate-400">{order.customerName}</p>
              <p className="text-slate-600 dark:text-slate-400 font-mono">{order.customerPhone}</p>
              <p className="text-slate-600 dark:text-slate-400 mt-1">{order.shippingAddress.fullAddress}</p>
            </div>

            <div className="sm:text-right">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Payment & Total
              </span>
              <p className="text-slate-600 dark:text-slate-400">
                Method: <span className="font-bold">{order.paymentMethod}</span> ({order.paymentStatus})
              </p>
              {order.transactionId && (
                <p className="text-slate-500 font-mono text-[11px]">TrxID: {order.transactionId}</p>
              )}
              <p className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                Total: ৳{order.total.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
