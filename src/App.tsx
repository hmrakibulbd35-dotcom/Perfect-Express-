import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { StorefrontView } from './components/StorefrontView';
import { MobileSimulator } from './components/mobile/MobileSimulator';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ArchitectureHub } from './components/architecture/ArchitectureHub';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { BkashModal } from './components/BkashModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { InvoiceModal } from './components/admin/InvoiceModal';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';

const MainAppContent: React.FC = () => {
  const { activeMode } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Sticky Header with Navigation, Search, Mode Switcher, Theme & Language */}
      <Header />

      {/* Main Body View based on Mode Switcher */}
      <main className="flex-1">
        {activeMode === 'storefront' && <StorefrontView />}
        {activeMode === 'mobile-sim' && <MobileSimulator />}
        {activeMode === 'admin' && <AdminDashboard />}
        {activeMode === 'architecture' && <ArchitectureHub />}
      </main>

      {/* Interactive Global Modals */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <BkashModal />
      <OrderTrackingModal />
      <InvoiceModal />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
