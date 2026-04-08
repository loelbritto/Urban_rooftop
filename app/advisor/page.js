'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import AuthGuard from '@/components/AuthGuard'
import { recommendCrops, getCurrentSeason, CROPS } from '@/lib/cropdata'
import { predictYield } from '@/lib/mlEngine'
import { Sprout, Sun, Maximize2, Zap, Clock, TrendingUp, ChevronDown } from 'lucide-react'

const SEASONS = ['spring', 'summer', 'autumn', 'winter']
const DIFFICULTIES = { easy: { label: 'Easy', color: 'bg-green-100 text-green-700' }, medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700' }, hard: { label: 'Hard', color: 'bg-red-100 text-red-700' } }
const MATCH_COLORS = { excellent: 'border-green-300 bg-green-50', good: 'border-amber-200 bg-amber-50', fair: 'border-gray-200 bg-gray-50' }

export default function Advisor() {
  const [sunlight, setSunlight] = useState(6)
  const [space, setSpace] = useState(20)
  const [season, setSeason] = useState(getCurrentSeason())
  const [results, setResults] = useState([])
  const [yieldPrediction, setYieldPrediction] = useState(null)
  const [hasRun, setHasRun] = useState(false)
  const [filter, setFilter] = useState('all')
  const [expandedCrop, setExpandedCrop] = useState(null)

  function runAdvisor() {
    const recs = recommendCrops(sunlight, space, season)
    const yp = predictYield(space, sunlight, season)
    setResults(recs)
    setYieldPrediction(yp)
    setHasRun(true)
  }

  const tagOptions = ['all', 'beginner', 'quick', 'indian', 'herb', 'leafy', 'fruit', 'medicinal', 'container']
  const filtered = filter === 'all' ? results : results.filter(c => c.tags?.includes(filter))

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">AI Crop Advisor</h1>
          <p className="text-gray-500 text-sm mt-1">
            ML-powered recommendations from a dataset of 40 crops. Tuned for Indian urban rooftops.
          </p>
        </div>

        {/* Input Panel */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <Sun size={15} className="text-amber-500" />
                Daily Sunlight: <span className="text-amber-600 font-bold">{sunlight} hrs</span>
              </label>
              <input type="range" min={1} max={10} value={sunlight} onChange={e => setSunlight(+e.target.value)}
                className="w-full accent-amber-500" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1h (shaded)</span><span>10h (full sun)</span>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <Maximize2 size={15} className="text-blue-500" />
                Rooftop Space: <span className="text-blue-600 font-bold">{space} sqft</span>
              </label>
              <input type="range" min={2} max={200} step={2} value={space} onChange={e => setSpace(+e.target.value)}
                className="w-full accent-blue-500" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>2 sqft</span><span>200 sqft</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">Season</label>
              <div className="grid grid-cols-2 gap-2">
                {SEASONS.map(s => (
                  <button key={s} onClick={() => setSeason(s)}
                    className={`py-2 px-3 rounded-xl text-sm capitalize font-medium border transition-all ${season === s ? 'bg-green-700 text-white border-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={runAdvisor}
            className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
            <Zap size={16} />
            Run Crop Advisor
          </button>
        </div>

        {hasRun && yieldPrediction && (
          <>
            {/* Yield Prediction */}
            <div className="bg-gradient-to-r from-green-700 to-emerald-700 rounded-2xl p-6 mb-6 text-white">
              <p className="text-green-200 text-sm mb-2 font-medium">Yield Prediction Model</p>
              <div className="flex items-end gap-4 mb-4">
                <div>
                  <p className="text-4xl font-bold">{yieldPrediction.mid} kg</p>
                  <p className="text-green-200 text-sm">expected monthly harvest</p>
                </div>
                <div className="text-green-300 text-sm pb-1">
                  Range: {yieldPrediction.low}–{yieldPrediction.high} kg/month
                </div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-white rounded-full h-2" style={{ width: `${Math.min((yieldPrediction.mid / yieldPrediction.high) * 100, 100)}%` }} />
              </div>
              <p className="text-green-200 text-xs mt-2">
                {yieldPrediction.perSqft} kg/sqft · {space} sqft space · {sunlight}h sunlight · {season} season
              </p>
            </div>

            {/* Results */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-gray-900">{results.length} crops recommended</h2>
                  <p className="text-gray-400 text-xs mt-0.5">Ranked by compatibility score</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  {tagOptions.map(t => (
                    <button key={t} onClick={() => setFilter(t)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all ${filter === t ? 'bg-green-700 text-white border-green-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtered.map(crop => (
                  <div key={crop.name}
                    className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-sm ${MATCH_COLORS[crop.match]}`}
                    onClick={() => setExpandedCrop(expandedCrop === crop.name ? null : crop.name)}>

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Sprout size={14} className="text-green-600 shrink-0" />
                          <p className="font-semibold text-gray-900 text-sm">{crop.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTIES[crop.difficulty].color}`}>
                            {DIFFICULTIES[crop.difficulty].label}
                          </span>
                        </div>
                        <div className="flex gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><TrendingUp size={11} />{crop.estimatedYield} kg total</span>
                          <span className="flex items-center gap-1"><Clock size={11} />{crop.daysToHarvest}d</span>
                          <span className="text-green-600 font-medium">Score: {crop.score}</span>
                        </div>
                      </div>
                      <ChevronDown size={14} className={`text-gray-400 mt-1 transition-transform shrink-0 ${expandedCrop === crop.name ? 'rotate-180' : ''}`} />
                    </div>

                    {expandedCrop === crop.name && (
                      <div className="mt-3 pt-3 border-t border-white/60 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white/60 rounded-lg p-2">
                          <p className="text-gray-400">Space needed</p>
                          <p className="font-medium">{crop.minSqft} sqft min</p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-2">
                          <p className="text-gray-400">Monthly yield</p>
                          <p className="font-medium">{crop.monthlyYield} kg/month</p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-2">
                          <p className="text-gray-400">Sunlight needed</p>
                          <p className="font-medium">{crop.minSun}–{crop.maxSun}h/day</p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-2">
                          <p className="text-gray-400">Best seasons</p>
                          <p className="font-medium capitalize">{crop.season.join(', ')}</p>
                        </div>
                        <div className="col-span-2 bg-white/60 rounded-lg p-2">
                          <p className="text-gray-400 mb-1">Tags</p>
                          <div className="flex gap-1 flex-wrap">
                            {crop.tags?.map(t => (
                              <span key={t} className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">No crops match this filter. Try all.</p>
                </div>
              )}
            </div>
          </>
        )}

        {!hasRun && (
          <div className="text-center py-16 text-gray-300">
            <Sprout size={40} className="mx-auto mb-3" />
            <p className="text-sm">Set your rooftop parameters above and click Run</p>
          </div>
        )}
      </main>
      </div>
    </AuthGuard>
  )
}