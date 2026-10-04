'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order } from '@/lib/types'
import OrderStatusBadge from '@/components/OrderStatusBadge'
import { ChevronDown, ChevronUp } from 'lucide-react'

const STATUS_OPTIONS = ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled']

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const supabase = createClient()

  const fetchOrders = async () => {
    let query = supabase
      .from('orders')
      .select('*, order_items(*), profile:profiles(full_name, phone)')
      .order('created_at', { ascending: false })
    if (filter) query = query.eq('status', filter)
    const { data } = await query
    setOrders((data as any[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const updateStatus = async (orderId: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', orderId)
    await fetchOrders()
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Orders ({orders.length})</h1>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-mono text-xs text-gray-400">#{order.id.slice(0, 8)}</p>
                    <p className="font-medium text-gray-800">{(order as any).profile?.full_name || (order as any).profile?.phone || 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-bold text-green-600">${Number(order.total_amount).toFixed(2)}</span>
                  <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                  {expandedOrder === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>
            </div>

            {expandedOrder === order.id && (
              <div className="px-4 pb-4 border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Order Items</h4>
                    <div className="space-y-1">
                      {order.order_items?.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.product_name} × {item.quantity}</span>
                          <span className="font-medium">${(item.unit_price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-sm"><strong>Address:</strong> {order.delivery_address}</p>
                      <p className="text-sm"><strong>Phone:</strong> {order.delivery_phone}</p>
                      {order.notes && <p className="text-sm"><strong>Notes:</strong> {order.notes}</p>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Update Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map(s => (
                        <button
                          key={s}
                          onClick={() => updateStatus(order.id, s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            order.status === s
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {s.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-20 text-gray-500">No orders found</div>
        )}
      </div>
    </div>
  )
}
