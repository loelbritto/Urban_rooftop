'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import AuthGuard from '@/components/AuthGuard'
import {
  Leaf, Sprout, Wind, Recycle, TrendingUp,
  MapPin, ShoppingBasket, CalendarCheck, ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [spaces, setSpaces] = useState([])
  const [listings, setListings] = useState([])
  const [mySpaces, setMySpaces] = useState([])
  const [myListings, setMyListings] = useState([])
  const [myPickups, setMyPickups] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!user) return

    let active = true

    async function withTimeout(promise, ms = 6000) {
      let timer
      const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Dashboard request timed out.')), ms)
      })

      try {
        return await Promise.race([promise, timeoutPromise])
      } finally {
        clearTimeout(timer)
      }
    }

    async function load() {
      if (active) setLoading(true)
      setLoadError('')

      try {
        const { data: existingStats, error: statsError } = await withTimeout(
          supabase
            .from('impact_stats')
            .select('id,user_id,food_grown_kg,waste_composted_kg,co2_saved_kg')
            .eq('user_id', user.id)
            .maybeSingle()
        )

        if (statsError) throw statsError

        if (existingStats) {
          if (active) setStats(existingStats)
        } else {
          const { data: insertedStats, error: insertError } = await withTimeout(
            supabase
              .from('impact_stats')
              .insert({ user_id: user.id, food_grown_kg: 0, waste_composted_kg: 0, co2_saved_kg: 0 })
              .select()
              .single()
          )

          if (insertError) throw insertError
          if (active) setStats(insertedStats)
        }

        const [spacesRes, listingsRes, mySpacesRes, myListingsRes, myPickupsRes] = await Promise.all([
          withTimeout(
            supabase
              .from('spaces')
              .select('id,title,location,size_sqft,sunlight_hours,is_available,created_at')
              .eq('is_available', true)
              .order('created_at', { ascending: false })
              .limit(3)
          ),
          withTimeout(
            supabase
              .from('marketplace')
              .select('id,crop_name,quantity_kg,price_per_kg,is_barter,created_at')
              .order('created_at', { ascending: false })
              .limit(3)
          ),
          withTimeout(
            supabase
              .from('spaces')
              .select('id,is_available,size_sqft')
              .eq('owner_id', user.id)
          ),
          withTimeout(
            supabase
              .from('marketplace')
              .select('id,quantity_kg,is_barter')
              .eq('seller_id', user.id)
          ),
          withTimeout(
            supabase
              .from('compost_pickups')
              .select('id,pickup_date,status,waste_kg')
              .eq('user_id', user.id)
              .order('pickup_date', { ascending: true })
              .limit(6)
          ),
        ])

        if (spacesRes.error) throw spacesRes.error
        if (listingsRes.error) throw listingsRes.error
        if (mySpacesRes.error) throw mySpacesRes.error
        if (myListingsRes.error) throw myListingsRes.error
        if (myPickupsRes.error) throw myPickupsRes.error

        if (active) {
          setSpaces(spacesRes.data || [])
          setListings(listingsRes.data || [])
          setMySpaces(mySpacesRes.data || [])
          setMyListings(myListingsRes.data || [])
          setMyPickups(myPickupsRes.data || [])
        }
      } catch (error) {
        if (active) {
          setLoadError(error?.message || 'Could not load dashboard data.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [user, reloadKey])

  async function updateStat(field, amount) {
    if (!stats) return
    const updated = { ...stats, [field]: parseFloat((stats[field] + amount).toFixed(1)) }
    if (field === 'food_grown_kg') updated.co2_saved_kg = parseFloat((updated.food_grown_kg * 0.21).toFixed(1))
    setStats(updated)
    await supabase.from('impact_stats').update(updated).eq('id', stats.id)
  }

  if (loadError) return (
    <AuthGuard onUser={setUser}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-4">
            <p className="font-medium">Could not load dashboard</p>
            <p className="text-sm mt-1">{loadError}</p>
            <button
              onClick={() => setReloadKey(k => k + 1)}
              className="mt-3 bg-white border border-red-200 text-red-700 px-3 py-1.5 rounded-lg text-sm hover:bg-red-100 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    </AuthGuard>
  )

  const metricCards = [
    {
      label: 'Food Grown',
      value: stats?.food_grown_kg || 0,
      unit: 'kg',
      icon: Sprout,
      color: 'green',
      field: 'food_grown_kg',
      step: 0.5,
      desc: 'Total produce harvested',
    },
    {
      label: 'Waste Composted',
      value: stats?.waste_composted_kg || 0,
      unit: 'kg',
      icon: Recycle,
      color: 'amber',
      field: 'waste_composted_kg',
      step: 0.5,
      desc: 'Organic waste diverted',
    },
    {
      label: 'CO₂ Saved',
      value: stats?.co2_saved_kg || 0,
      unit: 'kg',
      icon: Wind,
      color: 'blue',
      field: null,
      desc: 'Auto-calculated from food grown',
    },
    {
      label: 'Green Score',
      value: Math.round((stats?.food_grown_kg || 0) * 10 + (stats?.waste_composted_kg || 0) * 5),
      unit: 'pts',
      icon: TrendingUp,
      color: 'purple',
      field: null,
      desc: 'Your sustainability rating',
    },
  ]

  const colorMap = {
    green: { bg: 'bg-green-50', text: 'text-green-700', icon: 'bg-green-100 text-green-600', badge: 'bg-green-100 text-green-700' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'bg-amber-100 text-amber-600', badge: 'bg-amber-100 text-amber-700' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'bg-blue-100 text-blue-600', badge: 'bg-blue-100 text-blue-700' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'bg-purple-100 text-purple-600', badge: 'bg-purple-100 text-purple-700' },
  }

  const myAvailableSpaces = mySpaces.filter(space => space.is_available).length
  const myProduceKg = myListings.reduce((total, item) => total + Number(item.quantity_kg || 0), 0)
  const pendingPickups = myPickups.filter(item => item.status === 'pending').length
  const upcomingPickup = myPickups.find(item => new Date(item.pickup_date) >= new Date())
  const networkScore = Math.round(
    myAvailableSpaces * 10 +
    myListings.length * 8 +
    pendingPickups * 5 +
    (stats?.food_grown_kg || 0) * 2 +
    (stats?.waste_composted_kg || 0)
  )
  const impactHint =
    myAvailableSpaces === 0
      ? 'List one rooftop space to boost your community match score.'
      : pendingPickups === 0
        ? 'Schedule compost pickup to improve your circular impact.'
        : 'Great momentum. Keep listings active and pickups on schedule.'

  return (
    <AuthGuard onUser={setUser}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-1">Welcome back</p>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.email?.split('@')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here your sustainability impact at a glance.
          </p>
          {loading && (
            <p className="text-xs text-gray-400 mt-2">Syncing latest dashboard data...</p>
          )}
        </div>

        {/* Impact Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metricCards.map(({ label, value, unit, icon: Icon, color, field, step, desc }) => {
            const c = colorMap[color]
            return (
              <div key={label} className={`${c.bg} rounded-2xl p-5 border border-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-9 h-9 ${c.icon} rounded-xl flex items-center justify-center`}>
                    <Icon size={17} />
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.badge}`}>
                    {unit}
                  </span>
                </div>
                <p className={`text-3xl font-bold ${c.text} mb-1`}>{value}</p>
                <p className="text-xs font-medium text-gray-700 mb-0.5">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
                {field && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => updateStat(field, step)}
                      className="flex-1 text-xs bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-1.5 rounded-lg transition-colors font-medium"
                    >
                      + {step}kg
                    </button>
                    <button
                      onClick={() => updateStat(field, -step)}
                      className="flex-1 text-xs bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-1.5 rounded-lg transition-colors font-medium"
                    >
                      - {step}kg
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* CO2 Progress Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">Monthly CO₂ Goal</h2>
              <p className="text-sm text-gray-500 mt-0.5">Target: 50kg saved this month</p>
            </div>
            <span className="text-2xl font-bold text-green-700">
              {Math.min(Math.round(((stats?.co2_saved_kg || 0) / 50) * 100), 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(((stats?.co2_saved_kg || 0) / 50) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400">0 kg</span>
            <span className="text-xs text-gray-400">50 kg</span>
          </div>
        </div>

        {/* Connected Snapshot */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">My Spaces</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{mySpaces.length}</p>
            <p className="text-xs text-gray-400 mt-1">{myAvailableSpaces} currently available</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">My Listings</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{myListings.length}</p>
            <p className="text-xs text-gray-400 mt-1">{myProduceKg.toFixed(1)} kg produce in market</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Compost Queue</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{pendingPickups}</p>
            <p className="text-xs text-gray-400 mt-1">{upcomingPickup ? `Next: ${new Date(upcomingPickup.pickup_date).toLocaleDateString()}` : 'No upcoming pickup'}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Network Score</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{networkScore}</p>
            <p className="text-xs text-gray-400 mt-1">Live from your activities</p>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-8">
          <p className="text-sm font-semibold text-emerald-800">Action Insight</p>
          <p className="text-sm text-emerald-700 mt-1">{impactHint}</p>
          <div className="flex gap-2 flex-wrap mt-3">
            <Link href="/spaces" className="text-xs bg-white border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">Manage Spaces</Link>
            <Link href="/marketplace" className="text-xs bg-white border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">Update Listings</Link>
            <Link href="/compost" className="text-xs bg-white border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">Compost Planner</Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Browse Spaces', href: '/spaces', icon: MapPin, color: 'text-green-600 bg-green-50 border-green-100' },
            { label: 'Crop Advisor', href: '/advisor', icon: Sprout, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
            { label: 'Schedule Compost', href: '/compost', icon: CalendarCheck, color: 'text-amber-600 bg-amber-50 border-amber-100' },
            { label: 'Marketplace', href: '/marketplace', icon: ShoppingBasket, color: 'text-purple-600 bg-purple-50 border-purple-100' },
          ].map(({ label, href, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 p-4 rounded-xl border ${color} hover:shadow-sm transition-all group`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium flex-1">{label}</span>
              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>

        {/* Recent Spaces + Marketplace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Spaces */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900">Available Spaces</h2>
              <Link href="/spaces" className="text-xs text-green-600 hover:underline font-medium">
                View all
              </Link>
            </div>
            {spaces.length === 0 ? (
              <div className="text-center py-8">
                <MapPin size={28} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No spaces listed yet.</p>
                <Link href="/spaces" className="text-xs text-green-600 hover:underline mt-1 inline-block">
                  List the first one
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {spaces.map(space => (
                  <div key={space.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin size={16} className="text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{space.title}</p>
                      <p className="text-xs text-gray-400">{space.location} · {space.size_sqft} sqft · {space.sunlight_hours}h sun</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium shrink-0">
                      Available
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Marketplace */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900">Marketplace</h2>
              <Link href="/marketplace" className="text-xs text-green-600 hover:underline font-medium">
                View all
              </Link>
            </div>
            {listings.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBasket size={28} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No crops listed yet.</p>
                <Link href="/marketplace" className="text-xs text-green-600 hover:underline mt-1 inline-block">
                  List your harvest
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                      <Leaf size={16} className="text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.crop_name}</p>
                      <p className="text-xs text-gray-400">{item.quantity_kg} kg available</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-800 shrink-0">
                      {item.is_barter ? '🔄 Barter' : `₹${item.price_per_kg}/kg`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
      </div>
    </AuthGuard>
  )
}