import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Word, LearningMode } from './types';
import { getAllWords } from './data/words';
import {
  useLearningRecords,
  useDailyStats,
  useSettings,
} from './hooks/useStorage';
import WordCard from './components/WordCard';
import Dashboard from './components/Dashboard';
import LearningSession from './components/LearningSession';
import CompletionScreen from './components/CompletionScreen';
import StatsPanel from './components/StatsPanel';
import WordListPage from './components/WordList';
import CategoryWordList from './components/CategoryWordList';
import { ReadOutlined, HomeOutlined, BarChartOutlined, BookOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';

type View = 'home' | 'learn' | 'review' | 'stats' | 'wordlist' | 'complete' | 'category';
type Category = 'mastered' | 'reviewing' | 'learning' | 'new';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [currentWords, setCurrentWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [noTransition, setNoTransition] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionIncorrect, setSessionIncorrect] = useState(0);
  const [learningMode, setLearningMode] = useState<LearningMode>('learn');
  const [category, setCategory] = useState<Category>('mastered');

  const { records, getRecord, markWord, getDueWords, getStats } = useLearningRecords();
  const { updateTodayStats, getTodayStats, getStreak, stats } = useDailyStats();
  const { settings, updateSettings } = useSettings();

  // 全局统计
  const wordStats = getStats();
  const todayStats = getTodayStats();
  const streak = getStreak();

  // 待复习单词 ID 列表
  const dueWordIds = useMemo(() => getDueWords(), [getDueWords]);

  // 计算未学过的单词
  const unlearnedWords = useMemo(
    () => getAllWords().filter((w) => !getRecord(w.id)),
    [getRecord]
  );

  // 按分类获取单词列表
  const categoryWords = useMemo(() => {
    const allWords = getAllWords();
    return {
      mastered: allWords.filter((w) => { const r = getRecord(w.id); return r?.status === 'mastered'; }),
      reviewing: allWords.filter((w) => { const r = getRecord(w.id); return r?.status === 'reviewing'; }),
      learning: allWords.filter((w) => { const r = getRecord(w.id); return r?.status === 'learning'; }),
      new: allWords.filter((w) => !getRecord(w.id)),
    };
  }, [getRecord]);

  // 查看分类词汇
  const handleViewCategory = useCallback((cat: Category) => {
    setCategory(cat);
    setCurrentView('category');
  }, []);

  // 深色模式
  useEffect(() => {
    if (settings.enableDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.enableDarkMode]);

  // Fisher-Yates 洗牌
  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // 开始学习新词
  const startLearn = useCallback(() => {
    const words = shuffle(unlearnedWords).slice(0, settings.dailyNewWords);
    if (words.length === 0) {
      alert('今日新词已学完！');
      return;
    }
    setCurrentWords(words);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCorrect(0);
    setSessionIncorrect(0);
    setLearningMode('learn');
    setCurrentView('learn');
  }, [unlearnedWords, settings.dailyNewWords]);

  // 开始复习
  const startReview = useCallback(() => {
    const dueWords = shuffle(getAllWords().filter((w) => dueWordIds.includes(w.id)));
    if (dueWords.length === 0) {
      alert('暂无需要复习的单词！');
      return;
    }
    setCurrentWords(dueWords);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCorrect(0);
    setSessionIncorrect(0);
    setLearningMode('review');
    setCurrentView('review');
  }, [dueWordIds]);

  // 处理"认识"
  const handleKnow = useCallback(() => {
    if (currentIndex >= currentWords.length) return;
    const word = currentWords[currentIndex];
    markWord(word.id, true);
    setSessionCorrect((c) => c + 1);

    // 更新今日统计
    const isLearning = learningMode === 'learn';
    updateTodayStats(
      isLearning
        ? { newWords: todayStats.newWords + 1 }
        : { reviewWords: todayStats.reviewWords + 1 }
    );

    // 下一个
    if (currentIndex + 1 >= currentWords.length) {
      setCurrentView('complete');
    } else {
      // 禁用动画 + 翻回正面，下一帧再切换词并恢复动画
      setNoTransition(true);
      setIsFlipped(false);
      requestAnimationFrame(() => {
        setCurrentIndex((i) => i + 1);
        setNoTransition(false);
      });
    }
  }, [currentIndex, currentWords, markWord, learningMode, updateTodayStats, todayStats]);

  // 处理"不认识"
  const handleDontKnow = useCallback(() => {
    if (currentIndex >= currentWords.length) return;
    const word = currentWords[currentIndex];
    markWord(word.id, false);
    setSessionIncorrect((c) => c + 1);

    updateTodayStats(
      learningMode === 'learn'
        ? { newWords: todayStats.newWords + 1 }
        : { reviewWords: todayStats.reviewWords + 1 }
    );

    if (currentIndex + 1 >= currentWords.length) {
      setCurrentView('complete');
    } else {
      // 禁用动画 + 翻回正面，下一帧再切换词并恢复动画
      setNoTransition(true);
      setIsFlipped(false);
      requestAnimationFrame(() => {
        setCurrentIndex((i) => i + 1);
        setNoTransition(false);
      });
    }
  }, [currentIndex, currentWords, markWord, learningMode, updateTodayStats, todayStats]);

  // 快捷键支持
  useEffect(() => {
    if (currentView !== 'learn' && currentView !== 'review') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          if (!isFlipped) {
            setIsFlipped(true);
          }
          break;
        case '1':
        case 'j':
          if (isFlipped) handleDontKnow();
          break;
        case '2':
        case 'k':
          if (isFlipped) handleKnow();
          break;
        case 'Escape':
          setCurrentView('home');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, isFlipped, handleKnow, handleDontKnow]);

  // 当前单词的学习记录
  const currentRecord = useMemo(
    () =>
      currentWords.length > 0 && currentIndex < currentWords.length
        ? getRecord(currentWords[currentIndex].id)
        : undefined,
    [currentWords, currentIndex, getRecord]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setCurrentView('home')}
            className="text-lg font-bold text-indigo-600 hover:text-indigo-700 transition"
          >
            <ReadOutlined className="mr-1" /> 考研词汇
          </button>
          <div className="flex gap-1">
            {(['home', 'wordlist', 'stats'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  currentView === view
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {view === 'home' ? <><HomeOutlined className="mr-1" /> 首页</> : view === 'wordlist' ? <><BookOutlined className="mr-1" /> 词库</> : <><BarChartOutlined className="mr-1" /> 统计</>}
              </button>
            ))}
            <button
              onClick={() =>
                updateSettings({ enableDarkMode: !settings.enableDarkMode })
              }
              className="px-2 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition"
            >
              {settings.enableDarkMode ? <SunOutlined /> : <MoonOutlined />}
            </button>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {currentView === 'home' && (
          <Dashboard
            masteredCount={wordStats.mastered}
            learningCount={wordStats.learning}
            newCount={wordStats.new}
            reviewingCount={wordStats.reviewing}
            totalCount={getAllWords().length}
            dueCount={dueWordIds.length}
            streak={streak}
            todayStats={todayStats}
            onStartLearn={startLearn}
            onStartReview={startReview}
            onViewCategory={handleViewCategory}
          />
        )}

        {(currentView === 'learn' || currentView === 'review') &&
          currentWords.length > 0 &&
          currentIndex < currentWords.length && (
            <div className="space-y-6">
              <LearningSession
                mode={currentView === 'learn' ? 'learn' : 'review'}
                totalWords={currentWords.length}
                currentIndex={currentIndex}
                correctCount={sessionCorrect}
                incorrectCount={sessionIncorrect}
                onFinish={() => setCurrentView('home')}
              />
              <WordCard
                word={currentWords[currentIndex]}
                isFlipped={isFlipped}
                noTransition={noTransition}
                onFlip={() => setIsFlipped(!isFlipped)}
                onKnow={handleKnow}
                onDontKnow={handleDontKnow}
                correctCount={currentRecord?.correctCount ?? 0}
                incorrectCount={currentRecord?.incorrectCount ?? 0}
              />
              {/* 快捷键提示 */}
              <div className="text-center text-xs text-gray-400 space-x-4">
                <span>空格 翻转</span>
                <span>1/J 不认识</span>
                <span>2/K 认识</span>
                <span>ESC 退出</span>
              </div>
            </div>
          )}

        {currentView === 'complete' && (
          <CompletionScreen
            mode={learningMode === 'review' ? 'review' : 'learn'}
            totalWords={sessionCorrect + sessionIncorrect}
            correctCount={sessionCorrect}
            incorrectCount={sessionIncorrect}
            onBack={() => setCurrentView('home')}
            onContinue={() => {
              if (learningMode === 'learn') {
                startLearn();
              } else {
                startReview();
              }
            }}
          />
        )}

        {currentView === 'stats' && (
          <StatsPanel
            stats={stats}
            streak={streak}
            totalMastered={wordStats.mastered}
            totalWords={getAllWords().length}
          />
        )}

        {currentView === 'wordlist' && <WordListPage />}

        {currentView === 'category' && (
          <CategoryWordList
            category={category}
            words={categoryWords[category]}
            records={records}
            onBack={() => setCurrentView('home')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
