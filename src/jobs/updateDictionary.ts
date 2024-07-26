import Agenda, { Job, JobAttributesData, JobPriority } from "agenda";
import Term from "../models/dictionary-term.model";
import Question from "../models/questions.model";
import { Connection } from "mongoose";
import {
  calculateUniqueness,
  extractKeywords,
  maintainDictionary,
  recordOccurrence,
} from "../utils/termDictionary";

export interface RecordQuestion extends JobAttributesData {
  question: string;
}

const buildDictionary = async (): Promise<boolean> => {
  console.log("Rebuilding Dictionary.");

  // clear dictionary in db
  Term.deleteMany({});

  // rebuild dictionary for every question
  try {
    for await (const question of Question.find()) {
      if (question.question !== undefined) {
        const keywords = await extractKeywords(question.question);
        const promises = keywords.map((keyword) => recordOccurrence(keyword));
        await Promise.all(promises);
      }
    }

    // rebuild local dictionary
    console.log("Built and loaded dictionary.");

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

const defineDictionaryJobs = (agenda: Agenda, mongoose: Connection) => {
  agenda.define<JobAttributesData>(
    "LOAD DICTIONARY",
    // {priority: 'high'},
    async (job: Job) => {
      await maintainDictionary();
      console.log("Loaded dictionary.");
      await agenda.every("30 minutes", "GENERATE FEATURED LIST");
    }
  );

  agenda.define<JobAttributesData>(
    "REBUILD DICTIONARY",
    // {priority: 'highest'},
    async (job: Job) => {
      await buildDictionary();
      await agenda.every("30 minutes", "GENERATE FEATURED LIST");
    }
  );

  agenda.define<JobAttributesData>(
    "CHECK DICTIONARY",
    // {priority: 'high'},
    async (job: Job) => {
      // TODO: define better check for dictionary build completion

      if ((await Term.count()) <= 0)
        await job.agenda.now("REBUILD DICTIONARY", {});
      else await job.agenda.now("LOAD DICTIONARY", {});
    }
  );

  agenda.define<RecordQuestion>(
    "RECORD QUESTION",
    {},
    async (job: Job<RecordQuestion>) => {
      await calculateUniqueness(job.attrs.data.question, true);
    }
  );
};

export default defineDictionaryJobs;
