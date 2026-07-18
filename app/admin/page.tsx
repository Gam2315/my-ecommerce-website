"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Banknote, 
  ShoppingCart, 
  Package, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { title: "Total Revenue", value: "₱0", icon: Banknote, trend: "0%", positive: true },
    { title: "Active Orders", value: "0", icon: ShoppingCart, trend: "0%", positive: true },
    { title: "Total Products", value: "0", icon: Package, trend: "0%", positive: true },
    { title: "Active Sales", value: "0", icon: Activity, trend: "0%", positive: true },
  ]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [salesData, setSalesData] = useState([
    { name: 'Mon', sales: 0 },
    { name: 'Tue', sales: 0 },
    { name: 'Wed', sales: 0 },
    { name: 'Thu', sales: 0 },
    { name: 'Fri', sales: 0 },
    { name: 'Sat', sales: 0 },
    { name: 'Sun', sales: 0 },
  ]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const { data: orders } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      const { data: products } = await supabase.from("products").select("id, status");
      
      if (orders && products) {
        // Total Revenue
        const totalRev = orders
          .filter(o => o.status !== 'Cancelled')
          .reduce((sum, o) => sum + Number(o.total_amount), 0);
          
        // Active Orders
        const activeOrdersCount = orders
          .filter(o => ['Pending', 'Processing', 'Shipped'].includes(o.status)).length;
          
        // Total Products
        const totalProductsCount = products.length;
        
        // Items Sold (Active Sales)
        const itemsSold = orders
          .filter(o => o.status !== 'Cancelled')
          .reduce((sum, o) => {
            const qty = o.items?.reduce((q: number, item: any) => q + item.quantity, 0) || 0;
            return sum + qty;
          }, 0);

        setStats([
          { title: "Total Revenue", value: `₱${totalRev.toFixed(2)}`, icon: Banknote, trend: "Up to date", positive: true },
          { title: "Active Orders", value: activeOrdersCount.toString(), icon: ShoppingCart, trend: "Live", positive: true },
          { title: "Total Products", value: totalProductsCount.toString(), icon: Package, trend: "Live", positive: true },
          { title: "Items Sold", value: itemsSold.toString(), icon: Activity, trend: "All time", positive: true },
        ]);

        // Recent Orders
        const recent = orders.slice(0, 5).map(o => ({
          id: o.id.split('-')[0].toUpperCase(),
          customer: o.customer_name,
          date: new Date(o.created_at).toLocaleDateString(),
          amount: `₱${Number(o.total_amount).toFixed(2)}`,
          status: o.status
        }));
        setRecentOrders(recent);

        // Very basic sales data mock based on day of week of orders
        const newSalesData = [
          { name: 'Sun', sales: 0 },
          { name: 'Mon', sales: 0 },
          { name: 'Tue', sales: 0 },
          { name: 'Wed', sales: 0 },
          { name: 'Thu', sales: 0 },
          { name: 'Fri', sales: 0 },
          { name: 'Sat', sales: 0 },
        ];
        
        orders.filter(o => o.status !== 'Cancelled').forEach(o => {
          const date = new Date(o.created_at);
          const day = date.getDay(); // 0 is Sunday
          newSalesData[day].sales += Number(o.total_amount);
        });
        
        // Reorder array to start from Mon (1) to Sun (0)
        const orderedSalesData = [
          ...newSalesData.slice(1),
          newSalesData[0]
        ];

        setSalesData(orderedSalesData);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-gray-500 font-medium">Loading Dashboard Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, Admin. Here's what's happening today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                  <Icon size={20} className="text-gray-700" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className={`flex items-center font-medium ${stat.positive ? 'text-green-600' : 'text-gray-600'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Sales Revenue (This Week)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="sales" stroke="#e6193c" strokeWidth={3} dot={{ r: 4, fill: '#e6193c' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          </div>
          
          <div className="space-y-5">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.customer}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">#{order.id}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{order.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{order.amount}</p>
                    <p className={`text-xs font-medium mt-1 ${
                      order.status === 'Delivered' ? 'text-green-600' : 
                      order.status === 'Cancelled' ? 'text-red-600' :
                      order.status === 'Shipped' ? 'text-purple-600' :
                      order.status === 'Processing' ? 'text-blue-600' : 'text-orange-600'
                    }`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500">
                <p className="text-sm">No recent orders.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
