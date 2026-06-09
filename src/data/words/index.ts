// 考研英语核心词汇 - 统一导出入口
// 词汇按字母顺序分组管理，便于维护和扩展

import type { Word } from '../../types';

import { wordList as wordsA } from './words-a';
import { wordList as wordsB } from './words-b';
import { wordList as wordsC } from './words-c';
import { wordList as wordsD } from './words-d';
import { wordList as wordsE } from './words-e';
import { wordList as wordsF } from './words-f';
import { wordList as wordsG } from './words-g';
import { wordList as wordsH } from './words-h';
import { wordList as wordsI } from './words-i';
import { wordList as wordsJ } from './words-j';
import { wordList as wordsK } from './words-k';
import { wordList as wordsL } from './words-l';
import { wordList as wordsM } from './words-m';
import { wordList as wordsN } from './words-n';
import { wordList as wordsO } from './words-o';
import { wordList as wordsP } from './words-p';
import { wordList as wordsQ } from './words-q';
import { wordList as wordsR } from './words-r';
import { wordList as wordsS } from './words-s';
import { wordList as wordsT } from './words-t';
import { wordList as wordsU } from './words-u';
import { wordList as wordsV } from './words-v';
import { wordList as wordsW } from './words-w';
import { wordList as wordsX } from './words-x';
import { wordList as wordsY } from './words-y';
import { wordList as wordsZ } from './words-z';

export { wordsA, wordsB, wordsC, wordsD, wordsE, wordsF, wordsG, wordsH, wordsI, wordsJ, wordsK, wordsL, wordsM, wordsN, wordsO, wordsP, wordsQ, wordsR, wordsS, wordsT, wordsU, wordsV, wordsW, wordsX, wordsY, wordsZ };

// 合并所有词汇
export const allWords: Word[] = [
  ...wordsA,
  ...wordsB,
  ...wordsC,
  ...wordsD,
  ...wordsE,
  ...wordsF,
  ...wordsG,
  ...wordsH,
  ...wordsI,
  ...wordsJ,
  ...wordsK,
  ...wordsL,
  ...wordsM,
  ...wordsN,
  ...wordsO,
  ...wordsP,
  ...wordsQ,
  ...wordsR,
  ...wordsS,
  ...wordsT,
  ...wordsU,
  ...wordsV,
  ...wordsW,
  ...wordsX,
  ...wordsY,
  ...wordsZ,
];

// 兼容旧导入：App.tsx 使用 wordList
export const wordList = allWords;

// 根据难度筛选单词
export function getWordsByDifficulty(difficulty: number): Word[] {
  return allWords.filter((w) => w.difficulty === difficulty);
}

// 根据词根搜索单词
export function getWordsByRoot(root: string): Word[] {
  return allWords.filter((w) =>
    w.roots.some((r) => r.part.toLowerCase().includes(root.toLowerCase()))
  );
}

// 获取随机单词
export function getRandomWords(count: number): Word[] {
  const shuffled = [...allWords].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// 搜索单词
export function searchWords(query: string): Word[] {
  const lowerQuery = query.toLowerCase();
  return allWords.filter(
    (w) =>
      w.word.toLowerCase().includes(lowerQuery) ||
      w.meaning.includes(query) ||
      w.roots.some((r) => r.part.toLowerCase().includes(lowerQuery))
  );
}