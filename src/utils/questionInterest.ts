import {calculateUniqueness} from './termDictionary'

const INTEREST_COMBINATION: Array<{ quantity: string, weight: number, method: 'add' | 'mul' }> = [
  {quantity: 'views', weight: 1, method: 'add'},
  {quantity: 'search', weight: 1, method: 'add'},
  {quantity: 'uniqueness', weight: 0.5, method: 'mul'},
]

export function hackerNewsDecay(votes: number, submissionDate: Date, gravity: number = 1.2) {
  // Computes the hacker news decay score.
  // Decays at a slow exponential rate.

  // https://medium.com/hacking-and-gonzo/1d9b0cf2c08d

  let hourAge = (Date.now() - submissionDate.getTime()) / (3600000)
  return (votes) / Math.pow(hourAge + 2, gravity)
}

export function redditHotDecay(votes: number, submissionDate: Date, decay: number = 45000) {
  // Computes the reddit hot decay score.
  // Logarithmic, tries to favour newer submissions.

  // https://medium.com/hacking-and-gonzo/how-reddit-ranking-algorithms-work-ef111e33d0d9
  // https://github.com/reddit-archive/reddit/blob/bd922104b971a5c6794b199f364a06fdf61359a2/r2/r2/lib/db/_sorts.pyx#L47-L58

  let order = Math.log10(votes)
  let secAge = (Date.now() - submissionDate.getTime()) / (1000)
  return order - secAge / decay
}

export function trendingDecayMultiplier(previousScore: number, previousUpdate: Date, halfLife: number = 365) {
  return Math.pow(0.5, ((Date.now() - previousUpdate.getTime()) / 86400000) / halfLife)
}

export function trendingDecayUpdate(previousScore: number, previousUpdate: Date, halfLife: number = 365) {
  // Pretty much emulates radioactive decay for every single vote.
  // Half Life is in days.

  // https://meta.stackoverflow.com/questions/418766/results-of-the-trending-sort-experiment
  // Prevents https://meta.stackexchange.com/questions/9731/fastest-gun-in-the-west-problem

  return previousScore * trendingDecayMultiplier(previousScore, previousUpdate, halfLife)
}

export function trendingDecayIncrement(previousScore: number, previousUpdate: Date, halfLife: number = 365) {
  // Updates score when new vote is made.
  return trendingDecayUpdate(previousScore, previousUpdate, halfLife) + 1
}

export function interestCombinator(quantities: { [key: string]: number }) {
  let value = 1

  for (const combo of INTEREST_COMBINATION) {
    let comboValue = quantities[combo.quantity]
    if (comboValue === undefined) continue
    if (combo.method === 'add') value += comboValue
    else if (combo.method === 'mul') value *= comboValue
  }

  return value
}

export interface question {
  question?: string,
  views: number,
  decayedViews: number,
  decayedAt: Date,
  searchHits: number,
  uniqueness?: number
}

export async function calculateInterest(question: question): Promise<number> {
  if (question.question !== undefined) {
    const parameters = {
      views: question.decayedViews,
      search: question.searchHits,
      uniqueness: await calculateUniqueness(question.question, false)
    }

    return interestCombinator(parameters)
  }

  return 0
}

