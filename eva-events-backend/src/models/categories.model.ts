import { string } from 'joi'
import mongoose, { Types } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import { CommonEnums } from '../enums/common.enums'

export interface categoryModelSchema {
  _id: Types.ObjectId
  category_name: string
  description: string
  status: string
}

const categorySchena: any = new mongoose.Schema<categoryModelSchema>({
  category_name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: false,
    trim: true,
  },
  status: {
    type: String,
    enum: [CommonEnums.status.ACTIVE, CommonEnums.status.DEACTIVE],
    default: CommonEnums.status.ACTIVE,
  },
})

categorySchena.plugin(mongoosePaginate)

const CategoriesModel = mongoose.model<categoryModelSchema>(
  'categories_industries',
  categorySchena
)

export default CategoriesModel
