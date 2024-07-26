import mongoose from "mongoose";

const featuredQuestionSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Questions",
    default: null,
  },
  interest: {
    type: Number,
    required: true,
  },
});

const FeaturedQuestion = mongoose.model(
  "featured_question",
  featuredQuestionSchema
);

export default FeaturedQuestion;
