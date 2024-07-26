import CountriesModel from '../models/countries.model'
import { FileLocationEnums } from '../utils/files.enums'

const fs = require('fs').promises

export class DatabaseSeeders {
  static addCountries = async () => {
    try {
      const countriesFromDb = await CountriesModel.find({})

      if (countriesFromDb.length) return

      const placesFile = await fs.readFile(FileLocationEnums.placesFile)

      const countries: any[] = []

      const reference: any[] = []

      const places = JSON.parse(placesFile.toString())

      places.forEach((place: any) => {
        if (!reference.includes(place.country_code)) {
          countries.push({
            country_name: place.country_name,
            country_code: place.country_code,
          })

          reference.push(place.country_code)
        }
        return
      })

      await CountriesModel.insertMany(countries)
    } catch (err) {
      console.log('Something went wrong')
      console.log('While feeding countries to the database')
    }
  }
}
