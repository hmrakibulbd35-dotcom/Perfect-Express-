import React, { useState } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  Printer,
  Truck,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Save,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OrderStatus, CourierProvider, Product } from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    addProduct,
    updateProductStock,
    deleteProduct,
    orders,
    updateOrderStatus,
    bookCourierDispatch,
    openInvoice,
    categories,
    language,
    t,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'analytics' | 'inventory' | 'orders' | 'couriers'>('analytics');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [productSearch, setProductSearch] = useState('');

  // Add Product Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTitleBn, setNewTitleBn] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCategory, setNewCategory] = useState(categories[0]?.name || "Men's Fashion & Panjabi");
  const [newPrice, setNewPrice] = useState(1990);
  const [newDiscountPrice, setNewDiscountPrice] = useState(1650);
  const [newStock, setNewStock] = useState(25);
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80');

  // Stats calculations
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'COMPLETED' || o.status === 'DELIVERED')
    .reduce((sum, o) => sum + o.total, 0);

  const activeOrdersCount = orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING' || o.status === 'SHIPPED').length;
  const lowStockProducts = products.filter(p => p.stock <= 5);

  const filteredOrders = orderStatusFilter === 'ALL'
    ? orders
    : orders.filter(o => o.status === orderStatusFilter);

  const filteredProducts = productSearch.trim()
    ? products.filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase()))
    : products;

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSku.trim()) {
      showToast('Please enter title and SKU', 'error');
      return;
    }

    const catObj = categories.find(c => c.name === newCategory) || categories[0];

    addProduct({
      title: newTitle.trim(),
      titleBn: newTitleBn.trim() || newTitle.trim(),
      slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku: newSku.toUpperCase().trim(),
      category: catObj.name,
      categoryBn: catObj.nameBn,
      price: Number(newPrice),
      discountPrice: newDiscountPrice ? Number(newDiscountPrice) : undefined,
      stock: Number(newStock),
      description: 'Engineered for luxury comfort and everyday longevity in Bangladesh.',
      descriptionBn: 'উচ্চমানের আরামদায়ক প্রিমিয়াম পণ্য।',
      images: [newImage],
      variants: [
        {
          id: `v-${Date.now()}-std`,
          sku: `${newSku.toUpperCase().trim()}-STD`,
          size: 'Standard',
          additionalPrice: 0,
          stock: Number(newStock)
        }
      ],
      tags: ['new-arrival']
    });

    setIsAddProductOpen(false);
    setNewTitle('');
    setNewTitleBn('');
    setNewSku('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-600 text-white font-mono text-xs px-2 py-0.5 rounded font-bold uppercase">
              BazaarPulse Admin
            </span>
            <span className="text-xs text-slate-500 font-mono">v2.4 Enterprise</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            Control Center & Merchant Operations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time sales telemetry, inventory management & automated Steadfast/Pathao courier booking.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'inventory'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Inventory ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'orders'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('couriers')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'couriers'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Courier Dispatch
          </button>
        </div>
      </div>

      {/* TAB 1: ANALYTICS OVERVIEW */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">{t.totalRevenue}</span>
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                ৳{totalRevenue.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <span>↑ 18.4%</span>
                <span className="text-slate-400 font-normal">vs last month</span>
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">{t.activeOrders}</span>
                <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                {activeOrdersCount}
              </div>
              <span className="text-[11px] text-slate-400">
                Pending fulfillment & courier dispatch
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">{t.totalProducts}</span>
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                {products.length}
              </div>
              <span className="text-[11px] text-slate-400">
                Across {categories.length} categories
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">{t.lowStockAlerts}</span>
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
                {lowStockProducts.length}
              </div>
              <span className="text-[11px] text-amber-600 font-medium">
                Items need replenishment
              </span>
            </div>

          </div>

          {/* Revenue Graph & Sales Telemetry */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Weekly Sales Volume & Order Velocity (BDT)
                </h3>
                <p className="text-xs text-slate-500">
                  Daily revenue distribution across Dhaka Metro and regional hubs.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded">
                7-Day Total: ৳495,800
              </span>
            </div>

            {/* SVG Visual Bar Chart */}
            <div className="pt-6 pb-2">
              <div className="h-44 flex items-end gap-3 sm:gap-6 justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                {[
                  { day: 'Mon', amount: 45000, height: '45%' },
                  { day: 'Tue', amount: 62000, height: '62%' },
                  { day: 'Wed', amount: 78000, height: '78%' },
                  { day: 'Thu', amount: 51000, height: '51%' },
                  { day: 'Fri (Jummah)', amount: 89000, height: '89%' },
                  { day: 'Sat (Weekend)', amount: 94000, height: '94%' },
                  { day: 'Sun', amount: 76800, height: '76%' }
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ৳{(bar.amount / 1000).toFixed(0)}k
                    </span>
                    <div
                      className="w-full max-w-[48px] bg-slate-900 dark:bg-emerald-500 rounded-t-lg group-hover:bg-emerald-600 transition-all cursor-pointer relative"
                      style={{ height: bar.height }}
                    />
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      {bar.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Low Stock Watchlist */}
          {lowStockProducts.length > 0 && (
            <div className="p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Urgent Low Stock Warnings ({lowStockProducts.length} Products)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {lowStockProducts.map(p => (
                  <div
                    key={p.id}
                    className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                        {p.title}
                      </p>
                      <span className="font-mono text-slate-400">{p.sku}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-amber-600 font-mono font-bold text-sm block">
                        {p.stock} Left
                      </span>
                      <button
                        onClick={() => updateProductStock(p.id, p.stock + 20)}
                        className="text-[10px] text-emerald-600 hover:underline font-bold"
                      >
                        +20 Restock
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INVENTORY & STOCK MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                placeholder="Search products by SKU or title..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={() => setIsAddProductOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addNewProduct}</span>
            </button>
          </div>

          {/* Product Table */}
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="p-4">Product & SKU</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock Level</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {product.title}
                          </p>
                          <span className="font-mono text-[11px] text-slate-400">
                            {product.sku}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {product.category}
                      </td>

                      <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                        ৳{(product.discountPrice ?? product.price).toLocaleString()}
                        {product.discountPrice && (
                          <span className="text-[10px] text-slate-400 line-through block">
                            ৳{product.price.toLocaleString()}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            value={product.stock}
                            onChange={e => updateProductStock(product.id, parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                          />
                          {product.stock <= 5 && (
                            <span className="text-[10px] font-bold text-amber-500">Low</span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORDER MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">{t.filterByStatus}:</span>
              <select
                value={orderStatusFilter}
                onChange={e => setOrderStatusFilter(e.target.value)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="ALL">{t.allStatuses}</option>
                <option value="PENDING">Pending (অপেক্ষমান)</option>
                <option value="PROCESSING">Processing (প্রসেসিং)</option>
                <option value="SHIPPED">Shipped (কুরিয়ারে)</option>
                <option value="DELIVERED">Delivered (ডেলিভার্ড)</option>
                <option value="CANCELLED">Cancelled (বাতিল)</option>
              </select>
            </div>
            <span className="text-xs text-slate-400">
              Showing {filteredOrders.length} orders
            </span>
          </div>

          <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="p-4">Order # & Customer</th>
                    <th className="p-4">Area & Address</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status & Courier</th>
                    <th className="p-4 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                      <td className="p-4">
                        <span className="font-mono font-bold text-slate-900 dark:text-white block">
                          {order.orderNumber}
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block mt-0.5">
                          {order.customerName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {order.customerPhone}
                        </span>
                      </td>

                      <td className="p-4 max-w-[200px]">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {order.shippingAddress.area === 'INSIDE_DHAKA' ? 'Inside Dhaka' : 'Outside Dhaka'}
                        </span>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {order.shippingAddress.fullAddress}
                        </p>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {order.paymentMethod}
                        </span>
                        <span className={`text-[10px] font-mono font-bold ${
                          order.paymentStatus === 'COMPLETED' ? 'text-emerald-600' : 'text-amber-500'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>

                      <td className="p-4 font-mono font-black text-slate-900 dark:text-white">
                        ৳{order.total.toLocaleString()}
                      </td>

                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                        {order.courierShipment && (
                          <div className="mt-1 text-[10px] text-slate-400 font-mono">
                            {order.courierShipment.courier}: {order.courierShipment.consignmentId}
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => openInvoice(order)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-slate-700 dark:text-slate-200 transition-colors"
                          title="Print Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COURIER API PANEL (STEADFAST & PATHAO) */}
      {activeTab === 'couriers' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold mb-1">
                <Truck className="w-4 h-4" />
                <span>B2B Courier Gateway Integration Active</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                Steadfast Courier & Pathao B2B Dispatch API
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                One-click automated consignment generation, pickup scheduling, and real-time webhook status updates.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Steadfast API:</span>
                <span className="text-emerald-400 font-bold">CONNECTED 🟢</span>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Pathao API:</span>
                <span className="text-emerald-400 font-bold">CONNECTED 🟢</span>
              </div>
            </div>
          </div>

          {/* Pending Dispatches Table */}
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Orders Awaiting Courier Dispatch
              </h3>
              <span className="text-xs text-slate-500">
                Auto-assigned based on delivery region
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="p-4">Order & Destination</th>
                    <th className="p-4">COD Collectable</th>
                    <th className="p-4">Current Courier Status</th>
                    <th className="p-4 text-right">One-Click Dispatch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {orders.map(order => {
                    const hasConsignment = !!order.courierShipment;
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                        <td className="p-4">
                          <span className="font-mono font-bold text-slate-900 dark:text-white block">
                            {order.orderNumber} · {order.customerName}
                          </span>
                          <span className="text-slate-500 text-[11px] block mt-0.5">
                            {order.shippingAddress.fullAddress}
                          </span>
                        </td>

                        <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                          {order.paymentMethod === 'COD' ? `৳${order.total.toLocaleString()} (COD)` : '৳0 (Prepaid)'}
                        </td>

                        <td className="p-4">
                          {hasConsignment ? (
                            <div>
                              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                {order.courierShipment?.courier}: {order.courierShipment?.consignmentId}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                Track: {order.courierShipment?.trackingCode}
                              </span>
                            </div>
                          ) : (
                            <span className="text-amber-500 font-semibold">Ready for booking</span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => bookCourierDispatch(order.id, 'STEADFAST')}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-colors shadow-sm"
                            >
                              {hasConsignment ? 'Re-book Steadfast' : 'Book Steadfast'}
                            </button>
                            <button
                              onClick={() => bookCourierDispatch(order.id, 'PATHAO')}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs transition-colors shadow-sm"
                            >
                              {hasConsignment ? 'Re-book Pathao' : 'Book Pathao'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add New Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t.addNewProduct}
              </h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Product Title (English) *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Classic Tailored Kabli Panjabi"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Product Title (বাংলা) *</label>
                <input
                  type="text"
                  value={newTitleBn}
                  onChange={e => setNewTitleBn(e.target.value)}
                  placeholder="যেমন: ক্লাসিক কাবলি পাঞ্জাবি"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={newSku}
                    onChange={e => setNewSku(e.target.value)}
                    placeholder="e.g. PAN-KAB-09"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1">Regular Price (৳)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={e => setNewPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Discount Price (৳)</label>
                  <input
                    type="number"
                    value={newDiscountPrice}
                    onChange={e => setNewDiscountPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={e => setNewStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Image URL</label>
                <input
                  type="url"
                  value={newImage}
                  onChange={e => setNewImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                >
                  {t.saveProduct}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
