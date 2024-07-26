import Agenda from "agenda";
import defineDictionaryJobs from "./updateDictionary";
import defineFeaturedJobs from "./updateFeaturedList";
import { Connection } from "mongoose";

const defineAllJobs = (agenda: Agenda, mongoose: Connection) => {
  defineDictionaryJobs(agenda, mongoose);
  defineFeaturedJobs(agenda, mongoose);
};

export default defineAllJobs;
