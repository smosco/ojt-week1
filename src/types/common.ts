// 공통 Props 타입
export interface BaseQuestionProps<T = any> {
  onAnswer: (answer: T) => void;
  userAnswer?: T;
  feedbackVisible?: boolean;
}

// 버튼 스타일 계산 유틸리티
export const getAnswerButtonStyle = (
  option: string,
  userAnswer: string | undefined,
  correctAnswers: string[],
  feedbackVisible: boolean
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

// 공통 버튼 클래스
export const baseButtonClasses = 
  'px-6 py-4 text-xl font-bold rounded-xl shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 border-2';

// SVG 관련 유틸리티
export const createSVGPath = (
  center: { x: number; y: number },
  radius: number,
  startAngle: number,
  endAngle: number
): string => {
  const x1 = center.x + radius * Math.cos(startAngle);
  const y1 = center.y + radius * Math.sin(startAngle);
  const x2 = center.x + radius * Math.cos(endAngle);
  const y2 = center.y + radius * Math.sin(endAngle);
  
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  
  return `M ${center.x} ${center.y} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
};

// 색상 팔레트
export const colors = {
  primary: '#FFD1DC',
  secondary: '#A7E0F9',
  accent: '#FFB703',
  success: '#34D399',
  error: '#F87171',
  neutral: '#94A3B8'
};

// 애니메이션 클래스
export const animations = {
  fadeIn: 'animate-fadeIn',
  slideIn: 'animate-slideIn',
  bounce: 'animate-bounce'
};