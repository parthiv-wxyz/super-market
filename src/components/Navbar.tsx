'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { ShoppingCart, User, Package, LogOut, Menu, X, Shield } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, profile, signOut, loading } = useAuth()
  const { totalItems } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-green-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold flex items-center gap-2">
            🛒 SuperMarket
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/products" className="hover:text-green-200 transition">Products</Link>
            {user ? (
              <>
                <Link href="/orders" className="hover:text-green-200 transition flex items-center gap-1">
                  <Package size={18} /> Orders
                </Link>
                <Link href="/profile" className="hover:text-green-200 transition flex items-center gap-1">
                  <User size={18} /> {profile?.full_name || 'Profile'}
                </Link>
                {profile?.role === 'admin' && (
                  <Link href="/admin" className="hover:text-green-200 transition flex items-center gap-1">
                    <Shield size={18} /> Admin
                  </Link>
                )}
                <button onClick={signOut} className="hover:text-green-200 transition flex items-center gap-1">
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="hover:text-green-200 transition">Login</Link>
            )}
            <Link href="/cart" className="relative hover:text-green-200 transition">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <Link href="/cart" className="relative">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link href="/products" className="block hover:text-green-200" onClick={() => setMenuOpen(false)}>Products</Link>
            {user ? (
              <>
                <Link href="/orders" className="block hover:text-green-200" onClick={() => setMenuOpen(false)}>Orders</Link>
                <Link href="/profile" className="block hover:text-green-200" onClick={() => setMenuOpen(false)}>Profile</Link>
                {profile?.role === 'admin' && (
                  <Link href="/admin" className="block hover:text-green-200" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
                )}
                <button onClick={() => { signOut(); setMenuOpen(false) }} className="block hover:text-green-200">Logout</button>
              </>
            ) : (
              <Link href="/login" className="block hover:text-green-200" onClick={() => setMenuOpen(false)}>Login</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
