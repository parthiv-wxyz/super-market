'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { Order } from '@/lib/types'
import OrderStatusBadge from '@/components/OrderStatusBadge'
import OrderStatusTracker from '@/components/OrderStatusTracker'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    async function fetchOrders() {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      setOrders(data || [])
      setLoading(false)
    }
    fetchOrders()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Package className="mx-auto text-gray-300" size={80} />
        <h2 className="text-2xl font-bold text-gray-800 mt-4">No orders yet</h2>
        <p className="text-gray-500 mt-2">Start shopping to place your first order</p>
        <Link
          href="/products"
          className="inline-block mt-6 bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div
              className="p-6 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-bold text-green-600">${order.total_amount.toFixed(2)}</span>
                  {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
            </div>

            {expandedOrder === order.id && (
              <div className="px-6 pb-6 border-t">
                <OrderStatusTracker status={order.status} />

                <div className="mt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Items</h4>
                  <div className="space-y-2">
                    {order.order_items?.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.product_name} × {item.quantity}</span>
                        <span className="font-medium">${(item.unit_price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t">
                  <p className="text-sm text-gray-500"><strong>Delivery:</strong> {order.delivery_address}</p>
                  <p className="text-sm text-gray-500"><strong>Phone:</strong> {order.delivery_phone}</p>
                  {order.notes && <p className="text-sm text-gray-500"><strong>Notes:</strong> {order.notes}</p>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
