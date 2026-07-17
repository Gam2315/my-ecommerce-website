"use client";

import { 
  DollarSign, 
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

const salesData = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

const recentOrders = [
  { id: "#ORD-001", customer: "John Doe", date: "2 hours ago", amount: "$120.00", status: "Completed" },
  { id: "#ORD-002", customer: "Jane Smith", date: "3 hours ago", amount: "$45.50", status: "Processing" },
  { id: "#ORD-003", customer: "Bob Johnson", date: "5 hours ago", amount: "$299.99", status: "Pending" },
  { id: "#ORD-004", customer: "Alice Brown", date: "1 day ago", amount: "$85.00", status: "Completed" },
];

const stats = [
  { title: "Total Revenue", value: "$24,560", icon: DollarSign, trend: "+12.5%", positive: true },
  { title: "Active Orders", value: "142", icon: ShoppingCart, trend: "+5.2%", positive: true },
  { title: "Total Products", value: "856", icon: Package, trend: "-1.4%", positive: false },
  { title: "Active Sales", value: "3", icon: Activity, trend: "0%", positive: true },
];

export default function AdminDashboard() {
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
                <span className={`flex items-center font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.positive ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
                  {stat.trend}
                </span>
                <span className="text-gray-400 ml-2">vs last week</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Sales Revenue</h2>
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
            <button className="text-sm text-[#e6193c] font-medium hover:underline">View All</button>
          </div>
          
          <div className="space-y-5">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.customer}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{order.id}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{order.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{order.amount}</p>
                  <p className={`text-xs font-medium mt-1 ${
                    order.status === 'Completed' ? 'text-green-600' : 
                    order.status === 'Processing' ? 'text-blue-600' : 'text-orange-600'
                  }`}>
                    {order.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
