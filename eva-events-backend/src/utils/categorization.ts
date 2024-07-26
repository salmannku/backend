import axios from 'axios'

const indexMap = [
  'agriculture',
  'biology',
  'business',
  'chemistry',
  'economics',
  'history',
  'mathematics',
  'medicine',
  'philosophy',
  'physics',
  'politics',
  'religion',
  'sports',
]
// let apiEndpoint: string | undefined

// if (process.env.NODE_ENV == 'production') {
//   apiEndpoint = process.env.CATEGORIZE_URL_PRODUCTION
// }

// if (process.env.NODE_ENV == 'development') {
//   apiEndpoint = process.env.CATEGORIZE_URL_DEVELOPMENT
// }
// const inferCategories = (array: number[]): string[] => {
//   const candidates = []

//   // push maximum
//   candidates.push(array.indexOf(Math.max(...array)))

//   // also add categories > 75%
//   array.map((x, i) => {
//     if (x > 0.75) candidates.push(i)
//   })

//   // remove duplicates and return category
//   return [...new Set(candidates)].map((x) => indexMap[x])
// }

const categorizeQuestion = async (questions: string[]) => {
  // input: array of questions to be categorized
  // output: array of categories

  const request = await axios.post('http://44.198.113.69:6001/v1/classify', {
    text: questions[0],
  })
  const categories = request.data
  if (!request.data) throw 'Unable to categorize question'

  return categories
}

export default categorizeQuestion
