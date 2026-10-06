import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BkashModal: React.FC = () => {
  const { bkashModal, closeBkashModal, setBkashStep, createOrder, showToast } = useApp();

  const [phone, setPhone] = useState('01711223344');
  const [otp, setOtp] = useState('482910');
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!bkashModal.isOpen || !bkashModal.orderData) return null;

  const totalAmount = bkashModal.orderData.totalAmount;
  const invoiceNumber = bkashModal.orderData.invoiceNumber;

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 11) {
      showToast('Please enter a valid 11-digit bKash account number', 'error');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setBkashStep('otp');
    }, 800);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      showToast('Please enter the 6-digit verification code', 'error');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setBkashStep('pin');
    }, 700);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length < 5) {
      showToast('Please enter your 5-digit test PIN', 'error');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setBkashStep('success');

      // Complete order
      setTimeout(() => {
        createOrder(bkashModal.orderData.payload);
        closeBkashModal();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      {/* bKash Signature Pink & Red themed payment gateway card */}
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-4 border-[#e2136e] overflow-hidden flex flex-col">
        
        {/* bKash Header */}
        <div className="bg-[#e2136e] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-black text-[#e2136e] text-lg">
              ব
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight">bKash</span>
              <p className="text-[10px] text-pink-100 font-medium">Tokenized Payment Gateway</p>
            </div>
          </div>

          <button
            onClick={closeBkashModal}
            className="text-pink-100 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice & Amount Strip */}
        <div className="bg-pink-50 dark:bg-slate-800/80 px-5 py-3 border-b border-pink-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Merchant:</span>{' '}
            <span className="font-bold text-slate-800 dark:text-white">BazaarPulse Ltd</span>
          </div>
          <div className="font-mono font-bold text-base text-[#e2136e] dark:text-pink-400">
            ৳{totalAmount.toLocaleString()}
          </div>
        </div>

        {/* Step-by-Step Forms */}
        <div className="p-6">
          {bkashModal.step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="text-center space-y-1 mb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Enter Your bKash Account Number
                </h3>
                <p className="text-[11px] text-slate-500">
                  আপনার বিকাশ একাউন্ট নম্বর দিন (Test Simulator)
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                  Account Mobile Number
                </label>
                <input
                  type="tel"
                  maxLength={11}
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full text-center font-mono font-bold text-base py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#e2136e]"
                  autoFocus
                />
              </div>

              <div className="text-[10px] text-slate-400 leading-tight">
                By clicking Confirm, you agree to the bKash Payment Terms & Conditions.
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 bg-[#e2136e] hover:bg-[#c90f61] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm / নিশ্চিত করুন</span>}
              </button>
            </form>
          )}

          {bkashModal.step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="text-center space-y-1 mb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Enter 6-Digit Verification Code
                </h3>
                <p className="text-[11px] text-slate-500">
                  {phone} নম্বরে পাঠানো কোড দিন (Test: 482910)
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                  Verification Code (OTP)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="w-full text-center font-mono font-bold text-lg tracking-widest py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#e2136e]"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 bg-[#e2136e] hover:bg-[#c90f61] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify OTP / যাচাই করুন</span>}
              </button>
            </form>
          )}

          {bkashModal.step === 'pin' && (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="text-center space-y-1 mb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Enter bKash Account PIN
                </h3>
                <p className="text-[11px] text-slate-500">
                  আপনার বিকাশ পিন নম্বর দিন (Test Simulator: 12345)
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                  Account PIN (5 Digits)
                </label>
                <input
                  type="password"
                  maxLength={5}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="•••••"
                  className="w-full text-center font-mono font-bold text-xl tracking-widest py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#e2136e]"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 bg-[#e2136e] hover:bg-[#c90f61] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Payment / পেমেন্ট সম্পন্ন</span>}
              </button>
            </form>
          )}

          {bkashModal.step === 'success' && (
            <div className="py-6 text-center space-y-3">
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Payment Successful!
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                TrxID: BKASH-{Math.random().toString(36).substring(2, 9).toUpperCase()}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold">
                Creating your order and booking Steadfast dispatch...
              </p>
            </div>
          )}
        </div>

        {/* Security watermark */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5 border-t border-slate-100 dark:border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>PCI-DSS Level 1 & Bangladesh Bank Encrypted Sandbox</span>
        </div>

      </div>
    </div>
  );
};
