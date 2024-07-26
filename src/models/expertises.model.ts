import mongoose from "mongoose";
import Expert from "./experts.model";

const expertiseSchema: any = new mongoose.Schema(
  {
    expertise: {
      type: String,
    },
    value: {
      type: String,
    },
    usage_count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Expertise = mongoose.model("expertise", expertiseSchema);

export default Expertise;
