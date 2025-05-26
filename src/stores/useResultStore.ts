import { create } from 'zustand';

interface QuestionResult {
  id: string;
  isCorrect: boolean;
}

interface ResultState {
  total: number;
  results: QuestionResult[];
  timeInSeconds: number;
  startTime: number;

  start: (total: number) => void;
  addResult: (result: QuestionResult) => void;
  finish: () => void;
  reset: () => void;
}

const useResultStore = create<ResultState>((set, get) => ({
  total: 0,
  results: [],
  timeInSeconds: 0,
  startTime: 0,

  // 시작 시점 기록 + 전체 개수 저장
  start: (total) =>
    set({ startTime: Date.now(), total, results: [], timeInSeconds: 0 }),

  // 문제 결과 추가
  addResult: (result) =>
    set((state) => ({
      results: [...state.results, result],
    })),

  // 종료 시간 기록 → 경과 시간 계산
  finish: () => {
    const start = get().startTime;
    const now = Date.now();
    const seconds = Math.max(0, Math.floor((now - start) / 1000));
    set({ timeInSeconds: seconds });
  },

  reset: () => set({ total: 0, results: [], timeInSeconds: 0, startTime: 0 }),
}));

export default useResultStore;
