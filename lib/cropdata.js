// 40-crop dataset with real growing parameters
export const CROPS = [
  { name: 'Spinach', season: ['winter','spring'], minSun: 3, maxSun: 6, minSqft: 4, difficulty: 'easy', daysToHarvest: 40, yieldPerSqft: 0.3, tags: ['leafy','quick','beginner'] },
  { name: 'Methi (Fenugreek)', season: ['winter','spring'], minSun: 4, maxSun: 7, minSqft: 2, difficulty: 'easy', daysToHarvest: 25, yieldPerSqft: 0.25, tags: ['leafy','quick','indian'] },
  { name: 'Coriander', season: ['winter','spring','autumn'], minSun: 4, maxSun: 7, minSqft: 2, difficulty: 'easy', daysToHarvest: 21, yieldPerSqft: 0.2, tags: ['herb','quick','indian'] },
  { name: 'Mint', season: ['all'], minSun: 3, maxSun: 8, minSqft: 2, difficulty: 'easy', daysToHarvest: 30, yieldPerSqft: 0.3, tags: ['herb','perennial','beginner'] },
  { name: 'Tomato', season: ['summer','spring'], minSun: 6, maxSun: 10, minSqft: 6, difficulty: 'medium', daysToHarvest: 75, yieldPerSqft: 1.5, tags: ['fruit','popular','indian'] },
  { name: 'Chilli', season: ['summer','spring'], minSun: 6, maxSun: 10, minSqft: 4, difficulty: 'medium', daysToHarvest: 90, yieldPerSqft: 0.8, tags: ['spice','indian','container'] },
  { name: 'Brinjal (Eggplant)', season: ['summer'], minSun: 6, maxSun: 10, minSqft: 6, difficulty: 'medium', daysToHarvest: 80, yieldPerSqft: 1.2, tags: ['vegetable','indian'] },
  { name: 'Okra (Bhindi)', season: ['summer'], minSun: 7, maxSun: 10, minSqft: 4, difficulty: 'medium', daysToHarvest: 55, yieldPerSqft: 1.0, tags: ['vegetable','indian','quick'] },
  { name: 'Bottle Gourd', season: ['summer'], minSun: 7, maxSun: 10, minSqft: 12, difficulty: 'hard', daysToHarvest: 60, yieldPerSqft: 2.0, tags: ['gourd','indian','large'] },
  { name: 'Cucumber', season: ['summer','spring'], minSun: 6, maxSun: 9, minSqft: 8, difficulty: 'medium', daysToHarvest: 55, yieldPerSqft: 1.4, tags: ['vegetable','popular'] },
  { name: 'Beans', season: ['spring','autumn'], minSun: 5, maxSun: 8, minSqft: 4, difficulty: 'easy', daysToHarvest: 60, yieldPerSqft: 0.7, tags: ['legume','easy'] },
  { name: 'Peas', season: ['winter','spring'], minSun: 5, maxSun: 8, minSqft: 4, difficulty: 'easy', daysToHarvest: 60, yieldPerSqft: 0.5, tags: ['legume','easy','indian'] },
  { name: 'Radish', season: ['winter','autumn'], minSun: 4, maxSun: 7, minSqft: 2, difficulty: 'easy', daysToHarvest: 28, yieldPerSqft: 0.6, tags: ['root','quick','beginner'] },
  { name: 'Carrot', season: ['winter','autumn'], minSun: 5, maxSun: 8, minSqft: 4, difficulty: 'medium', daysToHarvest: 75, yieldPerSqft: 0.9, tags: ['root','popular'] },
  { name: 'Lettuce', season: ['winter','spring','autumn'], minSun: 3, maxSun: 6, minSqft: 3, difficulty: 'easy', daysToHarvest: 45, yieldPerSqft: 0.35, tags: ['leafy','quick','beginner'] },
  { name: 'Cabbage', season: ['winter','autumn'], minSun: 5, maxSun: 8, minSqft: 6, difficulty: 'medium', daysToHarvest: 90, yieldPerSqft: 1.5, tags: ['vegetable','indian'] },
  { name: 'Cauliflower', season: ['winter'], minSun: 5, maxSun: 8, minSqft: 8, difficulty: 'hard', daysToHarvest: 100, yieldPerSqft: 1.2, tags: ['vegetable','indian'] },
  { name: 'Palak (Swiss Chard)', season: ['winter','spring'], minSun: 4, maxSun: 7, minSqft: 3, difficulty: 'easy', daysToHarvest: 50, yieldPerSqft: 0.4, tags: ['leafy','indian'] },
  { name: 'Curry Leaf', season: ['all'], minSun: 5, maxSun: 9, minSqft: 4, difficulty: 'easy', daysToHarvest: 180, yieldPerSqft: 0.15, tags: ['herb','perennial','indian'] },
  { name: 'Tulsi (Holy Basil)', season: ['all'], minSun: 5, maxSun: 9, minSqft: 2, difficulty: 'easy', daysToHarvest: 60, yieldPerSqft: 0.2, tags: ['herb','indian','medicinal'] },
  { name: 'Aloe Vera', season: ['all'], minSun: 4, maxSun: 9, minSqft: 2, difficulty: 'easy', daysToHarvest: 365, yieldPerSqft: 0.5, tags: ['medicinal','perennial','beginner'] },
  { name: 'Lemon Grass', season: ['all'], minSun: 5, maxSun: 9, minSqft: 3, difficulty: 'easy', daysToHarvest: 90, yieldPerSqft: 0.3, tags: ['herb','perennial'] },
  { name: 'Bitter Gourd (Karela)', season: ['summer'], minSun: 7, maxSun: 10, minSqft: 10, difficulty: 'medium', daysToHarvest: 65, yieldPerSqft: 1.0, tags: ['gourd','indian'] },
  { name: 'Ridge Gourd', season: ['summer'], minSun: 7, maxSun: 10, minSqft: 10, difficulty: 'medium', daysToHarvest: 60, yieldPerSqft: 1.2, tags: ['gourd','indian'] },
  { name: 'Sweet Potato (leaves)', season: ['summer','spring'], minSun: 5, maxSun: 9, minSqft: 6, difficulty: 'easy', daysToHarvest: 120, yieldPerSqft: 0.8, tags: ['root','leafy'] },
  { name: 'Garlic', season: ['winter'], minSun: 5, maxSun: 8, minSqft: 2, difficulty: 'medium', daysToHarvest: 150, yieldPerSqft: 0.4, tags: ['bulb','indian'] },
  { name: 'Spring Onion', season: ['winter','spring','autumn'], minSun: 4, maxSun: 7, minSqft: 2, difficulty: 'easy', daysToHarvest: 35, yieldPerSqft: 0.3, tags: ['allium','quick','beginner'] },
  { name: 'Strawberry', season: ['winter','spring'], minSun: 6, maxSun: 9, minSqft: 4, difficulty: 'medium', daysToHarvest: 90, yieldPerSqft: 0.5, tags: ['fruit','popular','container'] },
  { name: 'Papaya', season: ['summer','spring'], minSun: 8, maxSun: 10, minSqft: 15, difficulty: 'hard', daysToHarvest: 300, yieldPerSqft: 3.0, tags: ['fruit','indian','large'] },
  { name: 'Banana (dwarf)', season: ['summer'], minSun: 8, maxSun: 10, minSqft: 20, difficulty: 'hard', daysToHarvest: 365, yieldPerSqft: 2.5, tags: ['fruit','indian','large'] },
  { name: 'Drumstick (Moringa)', season: ['all'], minSun: 7, maxSun: 10, minSqft: 12, difficulty: 'medium', daysToHarvest: 270, yieldPerSqft: 1.5, tags: ['tree','indian','superfood'] },
  { name: 'Lemon (potted)', season: ['all'], minSun: 7, maxSun: 10, minSqft: 8, difficulty: 'medium', daysToHarvest: 365, yieldPerSqft: 1.0, tags: ['citrus','perennial','container'] },
  { name: 'Amaranth (Rajgira)', season: ['summer'], minSun: 6, maxSun: 10, minSqft: 3, difficulty: 'easy', daysToHarvest: 30, yieldPerSqft: 0.35, tags: ['leafy','grain','quick'] },
  { name: 'Mustard Greens (Sarson)', season: ['winter'], minSun: 5, maxSun: 8, minSqft: 4, difficulty: 'easy', daysToHarvest: 45, yieldPerSqft: 0.5, tags: ['leafy','indian','oilseed'] },
  { name: 'Taro (Arbi)', season: ['summer'], minSun: 5, maxSun: 8, minSqft: 6, difficulty: 'medium', daysToHarvest: 180, yieldPerSqft: 1.2, tags: ['root','indian'] },
  { name: 'Ashwagandha', season: ['summer','spring'], minSun: 6, maxSun: 9, minSqft: 4, difficulty: 'medium', daysToHarvest: 180, yieldPerSqft: 0.3, tags: ['medicinal','indian','herb'] },
  { name: 'Pumpkin', season: ['summer'], minSun: 7, maxSun: 10, minSqft: 20, difficulty: 'medium', daysToHarvest: 100, yieldPerSqft: 3.0, tags: ['gourd','popular','large'] },
  { name: 'Sunflower (edible)', season: ['summer','spring'], minSun: 8, maxSun: 10, minSqft: 4, difficulty: 'easy', daysToHarvest: 80, yieldPerSqft: 0.2, tags: ['flower','edible','seed'] },
  { name: 'Kale', season: ['winter','spring','autumn'], minSun: 4, maxSun: 8, minSqft: 3, difficulty: 'easy', daysToHarvest: 55, yieldPerSqft: 0.45, tags: ['leafy','superfood','beginner'] },
  { name: 'Ginger', season: ['spring','summer'], minSun: 4, maxSun: 7, minSqft: 4, difficulty: 'hard', daysToHarvest: 270, yieldPerSqft: 0.8, tags: ['root','indian','spice'] },
]

