'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Category, Product } from '@/lib/types'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'
import { ArrowRight, Truck, Clock, ShieldCheck } from 'lucide-react'

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const [catRes, prodRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('products').select('*, category:categories(*)').limit(8).order('created_at', { ascending: false }),
      ])
      setCategories(catRes.data || [])
      setFeaturedProducts(prodRes.data || [])
      setLoading(false)
    }
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">Fresh Groceries<br />Delivered to Your Door</h1>
            <p className="text-xl text-green-100 mb-8">Shop from our wide selection of fresh produce, dairy, bakery items, and more. Fast delivery guaranteed.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition text-lg"
            >
              Shop Now <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm">
            <Truck className="text-green-600 shrink-0" size={40} />
            <div>
              <h3 className="font-semibold text-lg">Free Delivery</h3>
              <p className="text-gray-500 text-sm">On orders above $50</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm">
            <Clock className="text-green-600 shrink-0" size={40} />
            <div>
              <h3 className="font-semibold text-lg">Quick Delivery</h3>
              <p className="text-gray-500 text-sm">Within 2-4 hours</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm">
            <ShieldCheck className="text-green-600 shrink-0" size={40} />
            <div>
              <h3 className="font-semibold text-lg">Quality Guaranteed</h3>
              <p className="text-gray-500 text-sm">100% fresh products</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Shop by Category</h2>
          <Link href="/products" className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className="group relative rounded-xl overflow-hidden h-40 shadow-md hover:shadow-lg transition"
            >
              <img
                src={cat.image_url || 'https://via.placeholder.com/300x200'}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <span className="text-white font-semibold p-4">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}
