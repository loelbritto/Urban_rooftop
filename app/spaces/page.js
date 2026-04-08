'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import AuthGuard from '@/components/AuthGuard'
import { predictYield } from '@/lib/mlEngine'
import { getCurrentSeason } from '@/lib/cropdata'
import { MapPin, Plus, X, CheckCircle2, Layers3, Flame, List, Landmark, ShieldCheck, Droplets, Zap } from 'lucide-react'

const STOCK_IMAGES = [
  'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1472145246862-b24cf25c4a36?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
]

const DEMO_SPACES = [
  { id: 'demo-1', owner_id: 'demo', title: 'Bandra Terrace Garden', location: 'Bandra West, Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', pincode: '400050', size_sqft: 120, sunlight_hours: 7, is_available: true, lat: 19.0607, lng: 72.8363, roof_type: 'RCC Flat', water_access: true, electricity_access: true, security_rating: 4.7, soil_depth_cm: 30, rent_inr_month: 4500, nearby_market_km: 1.2, aqi_avg: 82, population_density: 21000, image_url: STOCK_IMAGES[0] },
  { id: 'demo-2', owner_id: 'demo', title: 'Andheri Rooftop Patch', location: 'Andheri East, Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', pincode: '400069', size_sqft: 90, sunlight_hours: 6, is_available: true, lat: 19.1136, lng: 72.8697, roof_type: 'Metal + RCC', water_access: true, electricity_access: true, security_rating: 4.2, soil_depth_cm: 24, rent_inr_month: 3600, nearby_market_km: 0.9, aqi_avg: 95, population_density: 25000, image_url: STOCK_IMAGES[1] },
  { id: 'demo-3', owner_id: 'demo', title: 'Powai Sun Deck', location: 'Powai, Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', pincode: '400076', size_sqft: 150, sunlight_hours: 8, is_available: false, lat: 19.1176, lng: 72.9060, roof_type: 'RCC Flat', water_access: true, electricity_access: true, security_rating: 4.8, soil_depth_cm: 34, rent_inr_month: 6200, nearby_market_km: 1.6, aqi_avg: 74, population_density: 14000, image_url: STOCK_IMAGES[2] },
  { id: 'demo-4', owner_id: 'demo', title: 'Dadar Community Roof', location: 'Dadar, Mumbai', district: 'Mumbai City', state: 'Maharashtra', pincode: '400014', size_sqft: 110, sunlight_hours: 5, is_available: true, lat: 19.0178, lng: 72.8478, roof_type: 'RCC Flat', water_access: true, electricity_access: false, security_rating: 4.1, soil_depth_cm: 22, rent_inr_month: 3000, nearby_market_km: 0.7, aqi_avg: 102, population_density: 31000, image_url: STOCK_IMAGES[3] },
  { id: 'demo-5', owner_id: 'demo', title: 'Chembur Green Top', location: 'Chembur, Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', pincode: '400071', size_sqft: 75, sunlight_hours: 6, is_available: true, lat: 19.0626, lng: 72.9005, roof_type: 'RCC Flat', water_access: true, electricity_access: true, security_rating: 4.0, soil_depth_cm: 20, rent_inr_month: 2400, nearby_market_km: 1.9, aqi_avg: 97, population_density: 22000, image_url: STOCK_IMAGES[4] },
  { id: 'demo-6', owner_id: 'demo', title: 'Malad Terrace Beds', location: 'Malad West, Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', pincode: '400064', size_sqft: 140, sunlight_hours: 7, is_available: true, lat: 19.1864, lng: 72.8484, roof_type: 'RCC Flat', water_access: true, electricity_access: true, security_rating: 4.3, soil_depth_cm: 28, rent_inr_month: 5100, nearby_market_km: 1.1, aqi_avg: 89, population_density: 24000, image_url: STOCK_IMAGES[0] },
  { id: 'demo-7', owner_id: 'demo', title: 'Ghatkopar Urban Canopy', location: 'Ghatkopar East, Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', pincode: '400077', size_sqft: 88, sunlight_hours: 6, is_available: true, lat: 19.0856, lng: 72.9081, roof_type: 'RCC + Shed', water_access: true, electricity_access: true, security_rating: 4.1, soil_depth_cm: 22, rent_inr_month: 3100, nearby_market_km: 0.8, aqi_avg: 93, population_density: 26000, image_url: STOCK_IMAGES[1] },
  { id: 'demo-8', owner_id: 'demo', title: 'Navi Mumbai Sky Plot', location: 'Vashi, Navi Mumbai', district: 'Thane', state: 'Maharashtra', pincode: '400703', size_sqft: 170, sunlight_hours: 8, is_available: true, lat: 19.0760, lng: 72.9986, roof_type: 'RCC Flat', water_access: true, electricity_access: true, security_rating: 4.6, soil_depth_cm: 35, rent_inr_month: 7000, nearby_market_km: 2.0, aqi_avg: 68, population_density: 13000, image_url: STOCK_IMAGES[2] },
  { id: 'demo-9', owner_id: 'demo', title: 'Byculla Heritage Roof', location: 'Byculla, Mumbai', district: 'Mumbai City', state: 'Maharashtra', pincode: '400027', size_sqft: 95, sunlight_hours: 5, is_available: false, lat: 18.9767, lng: 72.8331, roof_type: 'Old Brick + RCC', water_access: true, electricity_access: false, security_rating: 3.8, soil_depth_cm: 18, rent_inr_month: 2800, nearby_market_km: 0.6, aqi_avg: 110, population_density: 32000, image_url: STOCK_IMAGES[3] },
  { id: 'demo-10', owner_id: 'demo', title: 'Kurla Pocket Farm Roof', location: 'Kurla, Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', pincode: '400070', size_sqft: 105, sunlight_hours: 6, is_available: true, lat: 19.0726, lng: 72.8826, roof_type: 'RCC Flat', water_access: true, electricity_access: true, security_rating: 3.9, soil_depth_cm: 21, rent_inr_month: 3300, nearby_market_km: 1.0, aqi_avg: 99, population_density: 28000, image_url: STOCK_IMAGES[4] },
  { id: 'demo-11', owner_id: 'demo', title: 'Worli Sea-Breeze Roof', location: 'Worli, Mumbai', district: 'Mumbai City', state: 'Maharashtra', pincode: '400018', size_sqft: 160, sunlight_hours: 7, is_available: true, lat: 19.0176, lng: 72.8174, roof_type: 'RCC Flat', water_access: true, electricity_access: true, security_rating: 4.9, soil_depth_cm: 31, rent_inr_month: 7600, nearby_market_km: 1.4, aqi_avg: 73, population_density: 17000, image_url: STOCK_IMAGES[0] },
  { id: 'demo-12', owner_id: 'demo', title: 'Kandivali Community Roof', location: 'Kandivali East, Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', pincode: '400101', size_sqft: 130, sunlight_hours: 6, is_available: true, lat: 19.2050, lng: 72.8606, roof_type: 'RCC Flat', water_access: true, electricity_access: true, security_rating: 4.2, soil_depth_cm: 26, rent_inr_month: 4700, nearby_market_km: 1.3, aqi_avg: 84, population_density: 21000, image_url: STOCK_IMAGES[1] },
  { id: 'demo-13', owner_id: 'demo', title: 'Thane Balcony-Roof Hybrid', location: 'Naupada, Thane', district: 'Thane', state: 'Maharashtra', pincode: '400602', size_sqft: 82, sunlight_hours: 5, is_available: true, lat: 19.1947, lng: 72.9710, roof_type: 'Hybrid Deck', water_access: true, electricity_access: true, security_rating: 4.0, soil_depth_cm: 19, rent_inr_month: 2500, nearby_market_km: 0.9, aqi_avg: 79, population_density: 18500, image_url: STOCK_IMAGES[2] },
  { id: 'demo-14', owner_id: 'demo', title: 'Sion Learning Garden Roof', location: 'Sion, Mumbai', district: 'Mumbai City', state: 'Maharashtra', pincode: '400022', size_sqft: 115, sunlight_hours: 6, is_available: true, lat: 19.0434, lng: 72.8614, roof_type: 'RCC Flat', water_access: true, electricity_access: true, security_rating: 4.3, soil_depth_cm: 24, rent_inr_month: 3900, nearby_market_km: 0.7, aqi_avg: 92, population_density: 27000, image_url: STOCK_IMAGES[3] },
  { id: 'demo-15', owner_id: 'demo', title: 'Mulund East Sky Patch', location: 'Mulund East, Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', pincode: '400081', size_sqft: 98, sunlight_hours: 7, is_available: true, lat: 19.1714, lng: 72.9560, roof_type: 'RCC Flat', water_access: true, electricity_access: true, security_rating: 4.4, soil_depth_cm: 23, rent_inr_month: 3400, nearby_market_km: 1.1, aqi_avg: 80, population_density: 16500, image_url: STOCK_IMAGES[4] },
]

