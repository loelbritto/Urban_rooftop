'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import AuthGuard from '@/components/AuthGuard'
import { CROPS } from '@/lib/cropdata'
import { ShoppingBasket, Plus, X, Leaf, TrendingUp, ArrowUpDown } from 'lucide-react'

export default function Marketplace() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({ crop_name: '', quantity_kg: '', price_per_kg: '', is_barter: false })
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    if (!user) return

    async function load() {
      const { data } = await supabase.from('marketplace').select('*').order('created_at', { ascending: false })
      setListings(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  async function handleSubmit() {
    if (!form.crop_name || !form.quantity_kg) return
    setSubmitting(true)
    const { data, error } = await supabase.from('marketplace').insert({
      seller_id: user.id,
      crop_name: form.crop_name,
      quantity_kg: parseFloat(form.quantity_kg),
      price_per_kg: form.is_barter ? 0 : parseFloat(form.price_per_kg || 0),
      is_barter: form.is_barter
    }).select().single()
    if (!error) {
      setListings(prev => [data, ...prev])
      setForm({ crop_name: '', quantity_kg: '', price_per_kg: '', is_barter: false })
      setShowForm(false)
    }
    setSubmitting(false)
  }

  async function deleteListing(id) {
    await supabase.from('marketplace').delete().eq('id', id)
    setListings(prev => prev.filter(l => l.id !== id))
  }

  // Demand heatmap: count crops
  const demandMap = listings.reduce((acc, l) => {
    acc[l.crop_name] = (acc[l.crop_name] || 0) + l.quantity_kg
    return acc
  }, {})
  const topCrops = Object.entries(demandMap).sort((a, b) => b[1] - a[1]).slice(0, 5)

  let displayed = filter === 'barter' ? listings.filter(l => l.is_barter)
    : filter === 'sale' ? listings.filter(l => !l.is_barter) : listings

  if (sort === 'price_low') displayed = [...displayed].sort((a, b) => a.price_per_kg - b.price_per_kg)
  if (sort === 'price_high') displayed = [...displayed].sort((a, b) => b.price_per_kg - a.price_per_kg)
  if (sort === 'qty') displayed = [...displayed].sort((a, b) => b.quantity_kg - a.quantity_kg)

  const cropNames = [...new Set(CROPS.map(c => c.name))].sort()

  return (
    <AuthGuard onUser={setUser}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Harvest Marketplace</h1>
            <p className="text-gray-500 text-sm mt-1">Trade, sell, or barter your rooftop harvest</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Plus size={16} /> List Harvest
          </button>
        </div>

        {/* Demand Heatmap */}
        {topCrops.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-purple-600" />
              <h2 className="font-semibold text-sm text-gray-900">Supply Heatmap</h2>
              <span className="text-xs text-gray-400">Most supplied crops in your network</span>
            </div>
            <div className="space-y-2">
              {topCrops.map(([crop, qty], i) => {
                const pct = Math.round((qty / topCrops[0][1]) * 100)
                return (
                  <div key={crop} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-5 text-right shrink-0">#{i + 1}</span>
                    <span className="text-sm font-medium text-gray-800 w-32 shrink-0">{crop}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 shrink-0">{qty.toFixed(1)} kg</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">List Your Harvest</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Crop</label>
                <select value={form.crop_name} onChange={e => setForm(p => ({ ...p, crop_name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white">
                  <option value="">Select a crop</option>
                  {cropNames.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Quantity (kg)</label>
                <input type="number" step="0.5" placeholder="e.g. 3.5" value={form.quantity_kg}
                  onChange={e => setForm(p => ({ ...p, quantity_kg: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  {form.is_barter ? 'Barter (no price needed)' : 'Price per kg (₹)'}
                </label>
                <input type="number" placeholder="e.g. 40" value={form.price_per_kg} disabled={form.is_barter}
                  onChange={e => setForm(p => ({ ...p, price_per_kg: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-50 disabled:text-gray-400" />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setForm(p => ({ ...p, is_barter: !p.is_barter }))}
                    className={`w-11 h-6 rounded-full transition-colors relative ${form.is_barter ? 'bg-purple-600' : 'bg-gray-200'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.is_barter ? 'left-6' : 'left-1'}`} />
                  </div>
                  <span className="text-sm text-gray-700">Offer for Barter</span>
                </label>
              </div>
            </div>
            <button onClick={handleSubmit} disabled={submitting}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
              {submitting ? 'Listing...' : 'Post Listing'}
            </button>
          </div>
        )}

        {/* Filters + Sort */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex gap-2">
            {[['all', 'All'], ['sale', 'For Sale'], ['barter', 'Barter Only']].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)}
                className={`text-sm px-4 py-1.5 rounded-xl border font-medium transition-all ${filter === val ? 'bg-purple-700 text-white border-purple-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {label}
              </button>
            ))}
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="text-sm px-3 py-1.5 border border-gray-200 rounded-xl bg-white text-gray-600 focus:outline-none">
            <option value="newest">Newest</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="qty">Most Quantity</option>
          </select>
        </div>

        {/* Listings */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Leaf size={18} className="text-purple-600" />
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.is_barter ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {item.is_barter ? '🔄 Barter' : 'For Sale'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.crop_name}</h3>
                <p className="text-xs text-gray-400 mb-3">{item.quantity_kg} kg available</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-purple-700">
                    {item.is_barter ? 'Trade' : `₹${item.price_per_kg}/kg`}
                  </span>
                  {item.seller_id === user?.id && (
                    <button onClick={() => deleteListing(item.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors">Remove</button>
                  )}
                </div>
                {!item.is_barter && item.price_per_kg > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Total value: ₹{(item.quantity_kg * item.price_per_kg).toFixed(0)}
                  </p>
                )}
              </div>
            ))}
            {displayed.length === 0 && (
              <div className="col-span-3 text-center py-12 text-gray-300">
                <ShoppingBasket size={36} className="mx-auto mb-2" />
                <p className="text-sm">No listings yet.</p>
              </div>
            )}
          </div>
        )}
      </main>
      </div>
    </AuthGuard>
  )
}