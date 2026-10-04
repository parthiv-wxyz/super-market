'use client'

import { useCart } from '@/context/CartContext'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalAmount, totalItems } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="mx-auto text-gray-300" size={80} />
        <h2 className="text-2xl font-bold text-gray-800 mt-4">Your cart is empty</h2>
        <p className="text-gray-500 mt-2">Add some products to get started</p>
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart ({totalItems} items)</h1>

      <div className="space-y-4">
        {items.map(item => (
          <div key={item.product.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
            <img
              src={item.product.image_url || 'https://via.placeholder.com/100'}
              alt={item.product.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
              <p className="text-green-600 font-bold">${item.product.price.toFixed(2)} / {item.product.unit}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-semibold">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800">${(item.product.price * item.quantity).toFixed(2)}</p>
              <button
                onClick={() => removeItem(item.product.id)}
                className="text-red-500 hover:text-red-700 mt-1"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
        <div className="space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span>{totalAmount >= 50 ? <span className="text-green-600">FREE</span> : '$5.00'}</span>
          </div>
          <div className="border-t pt-3 flex justify-between text-xl font-bold">
            <span>Total</span>
            <span className="text-green-600">${(totalAmount + (totalAmount >= 50 ? 0 : 5)).toFixed(2)}</span>
          </div>
        </div>
        <Link
          href="/checkout"
          className="block mt-6 bg-green-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-green-700 transition text-lg"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  )
}
