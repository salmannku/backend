import mongoose from 'mongoose'
import {
  MyloCreditTransactionTypes,
  MyloCreditTransactionFlows,
} from '../utils/enums'

let myloCreditsHistoryModal: any = new mongoose.Schema(
  {
    // We can store the reference of user from whose account credits is being debited/credited
    user: {
      type: mongoose.Schema.Types.ObjectId,
    },

    // Entity here is reference of the record, for which the transaction is done
    // can be Object id for Question record,
    // can be Object id or any other data record from database as well
    entity: {
      type: mongoose.Schema.Types.ObjectId,
    },
    transaction_mylo_credits: {
      type: String,
    },
    available_mylo_credits: {
      type: String,
    },
    transaction_type: {
      type: String,
      enum: [
        MyloCreditTransactionTypes.CREDITED,
        MyloCreditTransactionTypes.DEBITED,
      ],
    },
    transaction_flow: {
      type: String,
      enum: [
        MyloCreditTransactionFlows.QUESTION,
        MyloCreditTransactionFlows.PAYMENT,
        MyloCreditTransactionFlows.REFFERRAL,
      ],
    },

    // As a metadata here we can pass any valid string of json object
    metadata: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

const MyloCreditsHistoryModal = mongoose.model(
  'mylo_credits_history',
  myloCreditsHistoryModal
)

export default MyloCreditsHistoryModal
