'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import AuthGuard from '@/components/AuthGuard'
import { clusterCompostPickups } from '@/lib/mlEngine'
import { Trash2, Plus, X, MapPin, Package, Route, CheckCircle2 } from 'lucide-react'

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}

export default function Compost() {
  const [pickups, setPickups] = useState([])
  const [clusters, setClusters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({ address: '', pickup_date: '', waste_kg: '' })
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('my')

  useEffect(() => {
    if (!user) return

    async function load() {
      const { data } = await supabase.from('compost_pickups').select('*').order('pickup_date', { ascending: true })
      setPickups(data || [])
      setClusters(clusterCompostPickups(data || []))
      setLoading(false)
    }
    load()
  }, [user])

  async function handleSubmit() {
    if (!form.address || !form.pickup_date || !form.waste_kg) return
    setSubmitting(true)
    const { data, error } = await supabase.from('compost_pickups').insert({
      user_id: user.id, address: form.address,
      pickup_date: form.pickup_date, waste_kg: parseFloat(form.waste_kg), status: 'pending'
    }).select().single()
    if (!error) {
      const updated = [...pickups, data]
      setPickups(updated)
      setClusters(clusterCompostPickups(updated))
      setForm({ address: '', pickup_date: '', waste_kg: '' })
      setShowForm(false)
    }
    setSubmitting(false)
  }

  async function updateStatus(id, status) {
    await supabase.from('compost_pickups').update({ status }).eq('id', id)
    const updated = pickups.map(p => p.id === id ? { ...p, status } : p)
    setPickups(updated)
    setClusters(clusterCompostPickups(updated))
  }

  const myPickups = pickups.filter(p => p.user_id === user?.id)
  const totalWaste = pickups.reduce((s, p) => s + (p.waste_kg || 0), 0)

  return (
    <AuthGuard onUser={setUser}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Compost Scheduler</h1>
            <p className="text-gray-500 text-sm mt-1">Schedule organic waste pickups · Route optimizer included</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Plus size={16} /> Schedule Pickup
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Pickups', value: pickups.length },
            { label: 'Waste Collected', value: `${totalWaste.toFixed(1)} kg` },
            { label: 'Route Clusters', value: clusters.length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-amber-700">{value}</p>
              <p className="text-xs text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Schedule a Pickup</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-1">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Pickup Address</label>
                <input placeholder="e.g. 14, MG Road, Andheri East, Mumbai" value={form.address}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Pickup Date</label>
                <input type="date" value={form.pickup_date}
                  onChange={e => setForm(p => ({ ...p, pickup_date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Estimated Waste (kg)</label>
                <input type="number" step="0.5" placeholder="e.g. 2.5" value={form.waste_kg}
                  onChange={e => setForm(p => ({ ...p, waste_kg: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>
            <button onClick={handleSubmit} disabled={submitting}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
              {submitting ? 'Scheduling...' : 'Schedule Pickup'}
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {[['my', 'My Pickups'], ['all', 'All Pickups'], ['routes', 'Route Optimizer']].map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab ? 'bg-amber-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* My Pickups */}
        {activeTab === 'my' && (
          <div className="space-y-3">
            {myPickups.length === 0 ? (
              <div className="text-center py-12 text-gray-300">
                <Trash2 size={36} className="mx-auto mb-2" />
                <p className="text-sm">No pickups scheduled yet.</p>
              </div>
            ) : myPickups.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <Trash2 size={18} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{p.address}</p>
                  <p className="text-xs text-gray-400">{p.pickup_date} · {p.waste_kg} kg</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[p.status]}`}>{p.status}</span>
                {p.status === 'pending' && (
                  <button onClick={() => updateStatus(p.id, 'completed')}
                    className="text-xs text-green-600 hover:text-green-800 font-medium">Mark done</button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* All Pickups */}
        {activeTab === 'all' && (
          <div className="space-y-3">
            {pickups.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <Package size={18} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{p.address}</p>
                  <p className="text-xs text-gray-400">{p.pickup_date} · {p.waste_kg} kg</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[p.status]}`}>{p.status}</span>
              </div>
            ))}
            {pickups.length === 0 && <p className="text-center py-8 text-gray-300 text-sm">No pickups yet.</p>}
          </div>
        )}

        {/* Route Clusters */}
        {activeTab === 'routes' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
              <strong>Route Optimizer:</strong> Pickups are auto-clustered by area using a greedy algorithm. Higher efficiency = more waste collected per trip.
            </div>
            {clusters.length === 0 ? (
              <p className="text-center py-8 text-gray-300 text-sm">No pickups to cluster.</p>
            ) : clusters.map((cluster, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Route size={16} className="text-blue-600" />
                    <h3 className="font-semibold text-sm text-gray-900">{cluster.area}</h3>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>{cluster.count} stops</span>
                    <span className="font-medium text-amber-700">{cluster.totalWaste} kg total</span>
                    <span className="text-blue-600 font-medium">{cluster.efficiency} kg/stop</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min((cluster.efficiency / 5) * 100, 100)}%` }} />
                </div>
                <div className="space-y-1">
                  {cluster.items.map(item => (
                    <div key={item.id} className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin size={10} />
                      <span className="truncate">{item.address}</span>
                      <span className="ml-auto shrink-0">{item.waste_kg}kg · {item.pickup_date}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      </div>
    </AuthGuard>
  )
}