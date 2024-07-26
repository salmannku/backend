import mongoose from 'mongoose'
import { LedgerTransactionType } from '../utils/enums'


const ledgerEntrySchema = new mongoose.Schema({
  time: {
    type: Date,
    required: true
  },

  from: {
    type: String,
    required: true
  },

  to: {
    type: String,
    required: true
  },

  type: {
    type: String,
    required: true,
    enum: Object.values(LedgerTransactionType)
  },

  amount: {
    type: Number,
    required: true,
    set: (x: number) => Math.round((x + Number.EPSILON) * 100) / 100
  },

  balFrom: {
    type: Number,
    required: true,
    set: (x: number) => Math.round((x + Number.EPSILON) * 100) / 100
  },

  balTo: {
    type: Number,
    required: true,
    set: (x: number) => Math.round((x + Number.EPSILON) * 100) / 100
  },

  vf: {
    type: Number,
    required: true,
    default: 0
  },

  vt: {
    type: Number,
    required: true,
    default: 0
  },

  ref: {
    type: Object
  }
})


const Ledger = mongoose.model('ledger', ledgerEntrySchema)

export default Ledger
