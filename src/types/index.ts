// 单词数据结构
export interface Word {
  id: string;
  word: string;
  phonetic: string;           // 音标
  meaning: string;            // 中文释义
  pos: string[];              // 词性列表 (n., v., adj., etc.)
  roots: WordRoot[];          // 词根词缀分析
  examples: Example[];        // 真题例句
  difficulty: 1 | 2 | 3 | 4 | 5;  // 难度等级
  frequency: number;          // 考频（出现次数）
}

// 词根词缀
export interface WordRoot {
  type: 'prefix' | 'root' | 'suffix';
  part: string;               // 词根/词缀
  meaning: string;            // 含义
  origin?: string;            // 来源语言
}

// 真题例句
export interface Example {
  sentence: string;           // 例句
  translation: string;        // 翻译
  year: number;               // 年份
  type: '阅读' | '翻译' | '完形' | '写作' | '新题型';  // 题型
}

// 学习记录
export interface LearningRecord {
  wordId: string;
  status: 'new' | 'learning' | 'reviewing' | 'mastered';
  correctCount: number;       // 正确次数
  incorrectCount: number;     // 错误次数
  lastReviewDate: string;     // ISO 日期字符串
  nextReviewDate: string;     // 下次复习日期
  easeFactor: number;         // 难度因子 (用于 SM-2 算法)
  interval: number;           // 复习间隔（天）
  createdAt: string;
}

// 每日学习统计
export interface DailyStats {
  date: string;               // YYYY-MM-DD
  newWords: number;           // 新学单词数
  reviewWords: number;        // 复习单词数
  correctRate: number;        // 正确率
  studyTime: number;          // 学习时长（分钟）
}

// 用户设置
export interface UserSettings {
  dailyNewWords: number;      // 每日新词数量
  dailyReviewLimit: number;   // 每日复习上限
  enableSound: boolean;       // 是否开启发音
  enableDarkMode: boolean;    // 深色模式
  autoPlayPronunciation: boolean;  // 自动播放发音
}

// 学习模式
export type LearningMode = 'learn' | 'review' | 'test';

// 应用状态
export interface AppState {
  currentMode: LearningMode;
  currentWordIndex: number;
  isFlipped: boolean;
  sessionStats: {
    total: number;
    correct: number;
    incorrect: number;
  };
}
