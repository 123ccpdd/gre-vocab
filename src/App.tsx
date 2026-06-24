import { useState, useCallback, useMemo, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, Link, useParams } from 'react-router-dom';
import type { Word, LearningMode } from './types';
import { getAllWords } from './data/words';
import {
  useLearningRecords,
  useDailyStats,
  useSettings,
} from './hooks/useStorage';
import { useAuth } from './contexts/AuthContext';
import WordCard from './components/WordCard';
import Dashboard from './components/Dashboard';
import LearningSession from './components/LearningSession';
import CompletionScreen from './components/CompletionScreen';
import StatsPanel from './components/StatsPanel';
import WordListPage from './components/WordList';
import CategoryWordList from './components/CategoryWordList';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { ReadOutlined, HomeOutlined, BarChartOutlined, BookOutlined, SunOutlined, MoonOutlined, LogoutOutlined } from '@ant-design/icons';

type Category = 'mastered' | 'reviewing' | 'learning' | 'new';

// 路由守卫：未登录重定向到 /login
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// 主应用布局
function MainApp() {
  const [currentWords, setCurrentWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [noTransition, setNoTransition] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionIncorrect, setSessionIncorrect] = useState(0);
  const [learningMode, setLearningMode] = useState<LearningMode>('learn');
  const [category, setCategory] = useState<Category>('mastered');
  const [activeView, setActiveView] = useState<'home' | 'learn' | 'review' | 'complete' | 'category'>('home');

  const { logout, user, showMigrationDialog, handleMigration, skipMigration } = useAuth();
  const navigate = useNavigate();

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
    setActiveView('category');
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
    setActiveView('learn');
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
    setActiveView('review');
  }, [dueWordIds]);

  // 处理"认识"
  const handleKnow = useCallback(() => {
    if (currentIndex >= currentWords.length) return;
    const word = currentWords[currentIndex];
    markWord(word.id, true);
    setSessionCorrect((c) => c + 1);

    const isLearning = learningMode === 'learn';
    updateTodayStats(
      isLearning
        ? { newWords: todayStats.newWords + 1 }
        : { reviewWords: todayStats.reviewWords + 1 }
    );

    if (currentIndex + 1 >= currentWords.length) {
      setActiveView('complete');
    } else {
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
      setActiveView('complete');
    } else {
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
    if (activeView !== 'learn' && activeView !== 'review') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          if (!isFlipped) setIsFlipped(true);
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
          setActiveView('home');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeView, isFlipped, handleKnow, handleDontKnow]);

  const currentRecord = useMemo(
    () =>
      currentWords.length > 0 && currentIndex < currentWords.length
        ? getRecord(currentWords[currentIndex].id)
        : undefined,
    [currentWords, currentIndex, getRecord]
  );

  // 判断当前导航栏高亮
  const location = useLocation();
  const navHighlight = (path: string) => {
    if (path === '/' && location.pathname === '/' && activeView === 'home') return true;
    if (path !== '/' && location.pathname === path) return true;
    return false;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* 导航栏 */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10 transition-colors">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            onClick={() => setActiveView('home')}
            className="text-lg font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
          >
            <ReadOutlined className="mr-1" /> 考研词汇
          </Link>
          <div className="flex gap-1 items-center">
            <button
              onClick={() => { setActiveView('home'); navigate('/'); }}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${navHighlight('/') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <HomeOutlined className="mr-1" /> 首页
            </button>
            <Link
              to="/words"
              className={`px-3 py-1.5 rounded-lg text-sm transition ${navHighlight('/words') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <BookOutlined className="mr-1" /> 词库
            </Link>
            <Link
              to="/stats"
              className={`px-3 py-1.5 rounded-lg text-sm transition ${navHighlight('/stats') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <BarChartOutlined className="mr-1" /> 统计
            </Link>
            <button
              onClick={() => updateSettings({ enableDarkMode: !settings.enableDarkMode })}
              className="px-2 py-1.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {settings.enableDarkMode ? <SunOutlined /> : <MoonOutlined />}
            </button>
            <button
              onClick={handleLogout}
              className="px-2 py-1.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="退出登录"
            >
              <LogoutOutlined />
            </button>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* 首页 + 学习/复习/完成/分类 — 用内部 state 切换 */}
        {activeView === 'home' && location.pathname === '/' && (
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

        {(activeView === 'learn' || activeView === 'review') &&
          currentWords.length > 0 &&
          currentIndex < currentWords.length && (
            <div className="space-y-6">
              <LearningSession
                mode={activeView === 'learn' ? 'learn' : 'review'}
                totalWords={currentWords.length}
                currentIndex={currentIndex}
                correctCount={sessionCorrect}
                incorrectCount={sessionIncorrect}
                onFinish={() => setActiveView('home')}
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
              <div className="text-center text-xs text-gray-400 dark:text-gray-500 space-x-4">
                <span>空格 翻转</span>
                <span>1/J 不认识</span>
                <span>2/K 认识</span>
                <span>ESC 退出</span>
              </div>
            </div>
          )}

        {activeView === 'complete' && (
          <CompletionScreen
            mode={learningMode === 'review' ? 'review' : 'learn'}
            totalWords={sessionCorrect + sessionIncorrect}
            correctCount={sessionCorrect}
            incorrectCount={sessionIncorrect}
            onBack={() => setActiveView('home')}
            onContinue={() => {
              if (learningMode === 'learn') startLearn();
              else startReview();
            }}
          />
        )}

        {activeView === 'category' && (
          <CategoryWordList
            category={category}
            words={categoryWords[category]}
            records={records}
            onBack={() => setActiveView('home')}
          />
        )}

        {/* 路由页面 */}
        <Routes>
          <Route path="/stats" element={<StatsPanel stats={stats} streak={streak} totalMastered={wordStats.mastered} totalWords={getAllWords().length} />} />
          <Route path="/words" element={<WordListPage />} />
          <Route path="/words/:category" element={<CategoryWordRoute categoryWords={categoryWords} records={records} onBack={() => navigate('/')} />} />
        </Routes>
      </main>

      {/* 数据迁移对话框 */}
      {showMigrationDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">检测到本地学习数据</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              你之前在本地有学习记录，是否将数据同步到云端？同步后可在不同设备间共享进度。
            </p>
            <div className="flex gap-3">
              <button
                onClick={skipMigration}
                className="px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                暂不同步
              </button>
              <button
                onClick={handleMigration}
                className="px-4 py-2 rounded-xl text-sm text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition font-medium"
              >
                同步到云端
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 分类词汇路由组件
function CategoryWordRoute({ categoryWords, records, onBack }: { categoryWords: Record<Category, Word[]>; records: Record<string, any>; onBack: () => void }) {
  const { category: cat } = useParams<{ category: Category }>();
  const validCategories: Category[] = ['mastered', 'reviewing', 'learning', 'new'];
  if (!cat || !validCategories.includes(cat)) {
    return <Navigate to="/" replace />;
  }
  return <CategoryWordList category={cat} words={categoryWords[cat]} records={records} onBack={onBack} />;
}

function App() {
  return (
    <Routes>
      {/* 公开路由 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* 受保护路由 */}
      <Route path="/*" element={
        <ProtectedRoute>
          <MainApp />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;