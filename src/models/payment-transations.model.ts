import mongoose from "mongoose";
import User from "./users.model";

const paymentTransationSchema = new mongoose.Schema(
  {
    product_id: {
      type: String,
    },
    price_id: {
      type: String,
    },
    customer_id: {
      type: String,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
    },
    amount: {
      type: String,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("payment_transactions", paymentTransationSchema);

export default Payment;
