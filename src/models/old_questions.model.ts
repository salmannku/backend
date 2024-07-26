import { boolean } from "joi";
import mongoose, { InferSchemaType } from "mongoose";
import Attachment from "./attachments.model";
import { QuestionStatus } from "../utils/enums";

const oldQuestionSchema = new mongoose.Schema(
  {
    question_code: {
      type: String,
      default: null,
    },
    question_text: {
      type: String,
      default: null,
    },

    solution: {
      type: String,
      default: null,
    },
    posted_by: {
      type: String,
      default: null,
    },
    expert_code: {
      type: String,
      default: null,
    },
    no_of_views: {
      type: Number,
      default: null,
    },
    question_attachment: {
      type: String,
      default: null,
    },
    solution_attachment: {
      type: String,
      default: null,
    },
    posted: {
      type: String,
      default: null,
    },
    hide: {
      type: String,
      default: null,
    },
    attachment_path: {
      type: String,
      default: null,
    },
    attachment_type: {
      type: String,
      default: null,
    },
    answer_attachment_path: {
      type: String,
      default: null,
    },
    answer_attachment_type: {
      type: String,
      default: null,
    },
    equation_html: {
      type: String,
      default: null,
    },
    date: {
      type: String,
      default: null,
    },
    topic: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

type QuestionType = InferSchemaType<typeof oldQuestionSchema>;

const OldQuestions = mongoose.model("old_questions", oldQuestionSchema);

export default OldQuestions;
