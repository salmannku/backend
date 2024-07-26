import mongoose from "mongoose";
import User from "./users.model";

const paymentMethodSchema = new mongoose.Schema(
  {
    payment_type: {
      type: String,
    },
    card_number: {
      type: String,
    },
    card_expiry_month: {
      type: String,
    },
    card_expiry_year: {
      type: String,
    },
    card_cvv: {
      type: String,
    },
    card_name: {
      type: String,
    },
    customer_id: {
      type: String,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
    },
  },
  { timestamps: true }
);

const PaymentMethod = mongoose.model("payment_methods", paymentMethodSchema);

export default PaymentMethod;
