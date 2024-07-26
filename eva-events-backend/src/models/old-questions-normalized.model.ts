import { boolean, string } from "joi";
import mongoose, { InferSchemaType } from "mongoose";
import Attachment from "./attachments.model";
import { QuestionStatus, RecordType } from "../utils/enums";

const oldQuestionsNormalized = new mongoose.Schema(
  {
    question: {
      type: String,
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    experts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "experts",
      },
    ],
    question_id: {
      type: String,
      default: null,
    },
    topic: {
      type: String,
      default: null,
    },
    attachments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Attachment,
        default: null,
      },
    ],
    answered_by: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "experts",
        default: null,
      },
    ],
    answers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "answers",
      },
    ],

    // keep categories as string for now,
    // this is a breaking change that needs to be
    // done gradually

    category: [
      {
        type: String,
        default: null,
      },
    ],
    equation: {
      type: String,
      default: null,
    },
    code_snippet: {
      type: String,
      default: null,
    },
    comment: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: null,
      enum: [
        QuestionStatus.DRAFT,
        QuestionStatus.FINALIZED,
        QuestionStatus.PENDING,
        QuestionStatus.ACCEPTED,
        QuestionStatus.ACTIVE,
      ],
    },
    record_type: {
      type: String,
      enum: [RecordType.OLD, RecordType.NEW],
    },
    is_publish: {
      type: Boolean,
      default: false,
    },
    // analytics

    views: {
      type: Number,
      default: 0,
      min: [0, "Views cannot be negative"],
      required: [true, "Views are required"],
    },

    searchHits: {
      type: Number,
      default: 0,
      min: [0, "Search hits cannot be negative"],
      required: [true, "Search hits are required"],
    },

    decayedViews: {
      type: Number,
      default: 0,
      min: [0, "Decayed views cannot be negative"],
      required: [true, "Decayed views are required"],
    },

    decayedAt: {
      type: Date,
      default: Date.now,
      required: [true, "Decayed at date is required"],
    },

    // admin
    tags: {
      type: [String],
    },
  },
  { timestamps: true }
);

type QuestionType = InferSchemaType<typeof oldQuestionsNormalized>;

oldQuestionsNormalized.index({ question: "text" });

const OldQuestionNormalized = mongoose.model(
  "old_questions_normalized",
  oldQuestionsNormalized
);

export default OldQuestionNormalized;
export { QuestionType, oldQuestionsNormalized };
