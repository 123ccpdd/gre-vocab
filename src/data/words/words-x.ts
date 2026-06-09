import type { Word } from '../../types';

export const wordList: Word[] = [
  {
    id: '380',
    word: 'xenophobia',
    phonetic: '/ˌzenəˈfəʊbiə/',
    meaning: 'n. 仇外心理；对外国人的恐惧',
    pos: ['n.'],
    roots: [
      { type: 'root', part: 'xeno', meaning: '外来的，陌生人', origin: '希腊语' },
      { type: 'root', part: 'phob', meaning: '恐惧', origin: '希腊语' },
      { type: 'suffix', part: '-ia', meaning: '名词后缀' },
    ],
    examples: [
      { sentence: 'The rise of xenophobia poses a serious threat to social cohesion.', translation: '仇外心理的兴起对社会凝聚力构成严重威胁。', year: 2022, type: '阅读' },
    ],
    difficulty: 4,
    frequency: 3,
  },
];
