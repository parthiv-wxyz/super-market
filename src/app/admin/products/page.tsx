'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Product, Category } from '@/lib/types'
import { Plus, Edit2, Trash2, X, Loader2, ToggleLeft, ToggleRight } from 'lucide-react'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  // Form state
  const [form, setForm] = useState({
    name: '', description: '', price: '', image_url: '', category_id: '', unit: 'piece', in_stock: true,
  })

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*, category:categories(*)').order('name')
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
    supabase.from('categories').select('*').order('name').then(({ data }) => setCategories(data || []))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openAddModal = () => {
    setEditingProduct(null)
    setForm({ name: '', description: '', price: '', image_url: '', category_id: '', unit: 'piece', in_stock: true })
    setShowModal(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      image_url: product.image_url || '',
      category_id: product.category_id || '',
      unit: product.unit,
      in_stock: product.in_stock,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      image_url: form.image_url || null,
      category_id: form.category_id || null,
      unit: form.unit,
      in_stock: form.in_stock,
      updated_at: new Date().toISOString(),
    }

    if (editingProduct) {
      await supabase.from('products').update(payload).eq('id', editingProduct.id)
    } else {
      await supabase.from('products').insert(payload)
    }

    await fetchProducts()
    setShowModal(false)
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    await fetchProducts()
  }

  const toggleStock = async (product: Product) => {
    await supabase.from('products').update({ in_stock: !product.in_stock, updated_at: new Date().toISOString() }).eq('id', product.id)
    await fetchProducts()
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products ({products.length})</h1>
        <button
          onClick={openAddModal}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Stock</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={product.image_url || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium text-gray-800">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{product.category?.name || '-'}</td>
                  <td className="py-3 px-4 font-medium">${product.price.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => toggleStock(product)} className="flex items-center gap-1">
                      {product.in_stock ? (
                        <><ToggleRight className="text-green-600" size={24} /><span className="text-green-600 text-xs">In Stock</span></>
                      ) : (
                        <><ToggleLeft className="text-red-400" size={24} /><span className="text-red-400 text-xs">Out of Stock</span></>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditModal(product)} className="text-blue-600 hover:text-blue-800 p-1"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input type="text" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white">
                  <option value="">Select category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input type="url" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="in_stock" checked={form.in_stock} onChange={e => setForm({ ...form, in_stock: e.target.checked })} className="rounded" />
                <label htmlFor="in_stock" className="text-sm font-medium text-gray-700">In Stock</label>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-gray-800 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.name || !form.price} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="animate-spin" size={18} /> : null}
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
