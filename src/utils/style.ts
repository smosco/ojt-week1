// 공통 버튼 클래스
export const baseButtonClasses =
  'px-6 py-4 text-xl font-bold rounded-xl shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 border-2';

// TODO: 이 부분은 공통 스타일로 분리하여 재사용 가능하게 개선
// 단일 선택 문제 버튼 스타일 계산 함수
export const getAnswerButtonStyle = (
  option: string,
  userAnswer: string | undefined,
  correctAnswers: string[],
  feedbackVisible: boolean,
): string => {
  if (feedbackVisible) {
    if (correctAnswers.includes(option)) {
      return 'bg-green-200 text-green-900 border-green-400';
    }
    if (userAnswer === option) {
      return 'bg-red-200 text-red-900 border-red-400';
    }
    return 'bg-gray-100 text-gray-600 border-gray-300';
  }

  if (userAnswer === option) {
    return 'bg-yellow-200 text-yellow-900 border-yellow-400';
  }

  return 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50';
};

// 다중 선택을 위한 버튼 스타일 함수
export const getMultipleAnswerButtonStyle = (
  option: string,
  userAnswer: string[] | undefined,
  correctAnswers: string[],
  feedbackVisible: boolean,
): string => {
  const isSelected = userAnswer?.includes(option) || false;
  const isCorrect = correctAnswers.includes(option);

  if (feedbackVisible) {
    if (isCorrect && isSelected) {
      return 'bg-green-500 text-white border-green-600'; // 정답이면서 선택함
    }
    if (isCorrect && !isSelected) {
      return 'bg-green-200 text-green-800 border-green-400'; // 정답인데 선택 안함
    }
    if (!isCorrect && isSelected) {
      return 'bg-red-500 text-white border-red-600'; // 오답인데 선택함
    }
    return 'bg-gray-100 text-gray-600 border-gray-300'; // 오답이면서 선택 안함
  }

  // 피드백 전 상태
  if (isSelected) {
    return 'bg-blue-500 text-white border-blue-600 shadow-lg transform scale-105';
  }

  return 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300';
};
