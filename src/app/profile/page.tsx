'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { User, Save, Loader2, CheckCircle } from 'lucide-react'

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const [fullName, setFullName] = useState('')
  const [address, setAddress] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setAddress(profile.address || '')
    }
  }, [profile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)

    await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        address: address,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    await refreshProfile()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <User className="text-green-600" size={32} />
          </div>
          <div>
            <h2 className="font-bold text-lg">{profile?.full_name || 'User'}</h2>
            <p className="text-gray-500">{profile?.phone}</p>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {profile?.role || 'customer'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={profile?.phone || ''}
              disabled
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-400 mt-1">Phone number cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Enter your default delivery address"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : saved ? <CheckCircle size={20} /> : <Save size={20} />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
