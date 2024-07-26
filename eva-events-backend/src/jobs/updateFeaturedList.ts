import Agenda from "agenda";
import Question from "../models/questions.model";
import { calculateInterest } from "../utils/questionInterest";
import FeaturedQuestion from "../models/featured-questions.model";
import { Connection, Types } from "mongoose";

interface questionWithInterest {
  questionId: Types.ObjectId;
  interest: number;
}

const FEATURED_LIST_CONSIDERATION =
  process.env.FEATURED_LIST_CONSIDERATION !== undefined
    ? parseInt(process.env.FEATURED_LIST_CONSIDERATION, 10)
    : 500;
const FEATURED_LIST_LENGTH = Math.floor(FEATURED_LIST_CONSIDERATION / 2);

const defineFeaturedJobs = (agenda: Agenda, mongoose: Connection) => {
  agenda.define("GENERATE FEATURED LIST", { concurrency: 1 }, async () => {
    try {
      const questions: questionWithInterest[] = [];
      const promises = [];

      for await (const question of Question.find()
        .sort({ updatedAt: -1 })
        .limit(FEATURED_LIST_CONSIDERATION)
        .lean()) {
        promises.push(
          (async () => {
            questions.push({
              questionId: question._id,
              interest: await calculateInterest(question),
            });
          })()
        );
      }

      await Promise.all(promises);
      questions.sort((a, b) => b.interest - a.interest);

      const featuredQuestions = questions.slice(0, FEATURED_LIST_LENGTH);

      // perform as transaction to ensure list is always populated
      await FeaturedQuestion.deleteMany({});
      await FeaturedQuestion.insertMany(featuredQuestions);
    } catch (err) {
      console.error(
        `Unable to generate featured questions: ${err}. \nWill try again in 1 min.`
      );
      await agenda.schedule("in 1 minute", "GENERATE FEATURED LIST", {});
    }
  });

  agenda.on("ready", async function () {
    // TODO: trigger generation dynamically
    await agenda.cancel({ name: "GENERATE FEATURED LIST" });
  });
};

export default defineFeaturedJobs;
