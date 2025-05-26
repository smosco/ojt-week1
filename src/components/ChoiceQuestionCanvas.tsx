import { useMemo } from 'react';
import type { ChoiceQuestion } from '../types/question';
import { BaseQuestionProps, getAnswerButtonStyle, baseButtonClasses } from '../types/common';

interface Props extends BaseQuestionProps<string> {
  question: ChoiceQuestion;
}

export default function ChoiceQuestionCanvas({
  question,
  onAnswer,
  userAnswer,
  feedbackVisible = false,
}: Props) {
  // 점 그룹 SVG 렌더링 (다양한 SVG 태그 활용)
  const dotsVisualization = useMemo(() => {
    if (!question.media || question.media.type !== 'dots') {
      return null;
    }

    const media = question.media;
    const dotRadius = media.dotRadius || 16;
    const dotSpacing = media.dotSpacing || 10;
    const groupSpacing = media.groupSpacing || 60;
    
    let offsetX = 50; // 시작 위치
    const elements: React.ReactNode[] = [];
    const colors = ['#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

    // 배경 그라데이션 정의
    elements.push(
      <defs key="gradients">
        {colors.map((color, index) => (
          <radialGradient key={`gradient-${index}`} id={`dotGradient-${index}`} cx="30%" cy="30%">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="70%" stopColor={color} stopOpacity="0.7" />
            <stop offset="100%" stopColor={color} stopOpacity="0.5" />
          </radialGradient>
        ))}
        
        {/* 배경 패턴 */}
        <pattern id="backgroundPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1" fill="#f0f9ff" opacity="0.3" />
        </pattern>
        
        {/* 그림자 필터 */}
        <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.2"/>
        </filter>
      </defs>
    );

    // 배경 패턴
    elements.push(
      <rect
        key="background"
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="url(#backgroundPattern)"
        opacity="0.5"
      />
    );

    media.groups.forEach((dotCount, groupIndex) => {
      const groupWidth = dotCount * (dotRadius * 2 + dotSpacing) - dotSpacing;
      const groupColor = colors[groupIndex % colors.length];
      const groupStartX = offsetX;
      
      // 그룹 컨테이너 (rect with rounded corners)
      elements.push(
        <g key={`group-container-${groupIndex}`}>
          <rect
            x={groupStartX - 20}
            y={40}
            rx={15}
            ry={15}
            width={groupWidth + 40}
            height={60}
            fill="white"
            stroke={groupColor}
            strokeWidth="3"
            filter="url(#dropShadow)"
            opacity="0.9"
          />
          
          {/* 그룹 라벨 */}
          <text
            x={groupStartX + groupWidth / 2}
            y={35}
            fontSize="14"
            fontWeight="bold"
            textAnchor="middle"
            fill={groupColor}
            fontFamily="Arial, sans-serif"
          >
            그룹 {groupIndex + 1}
          </text>
        </g>
      );

      // 점들을 애니메이션과 함께 렌더링
      for (let dotIndex = 0; dotIndex < dotCount; dotIndex++) {
        const cx = groupStartX + dotIndex * (dotRadius * 2 + dotSpacing) + dotRadius;
        const cy = 70;
        
        elements.push(
          <g key={`group-${groupIndex}-dot-${dotIndex}`}>
            {/* 점의 배경 원 (더 큰 크기) */}
            <circle
              cx={cx}
              cy={cy}
              r={dotRadius + 2}
              fill={groupColor}
              opacity="0.2"
            />
            
            {/* 메인 점 */}
            <circle
              cx={cx}
              cy={cy}
              r={dotRadius}
              fill={`url(#dotGradient-${groupIndex % colors.length})`}
              stroke="white"
              strokeWidth="2"
              filter="url(#dropShadow)"
            >
              {/* 애니메이션 효과 */}
              <animate
                attributeName="r"
                values={`${dotRadius};${dotRadius + 2};${dotRadius}`}
                dur="2s"
                repeatCount="indefinite"
                begin={`${dotIndex * 0.1}s`}
              />
            </circle>
            
            {/* 점 번호 표시 */}
            <text
              x={cx}
              y={cy + 2}
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontFamily="Arial, sans-serif"
            >
              {dotIndex + 1}
            </text>
          </g>
        );
      }

      offsetX += groupWidth + groupSpacing;

      // 더하기 기호 (마지막 그룹이 아닌 경우)
      if (groupIndex < media.groups.length - 1) {
        const plusX = offsetX - groupSpacing / 2;
        
        elements.push(
          <g key={`plus-symbol-${groupIndex}`}>
            {/* 더하기 기호 배경 원 */}
            <circle
              cx={plusX}
              cy={70}
              r={20}
              fill="#FFB703"
              stroke="white"
              strokeWidth="3"
              filter="url(#dropShadow)"
            />
            
            {/* 더하기 기호 */}
            <g stroke="white" strokeWidth="4" strokeLinecap="round">
              <line x1={plusX - 8} y1={70} x2={plusX + 8} y2={70} />
              <line x1={plusX} y1={62} x2={plusX} y2={78} />
            </g>
            
            {/* 펄스 애니메이션 */}
            <circle
              cx={plusX}
              cy={70}
              r="15"
              fill="none"
              stroke="#FFB703"
              strokeWidth="2"
              opacity="0.6"
            >
              <animate
                attributeName="r"
                values="15;25;15"
                dur="1.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.6;0;0.6"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        );
      }
    });

    // 등호와 물음표
    const totalWidth = offsetX - groupSpacing;
    const equalsX = totalWidth + 40;
    
    elements.push(
      <g key="equals-question">
        {/* 등호 */}
        <g stroke="#2D3748" strokeWidth="4" strokeLinecap="round">
          <line x1={equalsX} y1={65} x2={equalsX + 20} y2={65} />
          <line x1={equalsX} y1={75} x2={equalsX + 20} y2={75} />
        </g>
        
        {/* 물음표 */}
        <text
          x={equalsX + 40}
          y={75}
          fontSize="32"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#E53E3E"
          fontFamily="Arial, sans-serif"
        >
          ?
          <animate
            attributeName="fill"
            values="#E53E3E;#FF6B9D;#E53E3E"
            dur="1s"
            repeatCount="indefinite"
          />
        </text>
      </g>
    );

    return (
      <div className="flex flex-col items-center gap-6">
        <svg
          width="100%"
          height="140"
          viewBox={`0 0 ${Math.max(600, totalWidth + 100)} 140`}
          className="max-w-5xl"
          role="img"
          aria-label={`${media.groups.join(' 더하기 ')} 점 그룹 덧셈 시각화`}
        >
          <title>덧셈 문제 시각화</title>
          {elements}
        </svg>
        
        {/* 수식 표시 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 shadow-lg">
          <div className="text-3xl font-bold text-gray-700 text-center">
            {media.groups.map((count, index) => (
              <span key={index}>
                <span className="text-4xl" style={{ color: colors[index % colors.length] }}>
                  {count}
                </span>
                {index < media.groups.length - 1 && (
                  <span className="text-orange-500 mx-2">+</span>
                )}
              </span>
            ))}
            <span className="text-gray-600 mx-2">=</span>
            <span className="text-red-500 text-4xl">?</span>
          </div>
        </div>
      </div>
    );
  }, [question.media]);

  return (
    <div className="flex flex-col items-center gap-8 w-full px-4">
      {/* 문제 제목 */}
      <div className="text-center">
        <h2 className="text-4xl font-extrabold text-gray-800 leading-tight mb-2">
          {question.question}
        </h2>
        {question.prompt && (
          <h3 className="text-2xl font-semibold text-gray-600">
            {question.prompt}
          </h3>
        )}
      </div>

      {/* 점 시각화 */}
      {dotsVisualization}

      {/* 선택지 버튼들 */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
        {question.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => !feedbackVisible && onAnswer(option)}
            disabled={feedbackVisible}
            className={`${baseButtonClasses} ${getAnswerButtonStyle(
              option,
              userAnswer,
              question.correctAnswers,
              feedbackVisible
            )} disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden`}
            aria-pressed={userAnswer === option}
            aria-label={`선택지 ${option}`}
          >
            {/* 버튼 배경 효과 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transition-opacity duration-300 transform -skew-x-12"></div>
            
            <span className="relative z-10 text-2xl font-bold">
              {option}
            </span>
          </button>
        ))}
      </div>

      {/* 진행 상황 표시 */}
      {!feedbackVisible && (
        <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm3.5 6L7 10.5 4.5 8 5.91 6.59 7 7.67l3.59-3.58L12 5.5z"/>
            </svg>
            💡 위의 점들을 세어서 정답을 선택하세요
          </div>
        </div>
      )}
    </div>
  );
}