const HEAT_DATASET = [
  { id: 'h-1', lat: 19.076, lng: 72.8777, intensity: 92, zone: 'Central Mumbai', label: 'High rooftop demand' },
  { id: 'h-2', lat: 19.1197, lng: 72.8468, intensity: 76, zone: 'Juhu', label: 'High sunlight belt' },
  { id: 'h-3', lat: 19.1424, lng: 72.9353, intensity: 64, zone: 'Vikhroli', label: 'Moderate demand' },
  { id: 'h-4', lat: 19.0522, lng: 72.9005, intensity: 81, zone: 'Chembur', label: 'Strong compost network' },
  { id: 'h-5', lat: 18.9655, lng: 72.8193, intensity: 58, zone: 'Colaba', label: 'Premium small rooftops' },
  { id: 'h-6', lat: 19.2058, lng: 72.8682, intensity: 70, zone: 'Borivali', label: 'Family rooftop clusters' },
  { id: 'h-7', lat: 19.0886, lng: 72.8852, intensity: 88, zone: 'Kurla-Ghatkopar Belt', label: 'Dense demand + transit access' },
  { id: 'h-8', lat: 19.1830, lng: 72.8347, intensity: 72, zone: 'Malad-Goregaon', label: 'Sunlight heavy rooftops' },
  { id: 'h-9', lat: 19.0213, lng: 72.8424, intensity: 79, zone: 'Dadar-Parel', label: 'Community farming uptake' },
  { id: 'h-10', lat: 19.1934, lng: 72.9676, intensity: 62, zone: 'Thane Core', label: 'Emerging rooftop inventory' },
  { id: 'h-11', lat: 19.0756, lng: 72.9959, intensity: 67, zone: 'Vashi', label: 'Balanced demand and quality' },
  { id: 'h-12', lat: 19.1635, lng: 72.9458, intensity: 74, zone: 'Bhandup-Mulund', label: 'Good logistics corridor' },
]

