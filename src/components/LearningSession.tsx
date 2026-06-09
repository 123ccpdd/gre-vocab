interface LearningSessionProps {
  mode: 'learn' | 'review';
  totalWords: number;
  currentIndex: number;
  correctCount: number;
  incorrectCount: number;
  onFinish: () => void;
}

export default function LearningSession({
  mode,
  totalWords,
  currentIndex,
  correctCount,
  incorrectCount,
  onFinish,
}: LearningSessionProps) {
  const progress = totalWords > 0 ? ((currentIndex / totalWords) * 100).toFixed(0) : '0';

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      {/* 顶部信息栏 */}
      <div className="flex items-center justify-between">
        <button
          onClick={onFinish}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          ← 退出
        </button>
        <span className="text-sm text-gray-500">
          {mode === 'learn' ? '✨ 学习新词' : '🔄 复习'} · {currentIndex + 1} / {totalWords}
        </span>
        <div className="flex gap-2 text-sm">
          <span className="text-green-600">✓ {correctCount}</span>
          <span className="text-red-500">✗ {incorrectCount}</span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