export function getCurrentSeason() {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 9) return 'summer'
  if (month >= 10 && month <= 11) return 'autumn'
  return 'winter'
}

export function recommendCrops(sunlightHours, spaceSqft, season = null, maxResults = 8) {
  const currentSeason = season || getCurrentSeason()

  return CROPS
    .map(crop => {
      let score = 0
      const seasonMatch = crop.season.includes(currentSeason) || crop.season.includes('all')
      const sunMatch = sunlightHours >= crop.minSun && sunlightHours <= crop.maxSun
      const spaceMatch = spaceSqft >= crop.minSqft

      if (!seasonMatch) return null
      if (!spaceMatch) return null

      score += sunMatch ? 40 : (sunlightHours >= crop.minSun ? 20 : 0)
      if (score === 0 && !sunMatch) return null

      // yield score
      const potentialYield = spaceSqft * crop.yieldPerSqft
      score += Math.min(potentialYield * 5, 30)

      // difficulty bonus
      if (crop.difficulty === 'easy') score += 15
      else if (crop.difficulty === 'medium') score += 8

      // quick harvest bonus
      if (crop.daysToHarvest <= 45) score += 15
      else if (crop.daysToHarvest <= 90) score += 8

      return {
        ...crop,
        score: Math.round(score),
        estimatedYield: parseFloat((spaceSqft * crop.yieldPerSqft).toFixed(1)),
        monthlyYield: parseFloat((spaceSqft * crop.yieldPerSqft / (crop.daysToHarvest / 30)).toFixed(2)),
        match: score >= 70 ? 'excellent' : score >= 50 ? 'good' : 'fair',
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
}