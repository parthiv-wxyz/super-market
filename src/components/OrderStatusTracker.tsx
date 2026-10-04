import { Check, Clock } from 'lucide-react'

const STEPS = [
  { key: 'placed', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'packed', label: 'Packed' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
]

export default function OrderStatusTracker({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center justify-center py-4">
        <span className="bg-red-100 text-red-800 px-6 py-3 rounded-full font-semibold">
          Order Cancelled
        </span>
      </div>
    )
  }

  const currentIndex = STEPS.findIndex(s => s.key === status)

  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.key} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              {index > 0 && (
                <div className={`flex-1 h-1 ${index <= currentIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  index <= currentIndex
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {index <= currentIndex ? <Check size={16} /> : <Clock size={16} />}
              </div>
              {index < STEPS.length - 1 && (
                <div className={`flex-1 h-1 ${index < currentIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
            <span className={`text-xs mt-2 text-center ${
              index <= currentIndex ? 'text-green-700 font-medium' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
