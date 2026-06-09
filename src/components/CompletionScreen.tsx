import type { LearningMode } from '../types';

interface CompletionScreenProps {
  mode: LearningMode;
  totalWords: number;
  correctCount: number;
  incorrectCount: number;
  onBack: () => void;
  onContinue: () => void;
}

export default function CompletionScreen({
  mode,
  totalWords,
  correctCount,
  incorrectCount,
  onBack,
  onContinue,
}: CompletionScreenProps) {
  const accuracy =
    totalWords > 0 ? ((correctCount / totalWords) * 100).toFixed(0) : '0';

  const getMessage = () => {
    const rate = Number(accuracy);
    if (rate >= 90) return { emoji: '🎉', text: '太棒了！正确率超高！' };
    if (rate >= 70) return { emoji: '👍', text: '不错！继续加油！' };
    if (rate >= 50) return { emoji: '💪', text: '还需努力，别放弃！' };
    return { emoji: '📖', text: '多复习几遍，一定能记住！' };
  };

  const message = getMessage();

  return (
    <div className="max-w-md mx-auto text-center space-y-6 py-12">
      <div className="text-7xl">{message.emoji}</div>
      <h2 className="text-2xl font-bold text-gray-900">
        {mode === 'learn' ? '学习完成！' : '复习完成！'}
      </h2>
      <p className="text-gray-500">{message.text}</p>

      <div className="grid grid-cols-3 gap-4 py-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{totalWords}</p>
          <p className="text-xs text-gray-500">
            {mode === 'learn' ? '新学' : '复习'}单词
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-green-600">{correctCount}</p>
          <p className="text-xs text-gray-500">认识</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-red-500">{incorrectCount}</p>
          <p className="text-xs text-gray-500">不认识</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">正确率</p>
        <p className="text-4xl font-bold text-indigo-600">{accuracy}%</p>
      </div>

      <div className="space-y-3 pt-4">
        <button
          onClick={onContinue}
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition"
        >
          继续学习
        </button>
        <button
          onClick={onBack}
          className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}
