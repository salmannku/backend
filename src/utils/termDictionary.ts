import Term from "../models/dictionary-term.model";
import cnlp from "compromise";
import { pullKeywords } from "./untypedNLP";
import FrequencyDistribution from "./frequencyDistribution";
import { MongoServerError } from "mongodb";

const freqDist = new FrequencyDistribution();
const wordCount: Map<string, number> = new Map();

export async function recordOccurrence(word: string): Promise<boolean> {
  // Records an occurrence of a term, locally and on the database.

  // preprocess term
  word = word.toLowerCase();
  try {
    // update count on mongo
    await Term.updateOne({ word }, { $inc: { count: 1 } }, { upsert: true });

    const oldCount = wordCount.get(word);

    if (oldCount !== undefined) {
      wordCount.set(word, oldCount + 1);
      freqDist.addCount(oldCount, -1);
      freqDist.addCount(oldCount + 1, 1);
    } else {
      wordCount.set(word, 1);
      freqDist.addCount(1);
    }

    return true;
  } catch (e) {
    // See https://jira.mongodb.org/browse/SERVER-14322
    if (e instanceof MongoServerError && e.code === 11000)
      return recordOccurrence(word);

    // TODO: logging
    console.error(e);
    return false;
  }
}

export async function extractKeywords(sourceText: string): Promise<string[]> {
  // Extracts keywords and key-phrases from text.

  // TODO: better keyword detection

  // dynamic import (ESM)
  // const {retext} = (await import('retext'))
  // const retextPos  = await import('retext-pos')
  // const retextKeywords = await import('retext-keywords')
  // const {toString} = await import('nlcst-to-string')

  const doc = cnlp(sourceText);

  try {
    doc.nouns().toSingular();
    doc.contractions().expand();
  } catch (e) {
    // https://github.com/spencermountain/compromise/issues/965
  }

  return pullKeywords(doc.text());

  // @ts-ignore
  // const text = await retext().use(retextPos).use(retextKeywords).process(doc.text())
  //
  // const keywords: string[] = []
  //
  // if (text.data.keywords === undefined) return keywords
  //
  // text.data.keywords.forEach(
  //   (keyword) => keywords.push(toString(keyword.matches[0].node)))
  //
  // if (text.data.keyphrases === undefined) return keywords

  // text.data.keyphrases.forEach((phrase) => {
  //   keywords.push(phrase.matches[0].nodes.map((d) => toString(d)).join(''))
  // })

  // return keywords
}

export async function maintainDictionary() {
  // Fetches and build local dictionary store.

  try {
    // rebuild local dictionary
    freqDist.clear();
    wordCount.clear();

    for await (const entry of Term.find()) {
      wordCount.set(entry.word, entry.count);
      freqDist.addCount(entry.count);
    }

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function isDictionaryBuilt(): Promise<boolean> {
  return (await Term.count()) > 0;
}

export function getWordCount(word: string): number {
  // Returns the number of occurrences of a phrase from the local dictionary.

  word = word.toLowerCase().replace("-", "");
  if (wordCount.has(word)) return wordCount.get(word) as number;
  return 0;
}

const reverseIndex = (n: number) => ((n * 2 - 1) * -1 + 1) / 2;

export async function calculateUniqueness(
  sourceText: string,
  recordOccurrences: boolean = false
): Promise<number> {
  // Calculates the uniqueness of a given text, and updates the dictionary.

  // extract keywords
  const keywords = await extractKeywords(sourceText);

  // record occurrences
  if (recordOccurrences) {
    const promises = keywords.map((keyword) => recordOccurrence(keyword));
    await Promise.all(promises);
  }

  // calculate and return uniqueness
  const keywordCounts = keywords.map((keyword) => getWordCount(keyword));
  const uniquenessIndices = keywordCounts.map((count) =>
    reverseIndex(freqDist.getPosition(count))
  );
  if (uniquenessIndices.length === 0) uniquenessIndices.push(0);
  return (
    uniquenessIndices.reduce((sum, count) => sum + count, 0) /
    uniquenessIndices.length
  );
}
