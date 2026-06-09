import type { Word } from '../../types';

export const wordList: Word[] = [
  {
    id: '284',
    word: 'qualitative',
    phonetic: '/ˈkwɒlɪtətɪv/',
    meaning: 'adj. 定性的，性质的',
    pos: ['adj.'],
    roots: [
      { type: 'root', part: 'qual', meaning: '性质', origin: '拉丁语' },
      { type: 'suffix', part: '-itative', meaning: '形容词后缀' },
    ],
    examples: [
      { sentence: 'The study involved both quantitative and qualitative analysis.', translation: '这项研究包括定量和定性分析。', year: 2022, type: '阅读' },
    ],
    difficulty: 3,
    frequency: 4,
  },
  {
    id: '285',
    word: 'quest',
    phonetic: '/kwest/',
    meaning: 'n. 探索，寻求；v. 寻找',
    pos: ['n.', 'v.'],
    roots: [
      { type: 'root', part: 'quest', meaning: '寻求', origin: '拉丁语' },
    ],
    examples: [
      { sentence: 'The quest for knowledge is a lifelong journey.', translation: '对知识的追求是一生的旅程。', year: 2021, type: '翻译' },
    ],
    difficulty: 2,
    frequency: 4,
  },
  {
    id: '286',
    word: 'quench',
    phonetic: '/kwentʃ/',
    meaning: 'v. 解渴；扑灭，熄灭',
    pos: ['v.'],
    roots: [
      { type: 'root', part: 'quench', meaning: '熄灭', origin: '古英语' },
    ],
    examples: [
      { sentence: 'Nothing could quench his thirst for adventure.', translation: '没有什么能熄灭他对冒险的渴望。', year: 2020, type: '阅读' },
    ],
    difficulty: 3,
    frequency: 2,
  },
  {
    id: '287',
    word: 'quintessential',
    phonetic: '/ˌkwɪntɪˈsenʃl/',
    meaning: 'adj. 典型的，精髓的',
    pos: ['adj.'],
    roots: [
      { type: 'root', part: 'quint', meaning: '第五', origin: '拉丁语' },
      { type: 'root', part: 'essence', meaning: '本质', origin: '拉丁语' },
    ],
    examples: [
      { sentence: 'This painting is the quintessential example of Renaissance art.', translation: '这幅画是文艺复兴艺术的典型代表。', year: 2023, type: '阅读' },
    ],
    difficulty: 4,
    frequency: 2,
  },
];
