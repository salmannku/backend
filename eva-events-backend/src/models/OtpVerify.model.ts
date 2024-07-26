import mongoose from "mongoose";
import User from "./users.model";
import Expert from "./experts.model";

const otpSchema: any = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
    },
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Expert,
    },
    otp: {
      type: Number,
    },
    expire_at: { type: Date, default: Date.now, expires: 300 },
  },
  { timestamps: true }
);

const Otp = mongoose.model("otp", otpSchema);

export default Otp;
