const mongoose = require('mongoose')
import Category from '../models/categories.model'

const categories = [
  {
    name: 'economics',
  },
  {
    name: 'film-and-tv',
  },
  {
    name: 'science',
  },
  {
    name: 'religion',
  },
  {
    name: 'sports',
  },
  {
    name: 'agriculture',
  },
  {
    name: 'history',
  },
  {
    name: 'literature',
  },
  {
    name: 'business',
  },
  {
    name: 'industry',
  },
  {
    name: 'politics',
  },
  {
    name: 'computer-science',
  },
  {
    name: 'math',
  },
  {
    name: 'medicine',
  },
]

categories.forEach((obj: any) => {
  obj.value = obj.name
    .replace(/[^\w\s]/gi, '_')
    .replace(/\s+/g, '_')
    .toLowerCase()
})

mongoose.connect('Database string here', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

;(async () => {
  try {
    await Category.insertMany(categories)
    console.log('Data successfully seeded')
  } catch (err) {
    console.error('Error seeding data', err)
  } finally {
    mongoose.connection.close()
  }
})()
