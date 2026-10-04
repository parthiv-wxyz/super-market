'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    outOfStock: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      const [products, outOfStock, orders, pendingOrders, users] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('in_stock', false),
        supabase.from('orders').select('id, total_amount', { count: 'exact' }),
        supabase.from('orders').select('id', { count: 'exact', head: true }).in('status', ['placed', 'confirmed']),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ])

      const totalRevenue = orders.data?.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0) || 0

      setStats({
        totalProducts: products.count || 0,
        outOfStock: outOfStock.count || 0,
        totalOrders: orders.count || 0,
        pendingOrders: pendingOrders.count || 0,
        totalUsers: users.count || 0,
        totalRevenue,
      })

      const { data: recent } = await supabase
        .from('orders')
        .select('*, profile:profiles(full_name, phone)')
        .order('created_at', { ascending: false })
        .limit(5)
      setRecentOrders(recent || [])
      setLoading(false)
    }
    fetchStats()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>
  }

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'blue' },
    { label: 'Out of Stock', value: stats.outOfStock, icon: AlertTriangle, color: 'red' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'green' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: TrendingUp, color: 'orange' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'purple' },
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'emerald' },
  ]

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorMap[card.color]}`}>
              <card.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 text-gray-500 font-medium">Order ID</th>
                <th className="text-left py-3 px-2 text-gray-500 font-medium">Customer</th>
                <th className="text-left py-3 px-2 text-gray-500 font-medium">Amount</th>
                <th className="text-left py-3 px-2 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-2 text-gray-500 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} className="border-b last:border-0">
                  <td className="py-3 px-2 font-mono text-xs">#{order.id.slice(0, 8)}</td>
                  <td className="py-3 px-2">{order.profile?.full_name || order.profile?.phone || 'N/A'}</td>
                  <td className="py-3 px-2 font-medium">${Number(order.total_amount).toFixed(2)}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
