import mongoose from "mongoose";

const expertProfileSchema = new mongoose.Schema(
  {
    title:{
      type:String,
    },
    title_format:{
      type:String,
    },
    summary:{
      type:String,
    },
  },
  { timestamps: true }
);

const ExpertProfile = mongoose.model("expert_profile_imformations", expertProfileSchema);

export default ExpertProfile;
