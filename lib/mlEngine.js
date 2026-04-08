export function predictYield(sqft, sunlightHours, season) {
  const safeSqft = Math.max(Number(sqft) || 0, 1)
  const safeSunlightHours = Math.max(Number(sunlightHours) || 0, 0)
  const seasonMultipliers = { summer: 1.3, spring: 1.1, autumn: 0.9, winter: 0.75 }
  const sunEfficiency = Math.min(safeSunlightHours / 8, 1.0)
  const base = safeSqft * 0.4 * sunEfficiency * (seasonMultipliers[season] || 1.0)
  const low = parseFloat((base * 0.75).toFixed(1))
  const mid = parseFloat(base.toFixed(1))
  const high = parseFloat((base * 1.35).toFixed(1))
  return { low, mid, high, perSqft: parseFloat((base / safeSqft).toFixed(2)) }
}

export function calcGreenScore(stats) {
  const food = Math.min((stats.food_grown_kg || 0) * 10, 300)
  const compost = Math.min((stats.waste_composted_kg || 0) * 5, 150)
  const co2 = Math.min((stats.co2_saved_kg || 0) * 3, 100)
  const total = Math.round(food + compost + co2)

  let tier, color, nextTier, needed
  if (total >= 800) { tier = 'Legend'; color = 'purple'; nextTier = null; needed = 0 }
  else if (total >= 500) { tier = 'Champion'; color = 'blue'; nextTier = 'Legend'; needed = 800 - total }
  else if (total >= 250) { tier = 'Grower'; color = 'green'; nextTier = 'Champion'; needed = 500 - total }
  else if (total >= 100) { tier = 'Sprout'; color = 'amber'; nextTier = 'Grower'; needed = 250 - total }
  else { tier = 'Seedling'; color = 'gray'; nextTier = 'Sprout'; needed = 100 - total }

  return { total, tier, color, nextTier, needed, breakdown: { food: Math.round(food), compost: Math.round(compost), co2: Math.round(co2) } }
}

export function clusterCompostPickups(pickups) {
  const clusters = {}
  pickups.forEach(p => {
    const key = (p.address || '').split(',').slice(-2).join(',').trim() || 'Other'
    if (!clusters[key]) clusters[key] = []
    clusters[key].push(p)
  })
  return Object.entries(clusters)
    .map(([area, items]) => ({
      area,
      count: items.length,
      totalWaste: parseFloat(items.reduce((s, i) => s + (i.waste_kg || 0), 0).toFixed(1)),
      efficiency: parseFloat((items.reduce((s, i) => s + (i.waste_kg || 0), 0) / items.length).toFixed(1)),
      items,
    }))
    .sort((a, b) => b.totalWaste - a.totalWaste)
}