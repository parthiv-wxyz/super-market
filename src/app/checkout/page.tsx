'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CreditCard, Wallet, Banknote, Loader2, CheckCircle2, MapPin } from 'lucide-react'

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart()
  const { user, profile } = useAuth()
  const [address, setAddress] = useState(profile?.address || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details')
  const [loading, setLoading] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [upiId, setUpiId] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const deliveryFee = totalAmount >= 50 ? 0 : 5
  const grandTotal = totalAmount + deliveryFee

  const handlePlaceOrder = async () => {
    if (!user) return
    setLoading(true)

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: grandTotal,
        delivery_address: address,
        delivery_phone: phone,
        notes: notes || null,
        status: 'placed',
      })
      .select()
      .single()

    if (error || !order) {
      alert('Failed to place order. Please try again.')
      setLoading(false)
      return
    }

    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
    }))

    await supabase.from('order_items').insert(orderItems)

    clearCart()
    setStep('success')
    setLoading(false)
  }

  if (items.length === 0 && step !== 'success') {
    router.push('/cart')
    return null
  }

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <CheckCircle2 className="mx-auto text-green-500" size={80} />
        <h2 className="text-3xl font-bold text-gray-800 mt-6">Order Placed!</h2>
        <p className="text-gray-500 mt-3">Your order has been placed successfully. You can track it in your orders page.</p>
        <div className="flex gap-4 justify-center mt-8">
          <button
            onClick={() => router.push('/orders')}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            View Orders
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

      {/* Steps indicator */}
      <div className="flex items-center mb-8">
        <div className={`flex items-center gap-2 ${step === 'details' ? 'text-green-600' : 'text-gray-400'}`}>
          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'details' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-600'}`}>1</span>
          <span className="font-medium">Delivery Details</span>
        </div>
        <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
        <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-green-600' : 'text-gray-400'}`}>
          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'payment' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>2</span>
          <span className="font-medium">Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {step === 'details' ? (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="text-green-600" /> Delivery Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Enter your full delivery address"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Any special instructions..."
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>
                <button
                  onClick={() => setStep('payment')}
                  disabled={!address || !phone}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <CreditCard className="text-green-600" /> Payment Method
              </h2>

              {/* Payment method tabs */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-lg border-2 text-center transition ${
                    paymentMethod === 'card' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="mx-auto mb-1" size={24} />
                  <span className="text-sm font-medium">Card</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 rounded-lg border-2 text-center transition ${
                    paymentMethod === 'upi' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Wallet className="mx-auto mb-1" size={24} />
                  <span className="text-sm font-medium">UPI</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-lg border-2 text-center transition ${
                    paymentMethod === 'cod' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Banknote className="mx-auto mb-1" size={24} />
                  <span className="text-sm font-medium">Cash</span>
                </button>
              </div>

              {/* Card payment form */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value)}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">⚠️ This is a demo payment page. No real transactions will be processed.</p>
                </div>
              )}

              {/* UPI payment form */}
              {paymentMethod === 'upi' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <p className="text-xs text-gray-400">⚠️ This is a demo payment page. No real transactions will be processed.</p>
                </div>
              )}

              {/* COD */}
              {paymentMethod === 'cod' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">💵 Pay with cash when your order is delivered. Please keep the exact amount ready.</p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep('details')}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                  {loading ? 'Placing Order...' : `Pay $${grandTotal.toFixed(2)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-white rounded-xl shadow-sm p-6 h-fit">
          <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {items.map(item => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.product.name} × {item.quantity}</span>
                <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Delivery</span>
              <span>{deliveryFee === 0 ? <span className="text-green-600">FREE</span> : `$${deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span className="text-green-600">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
