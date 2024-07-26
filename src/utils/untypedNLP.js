import {TokenizerEn, StopwordsEn} from '@nlpjs/lang-en'

const tokenizer = new TokenizerEn()
const stopword = new StopwordsEn()

export const pullKeywords = (sentence) => {
  const tokens = tokenizer.tokenize(sentence)
  const filtered = stopword.removeStopwords(tokens)
  return filtered
}
