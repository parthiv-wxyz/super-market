'use client'

import { Product } from '@/lib/types'
import { useCart } from '@/context/CartContext'
import { ShoppingCart, Check } from 'lucide-react'

export default function ProductCard({ product }: { product: Product }) {
  const { items, addItem } = useCart()
  const isInCart = items.some(item => item.product.id === product.id)

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={product.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {!product.in_stock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold text-sm">
              Out of Stock
            </span>
          </div>
        )}
        {product.in_stock && (
          <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            In Stock
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 truncate">{product.name}</h3>
        <p className="text-gray-500 text-sm mt-1 truncate">{product.description}</p>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-green-600 font-bold text-xl">${product.price.toFixed(2)}</span>
            <span className="text-gray-400 text-sm ml-1">/ {product.unit}</span>
          </div>
          <button
            onClick={() => addItem(product)}
            disabled={!product.in_stock}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
              !product.in_stock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isInCart
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isInCart ? <><Check size={16} /> Added</> : <><ShoppingCart size={16} /> Add</>}
          </button>
        </div>
      </div>
    </div>
  )
}
