// Question 컴포넌트 공통 Props 타입
export interface BaseQuestionProps<T> {
  onAnswer: (answer: T) => void;
  userAnswer: T | null;
  feedbackVisible?: boolean;
}