const HEAT_BOUNDS = {
  minLat: 18.94,
  maxLat: 19.24,
  minLng: 72.78,
  maxLng: 73.02,
}

function pointToPercent(point) {
  const x = ((point.lng - HEAT_BOUNDS.minLng) / (HEAT_BOUNDS.maxLng - HEAT_BOUNDS.minLng)) * 100
  const y = ((HEAT_BOUNDS.maxLat - point.lat) / (HEAT_BOUNDS.maxLat - HEAT_BOUNDS.minLat)) * 100
  return {
    x: Math.max(0, Math.min(100, x)),
    y: Math.max(0, Math.min(100, y)),
  }
}

function pseudoCoords(index) {
  const baseLat = 19.076
  const baseLng = 72.8777
  const dx = ((index % 5) - 2) * 0.014
  const dy = (Math.floor(index / 5) % 4 - 1.5) * 0.012
  return { lat: +(baseLat + dy).toFixed(6), lng: +(baseLng + dx).toFixed(6) }
}

function normalizeSpace(space, index) {
  const fallback = pseudoCoords(index)
  const lat = Number.parseFloat(space.lat)
  const lng = Number.parseFloat(space.lng)

  const parts = String(space.location || '').split(',').map(part => part.trim()).filter(Boolean)

  return {
    ...space,
    lat: Number.isFinite(lat) ? lat : fallback.lat,
    lng: Number.isFinite(lng) ? lng : fallback.lng,
    image_url: space.image_url || STOCK_IMAGES[index % STOCK_IMAGES.length],
    district: space.district || parts[1] || 'Unknown District',
    state: space.state || 'Maharashtra',
    pincode: space.pincode || '400000',
    roof_type: space.roof_type || 'RCC Flat',
    water_access: typeof space.water_access === 'boolean' ? space.water_access : true,
    electricity_access: typeof space.electricity_access === 'boolean' ? space.electricity_access : true,
    security_rating: Number.isFinite(Number(space.security_rating)) ? Number(space.security_rating) : 4.0,
    soil_depth_cm: Number.isFinite(Number(space.soil_depth_cm)) ? Number(space.soil_depth_cm) : 24,
    rent_inr_month: Number.isFinite(Number(space.rent_inr_month)) ? Number(space.rent_inr_month) : Math.max(1200, Number(space.size_sqft || 60) * 30),
    nearby_market_km: Number.isFinite(Number(space.nearby_market_km)) ? Number(space.nearby_market_km) : 1.5,
    aqi_avg: Number.isFinite(Number(space.aqi_avg)) ? Number(space.aqi_avg) : 88,
    population_density: Number.isFinite(Number(space.population_density)) ? Number(space.population_density) : 18000,
  }
}

