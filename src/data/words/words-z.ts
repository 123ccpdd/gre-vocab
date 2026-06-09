import type { Word } from '../../types';

export const wordList: Word[] = [
  {
    id: '384',
    word: 'zealous',
    phonetic: '/ˈzeləs/',
    meaning: 'adj. 热情的；狂热的',
    pos: ['adj.'],
    roots: [
      { type: 'root', part: 'zeal', meaning: '热情', origin: '希腊语' },
      { type: 'suffix', part: '-ous', meaning: '形容词后缀' },
    ],
    examples: [
      { sentence: 'Zealous advocates of environmental protection often face strong opposition.', translation: '环保的热情倡导者经常面临强烈的反对。', year: 2022, type: '阅读' },
    ],
    difficulty: 3,
    frequency: 4,
  },
  {
    id: '385',
    word: 'zenith',
    phonetic: '/ˈzenɪθ/',
    meaning: 'n. 顶点；鼎盛时期',
    pos: ['n.'],
    roots: [
      { type: 'root', part: 'zenith', meaning: '头顶，最高点', origin: '阿拉伯语' },
    ],
    examples: [
      { sentence: 'The Roman Empire reached its zenith in the second century AD.', translation: '罗马帝国在公元二世纪达到鼎盛时期。', year: 2021, type: '翻译' },
    ],
    difficulty: 4,
    frequency: 3,
  },
];
