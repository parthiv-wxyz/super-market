export default function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    placed: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-indigo-100 text-indigo-800',
    packed: 'bg-purple-100 text-purple-800',
    out_for_delivery: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const labels: Record<string, string> = {
    placed: 'Placed',
    confirmed: 'Confirmed',
    packed: 'Packed',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  )
}
