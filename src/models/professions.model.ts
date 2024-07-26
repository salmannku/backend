import mongoose from "mongoose";

const professionSchema: any = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    value: {
      type: String,
    },
  },
  { timestamps: true }
);

const Profession = mongoose.model("professions", professionSchema);

export default Profession;