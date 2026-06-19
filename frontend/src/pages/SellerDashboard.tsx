import { useEffect, useState } from 'react';
import { api } from '../api';
import { TrendingUp, Package, DollarSign, AlertTriangle, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation, useAuthStore } from '../store';

const daysMap: Record<string, Record<string, string>> = {
  en: { Mon: 'Mon', Tue: 'Tue', Wed: 'Wed', Thu: 'Thu', Fri: 'Fri', Sat: 'Sat', Sun: 'Sun' },
  th: { Mon: 'จ.', Tue: 'อ.', Wed: 'พ.', Thu: 'พฤ.', Fri: 'ศ.', Sat: 'ส.', Sun: 'อา.' }
};

export default function SellerDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const { t } = useTranslation();
  const language = useAuthStore(state => state.language);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = () => {
    api.get('/seller/analytics/').then(res => setAnalytics(res.data)).catch(console.error);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="w-full px-4 md:px-8 xl:px-12 py-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-gray-200 dark:border-dark-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary dark:text-dark-text">{t.sellerDashboard || 'Seller Dashboard'}</h1>
          <p className="text-muted dark:text-dark-muted mt-2">{t.sellerDashboardDesc || 'Manage your product inventory and track sales.'}</p>
        </div>
      </div>

      {/* Analytics Section */}
      {analytics && (
        <div className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-muted dark:text-dark-muted font-medium">{t.totalRevenue || 'Total Revenue'}</h3>
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-secondary dark:text-dark-text">฿{analytics.total_revenue.toFixed(2)}</p>
            </div>
            
            <div className="bg-surface dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-muted dark:text-dark-muted font-medium">{t.totalOrders || 'Total Orders'}</h3>
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-secondary dark:text-dark-text">{analytics.total_orders}</p>
            </div>

            <div className="bg-surface dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-muted dark:text-dark-muted font-medium">{t.activeProducts || 'Active Products'}</h3>
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-primary flex items-center justify-center">
                  <Package size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-secondary dark:text-dark-text">{analytics.total_products}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Chart */}
            <div className="lg:col-span-2 bg-surface dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
              <h3 className="font-semibold text-secondary dark:text-dark-text mb-6">{t.revenueOverview || 'Revenue Overview (Last 7 Days)'}</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.sales_data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} dy={10} tickFormatter={(value) => daysMap[language][value] || value} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} dx={-10} tickFormatter={(value) => `฿${value}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#6b46c1', fontWeight: 'bold' }}
                      formatter={((value: any, name: any) => [`฿${value}`, name === 'revenue' ? (t.totalRevenue || 'รายได้รวม') : name]) as any}
                      labelFormatter={((label: any) => daysMap[language]?.[label] || label) as any}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#6b46c1" strokeWidth={3} dot={{ r: 4, fill: '#6b46c1', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Widgets */}
            <div className="space-y-6">
              {/* Top Selling */}
              <div className="bg-surface dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
                <h3 className="font-semibold text-secondary dark:text-dark-text mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  {t.topSelling || 'Top Selling'}
                </h3>
                <div className="space-y-4">
                  {analytics.top_selling?.map((item: any) => (
                    <div key={item.product__id} className="flex justify-between items-center text-sm">
                      <span className="text-secondary dark:text-dark-text font-medium truncate pr-4">{item.product__title}</span>
                      <span className="text-muted dark:text-dark-muted shrink-0">{item.total_sold} {t.sold}</span>
                    </div>
                  ))}
                  {(!analytics.top_selling || analytics.top_selling.length === 0) && (
                    <p className="text-muted dark:text-dark-muted text-sm italic">{t.noSalesData}</p>
                  )}
                </div>
              </div>

              {/* Low Stock */}
              <div className="bg-surface dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
                <h3 className="font-semibold text-secondary dark:text-dark-text mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  {t.lowStock || 'Low Stock'}
                </h3>
                <div className="space-y-4">
                  {analytics.low_stock?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="text-secondary dark:text-dark-text font-medium truncate pr-4">{item.title}</span>
                      <span className="text-red-500 font-bold shrink-0">{item.quantity} {t.left}</span>
                    </div>
                  ))}
                  {(!analytics.low_stock || analytics.low_stock.length === 0) && (
                    <p className="text-muted dark:text-dark-muted text-sm italic">{t.inventoryHealthy}</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </motion.div>
  );
}
