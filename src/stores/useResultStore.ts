import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface QuestionResult {
  id: string;
  isCorrect: boolean;
  submittedAt: number; // 답안 제출 시간
}

interface ResultState {
  // 상태
  total: number;
  results: QuestionResult[];
  timeInSeconds: number;
  startTime: number;
  isActive: boolean; // 퀴즈 진행 중인지 여부

  // 계산된 값들
  correctCount: number;
  incorrectCount: number;
  completedCount: number;
  accuracyRate: number;

  // 액션들
  start: (total: number) => void;
  addResult: (result: Omit<QuestionResult, 'submittedAt'>) => void;
  finish: () => void;
  reset: () => void;
}

const useResultStore = create<ResultState>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      total: 0,
      results: [],
      timeInSeconds: 0,
      startTime: 0,
      isActive: false,

      // 퀴즈 시작
      start: (total) => {
        const now = Date.now();
        set({
          startTime: now,
          total,
          results: [],
          timeInSeconds: 0,
          isActive: true,
        });
      },

      // 문제 결과 추가
      addResult: (result) => {
        const now = Date.now();
        const newResult: QuestionResult = {
          ...result,
          submittedAt: now,
        };

        set((state) => ({
          results: [...state.results, newResult],
        }));
      },

      // 퀴즈 종료
      finish: () => {
        const { startTime } = get();
        const now = Date.now();
        const seconds = Math.max(0, Math.floor((now - startTime) / 1000));

        set({
          timeInSeconds: seconds,
          isActive: false,
        });
      },

      // 상태 초기화
      reset: () => {
        set({
          total: 0,
          results: [],
          timeInSeconds: 0,
          startTime: 0,
          isActive: false,
        });
      },
    }),
    {
      name: 'result-store', // devtools에서 보이는 이름
    },
  ),
);

// 유틸리티 훅들
export const useQuizProgress = () => {
  const store = useResultStore();
  return {
    currentIndex: store.completedCount,
    total: store.total,
    progressPercentage:
      store.total > 0 ? (store.completedCount / store.total) * 100 : 0,
    isComplete: store.completedCount >= store.total && store.total > 0,
  };
};

export const useQuizStats = () => {
  const { results, timeInSeconds, isActive } = useResultStore();
  const correctCount = results.filter((r) => r.isCorrect).length;
  const incorrectCount = results.filter((r) => !r.isCorrect).length;
  const totalCount = results.length;
  const accuracyRate = totalCount > 0 ? correctCount / totalCount : 0;
  return {
    correctCount,
    incorrectCount,
    totalCount,
    accuracyRate,
    timeInSeconds,
    isActive,
  };
};

export default useResultStore;