function heatClass(value) {
  if (value >= 35) return 'from-red-500 to-orange-400 text-white'
  if (value >= 20) return 'from-amber-500 to-yellow-300 text-gray-900'
  if (value >= 10) return 'from-lime-400 to-green-300 text-gray-900'
  return 'from-emerald-300 to-teal-200 text-gray-900'
}

function toGoogleMapLink(space) {
  const label = encodeURIComponent(`${space.title}, ${space.location}`)
  return `https://www.google.com/maps/search/?api=1&query=${label}`
}

function toDirectionsLink(space) {
  const query = encodeURIComponent(`${space.lat},${space.lng}`)
  return `https://www.google.com/maps/dir/?api=1&destination=${query}`
}

function heatPointStyle(point) {
  const size = Math.max(56, Math.round(point.intensity * 1.05))
  const opacity = Math.min(0.92, Math.max(0.35, point.intensity / 120))
  return {
    width: `${size}px`,
    height: `${size}px`,
    opacity,
  }
}

function heatColor(point) {
  if (point.intensity >= 85) return 'bg-red-500'
  if (point.intensity >= 70) return 'bg-orange-500'
  if (point.intensity >= 55) return 'bg-yellow-400'
  return 'bg-lime-400'
}

export default function Spaces() {
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({
    title: '',
    location: '',
    size_sqft: '',
    sunlight_hours: '',
    lat: '',
    lng: '',
    district: '',
    state: '',
    pincode: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [geoQuery, setGeoQuery] = useState('')
  const [locating, setLocating] = useState(false)
  const [geoStatus, setGeoStatus] = useState('')
  const [dataMode, setDataMode] = useState('live')
  const [viewMode, setViewMode] = useState('list')
  const [selectedSpaceId, setSelectedSpaceId] = useState(null)

  useEffect(() => {
    if (!user) return

    async function load() {
      const { data } = await supabase.from('spaces').select('*').order('created_at', { ascending: false })
      setSpaces(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  async function handleSubmit() {
    if (!form.title || !form.location || !form.size_sqft || !form.sunlight_hours) return
    setSubmitting(true)
    const { data, error } = await supabase.from('spaces').insert({
      owner_id: user.id,
      title: form.title,
      location: form.location,
      size_sqft: parseInt(form.size_sqft),
      sunlight_hours: parseInt(form.sunlight_hours),
      is_available: true
    }).select().single()
    if (!error) {
      setSpaces(prev => [{
        ...data,
        lat: form.lat || undefined,
        lng: form.lng || undefined,
        district: form.district || undefined,
        state: form.state || undefined,
        pincode: form.pincode || undefined,
      }, ...prev])
      setForm({ title: '', location: '', size_sqft: '', sunlight_hours: '', lat: '', lng: '', district: '', state: '', pincode: '' })
      setGeoQuery('')
      setGeoStatus('')
      setShowForm(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSubmitting(false)
  }

  async function handleLocate() {
    const query = (geoQuery || form.location || '').trim()
    if (!query) {
      setGeoStatus('Enter a location name first.')
      return
    }

    setLocating(true)
    setGeoStatus('')

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&q=${encodeURIComponent(query)}`)
      const rows = await res.json()

      if (!Array.isArray(rows) || rows.length === 0) {
        setGeoStatus('Location not found. Try a more specific area/city name.')
        return
      }

      const top = rows[0]
      const addr = top.address || {}
      const district = addr.city_district || addr.suburb || addr.county || ''
      const state = addr.state || ''
      const pincode = addr.postcode || ''

      setForm(prev => ({
        ...prev,
        location: top.display_name || prev.location,
        lat: Number.parseFloat(top.lat).toFixed(6),
        lng: Number.parseFloat(top.lon).toFixed(6),
        district: district || prev.district,
        state: state || prev.state,
        pincode: pincode || prev.pincode,
      }))
      setGeoStatus('Location set from map search.')
    } catch {
      setGeoStatus('Unable to fetch map location right now. Try again.')
    } finally {
      setLocating(false)
    }
  }

  async function toggleAvailability(space) {
    await supabase.from('spaces').update({ is_available: !space.is_available }).eq('id', space.id)
    setSpaces(prev => prev.map(s => s.id === space.id ? { ...s, is_available: !s.is_available } : s))
  }

  const season = getCurrentSeason()
  const liveSpaces = spaces.map((space, index) => normalizeSpace(space, index))
  const displaySpaces = dataMode === 'demo' ? DEMO_SPACES : liveSpaces

  const selectedSpace = displaySpaces.find(space => space.id === selectedSpaceId) || displaySpaces[0] || null

  return (
    <AuthGuard onUser={setUser}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rooftop Spaces</h1>
            <p className="text-gray-500 text-sm mt-1">{displaySpaces.filter(s => s.is_available).length} available · {displaySpaces.length} total listed</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Plus size={16} /> List Your Space
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-700">Data source</p>
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setDataMode('live')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${dataMode === 'live' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
              >
                Live
              </button>
              <button
                onClick={() => setDataMode('demo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${dataMode === 'demo' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
              >
                Demo (Fake)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-700">View</p>
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${viewMode === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
                <List size={12} /> List
              </button>
              <button onClick={() => setViewMode('map')} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${viewMode === 'map' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
                <MapPin size={12} /> Pointer Map
              </button>
              <button onClick={() => setViewMode('heat')} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${viewMode === 'heat' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
                <Flame size={12} /> Heat Map
              </button>
            </div>
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
            <CheckCircle2 size={16} /> Space listed successfully!
          </div>
        )}

        {/* Add Space Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900">List a New Space</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
                <p className="text-xs font-medium text-gray-700 mb-2">Set location by map search</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Type area/city, e.g. Bandra West, Mumbai"
                    value={geoQuery}
                    onChange={e => setGeoQuery(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={handleLocate}
                    disabled={locating}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                  >
                    {locating ? 'Locating...' : 'Set from map'}
                  </button>
                </div>
                {geoStatus && <p className="text-xs text-gray-500 mt-2">{geoStatus}</p>}
              </div>

              {[
                { key: 'title', label: 'Space Title', placeholder: 'e.g. Sunny Terrace, Bandra West' },
                { key: 'location', label: 'Location / Area', placeholder: 'e.g. Bandra West, Mumbai' },
                { key: 'size_sqft', label: 'Size (sqft)', placeholder: 'e.g. 80', type: 'number' },
                { key: 'sunlight_hours', label: 'Daily Sunlight (hours)', placeholder: 'e.g. 6', type: 'number' },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</label>
                  <input
                    type={type || 'text'}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}

              {[
                { key: 'district', label: 'District', placeholder: 'Auto-filled from map search' },
                { key: 'state', label: 'State', placeholder: 'Auto-filled from map search' },
                { key: 'pincode', label: 'Pincode', placeholder: 'Auto-filled from map search' },
                { key: 'lat', label: 'Latitude', placeholder: 'Auto-filled from map search' },
                { key: 'lng', label: 'Longitude', placeholder: 'Auto-filled from map search' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}
            </div>

            {form.lat && form.lng && (
              <div className="mb-4 border border-gray-200 rounded-xl overflow-hidden">
                <iframe
                  title="Selected location preview"
                  src={`https://maps.google.com/maps?q=${form.lat},${form.lng}&z=14&output=embed`}
                  className="w-full h-52 border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}

            {/* Real-time ML preview */}
            {form.size_sqft && form.sunlight_hours && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4">
                <p className="text-xs font-medium text-green-700 mb-2">Yield Prediction for this space:</p>
                {(() => {
                  const yp = predictYield(+form.size_sqft, +form.sunlight_hours, season)
                  return (
                    <p className="text-sm text-green-800">
                      Estimated <strong>{yp.mid} kg/month</strong> ({yp.low}–{yp.high} kg range) in {season}
                    </p>
                  )
                })()}
              </div>
            )}

            <button onClick={handleSubmit} disabled={submitting}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
              {submitting ? 'Listing...' : 'List Space'}
            </button>
          </div>
        )}

        {/* Spaces */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displaySpaces.length === 0 ? (
          <div className="text-center py-16 text-gray-300">
            <MapPin size={40} className="mx-auto mb-3" />
            <p>No spaces yet. Be the first to list one!</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displaySpaces.map(space => {
              const yp = predictYield(space.size_sqft, space.sunlight_hours, season)
              const isOwner = user?.id === space.owner_id
              return (
                <div key={space.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow">
                  <Image src={space.image_url} alt={space.title} width={1200} height={420} className="w-full h-36 object-cover" />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                        <MapPin size={18} className="text-green-600" />
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${space.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {space.is_available ? 'Available' : 'Taken'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{space.title}</h3>
                    <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                      <MapPin size={11} />{space.location}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-400">Space</p>
                        <p className="font-semibold text-gray-800 text-sm">{space.size_sqft} sqft</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-amber-500">Sunlight</p>
                        <p className="font-semibold text-amber-700 text-sm">{space.sunlight_hours}h/day</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="bg-emerald-50 rounded-lg px-2 py-1.5 text-emerald-700 flex items-center justify-center gap-1"><Landmark size={11} /> {space.district}</div>
                      <div className="bg-sky-50 rounded-lg px-2 py-1.5 text-sky-700 text-center">{space.state} · {space.pincode}</div>
                      <div className="bg-gray-50 rounded-lg px-2 py-1.5 text-gray-700 text-center">{space.roof_type}</div>
                      <div className="bg-gray-50 rounded-lg px-2 py-1.5 text-gray-700 text-center">Soil: {space.soil_depth_cm} cm</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="bg-indigo-50 rounded-lg px-2 py-1.5 text-indigo-700 text-center">Rent: INR {space.rent_inr_month}/mo</div>
                      <div className="bg-rose-50 rounded-lg px-2 py-1.5 text-rose-700 text-center">AQI avg: {space.aqi_avg}</div>
                      <div className="bg-cyan-50 rounded-lg px-2 py-1.5 text-cyan-700 flex items-center justify-center gap-1"><Droplets size={11} /> {space.water_access ? 'Water: Yes' : 'Water: No'}</div>
                      <div className="bg-violet-50 rounded-lg px-2 py-1.5 text-violet-700 flex items-center justify-center gap-1"><Zap size={11} /> {space.electricity_access ? 'Power: Yes' : 'Power: No'}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 mb-3 text-center">
                      <p className="text-xs text-green-600 font-medium">ML Yield Estimate</p>
                      <p className="text-sm font-bold text-green-800">{yp.mid} kg/month</p>
                      <p className="text-xs text-green-500">Range: {yp.low}–{yp.high} kg</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button
                        onClick={() => { setSelectedSpaceId(space.id); setViewMode('map') }}
                        className="text-xs border border-gray-200 text-gray-700 hover:bg-gray-50 py-2 rounded-lg transition-colors"
                      >
                        Open Pointer Map
                      </button>
                      <a
                        href={toDirectionsLink(space)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs border border-gray-200 text-gray-700 hover:bg-gray-50 py-2 rounded-lg transition-colors text-center"
                      >
                        Get Directions
                      </a>
                    </div>
                    {isOwner && dataMode === 'live' && (
                      <button onClick={() => toggleAvailability(space)}
                        className="w-full text-xs border border-gray-200 text-gray-600 hover:bg-gray-50 py-2 rounded-lg transition-colors">
                        Mark as {space.is_available ? 'Taken' : 'Available'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : viewMode === 'map' ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-4 space-y-3 max-h-[520px] overflow-auto">
              {displaySpaces.map(space => (
                <button
                  key={space.id}
                  onClick={() => setSelectedSpaceId(space.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-colors ${selectedSpace?.id === space.id ? 'border-green-300 bg-green-50' : 'border-gray-100 hover:bg-gray-50'}`}
                >
                  <p className="font-medium text-sm text-gray-900">{space.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{space.location}</p>
                  <p className="text-xs text-gray-400 mt-1">{space.size_sqft} sqft · {space.sunlight_hours}h sun · {space.district}, {space.state}</p>
                </button>
              ))}
            </div>
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-3">
              {selectedSpace && (
                <>
                  <iframe
                    title="Google pointer map"
                    src={`https://maps.google.com/maps?q=${selectedSpace.lat},${selectedSpace.lng}&z=13&output=embed`}
                    className="w-full h-[460px] rounded-xl border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a href={toGoogleMapLink(selectedSpace)} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Open in Google Maps</a>
                    <a href={toDirectionsLink(selectedSpace)} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Directions</a>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-3">
              <div className="relative h-[500px] rounded-xl overflow-hidden border border-emerald-100">
                <iframe
                  title="OSM heat map base"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${HEAT_BOUNDS.minLng}%2C${HEAT_BOUNDS.minLat}%2C${HEAT_BOUNDS.maxLng}%2C${HEAT_BOUNDS.maxLat}&layer=mapnik`}
                  className="w-full h-full border-0"
                  loading="lazy"
                />

                <div className="absolute inset-0 pointer-events-none">
                  {HEAT_DATASET.map(point => {
                    const pos = pointToPercent(point)
                    return (
                      <div key={point.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
                        <div className={`rounded-full blur-2xl mix-blend-multiply ${heatColor(point)}`} style={heatPointStyle(point)} />
                        <div className={`absolute inset-0 rounded-full blur-md ${heatColor(point)}`} style={heatPointStyle(point)} />
                      </div>
                    )
                  })}
                </div>

                <div className="absolute bottom-3 left-3 bg-white/90 border border-gray-100 rounded-lg p-2 text-xs text-gray-700">
                  <p className="font-medium mb-1">Heatmap dataset: rooftop demand + sunlight viability + waste flow</p>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> High</span>
                    <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> Medium</span>
                    <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" /> Low</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-4 space-y-3 max-h-[520px] overflow-auto">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Layers3 size={14} /> Heat intensity by expected yield
              </div>
              {HEAT_DATASET.map(point => {
                return (
                  <button
                    key={point.id}
                    onClick={() => {
                      const nearest = displaySpaces.reduce((best, current) => {
                        const dBest = Math.abs(best.lat - point.lat) + Math.abs(best.lng - point.lng)
                        const dCurrent = Math.abs(current.lat - point.lat) + Math.abs(current.lng - point.lng)
                        return dCurrent < dBest ? current : best
                      }, displaySpaces[0])
                      setSelectedSpaceId(nearest?.id || null)
                      setViewMode('map')
                    }}
                    className={`w-full text-left p-3 rounded-xl bg-gradient-to-r ${heatClass(point.intensity)} border border-white/40`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{point.zone}</p>
                      <span className="text-xs font-bold">{point.intensity}</span>
                    </div>
                    <p className="text-xs opacity-80 mt-1">{point.label}</p>
                    <p className="text-xs opacity-80 mt-1">Lat {point.lat} · Lng {point.lng}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </main>
      </div>
    </AuthGuard>
  )
}