import { useMemo } from 'react';
import type { ChoiceQuestion } from '../types/question';
import { BaseQuestionProps, getAnswerButtonStyle, baseButtonClasses, createSVGPath } from '../types/common';

interface Props extends BaseQuestionProps<string> {
  question: ChoiceQuestion;
}

export default function FractionCircleQuestionCanvas({
  question,
  onAnswer,
  userAnswer,
  feedbackVisible = false,
}: Props) {
  // 분수 원형 미디어 검증
  if (!question.media || question.media.type !== 'fraction-circle') {
    throw new Error(
      'FractionCircleQuestionCanvas requires media of type "fraction-circle"'
    );
  }

  const media = question.media;
  const { totalParts, filledParts, radius, fillColor, strokeColor } = media;

  // 복잡한 SVG 원형 차트 생성 (다양한 SVG 태그 활용)
  const fractionVisualization = useMemo(() => {
    const center = { x: 150, y: 150 };
    const innerRadius = radius * 0.6;
    const outerRadius = radius;
    
    const elements: React.ReactNode[] = [];

    // SVG 정의 (그라데이션, 패턴, 필터)
    elements.push(
      <defs key="definitions">
        {/* 채워진 부분 그라데이션 */}
        <radialGradient id="filledGradient" cx="40%" cy="40%">
          <stop offset="0%" stopColor={fillColor} stopOpacity="1" />
          <stop offset="50%" stopColor={fillColor} stopOpacity="0.8" />
          <stop offset="100%" stopColor={fillColor} stopOpacity="0.6" />
        </radialGradient>
        
        {/* 빈 부분 그라데이션 */}
        <radialGradient id="emptyGradient" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#f8f9fa" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#e9ecef" stopOpacity="0.8" />
        </radialGradient>
        
        {/* 점선 패턴 */}
        <pattern id="dotPattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="1" fill={fillColor} opacity="0.3" />
        </pattern>
        
        {/* 그림자 필터 */}
        <filter id="circleShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="3" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.3"/>
        </filter>
        
        {/* 내부 광택 효과 */}
        <filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    );

    // 배경 원 (장식용)
    elements.push(
      <g key="background-circles">
        <circle
          cx={center.x}
          cy={center.y}
          r={outerRadius + 20}
          fill="none"
          stroke="#e9ecef"
          strokeWidth="2"
          strokeDasharray="5,5"
          opacity="0.5"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values={`0 ${center.x} ${center.y};360 ${center.x} ${center.y}`}
            dur="20s"
            repeatCount="indefinite"
          />
        </circle>
        
        <circle
          cx={center.x}
          cy={center.y}
          r={outerRadius + 10}
          fill="none"
          stroke="#dee2e6"
          strokeWidth="1"
          opacity="0.3"
        />
      </g>
    );

    // 메인 원의 조각들
    const slices: React.ReactNode[] = [];
    
    for (let i = 0; i < totalParts; i++) {
      const startAngle = (2 * Math.PI * i) / totalParts - Math.PI / 2;
      const endAngle = (2 * Math.PI * (i + 1)) / totalParts - Math.PI / 2;
      const isFilled = i < filledParts;
      
      // 외부 경로
      const outerPath = createSVGPath(center, outerRadius, startAngle, endAngle);
      
      // 내부 경로 (도넛 모양을 위해)
      const innerStartX = center.x + innerRadius * Math.cos(startAngle);
      const innerStartY = center.y + innerRadius * Math.sin(startAngle);
      const innerEndX = center.x + innerRadius * Math.cos(endAngle);
      const innerEndY = center.y + innerRadius * Math.sin(endAngle);
      
      const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
      
      const donutPath = `
        M ${center.x + outerRadius * Math.cos(startAngle)} ${center.y + outerRadius * Math.sin(startAngle)}
        A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${center.x + outerRadius * Math.cos(endAngle)} ${center.y + outerRadius * Math.sin(endAngle)}
        L ${innerEndX} ${innerEndY}
        A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStartX} ${innerStartY}
        Z
      `;

      slices.push(
        <g key={`slice-${i}`}>
          {/* 슬라이스 배경 */}
          <path
            d={donutPath}
            fill={isFilled ? 'url(#filledGradient)' : 'url(#emptyGradient)'}
            stroke={strokeColor}
            strokeWidth="2"
            filter="url(#circleShadow)"
          />
          
          {/* 패턴 오버레이 (채워진 부분만) */}
          {isFilled && (
            <path
              d={donutPath}
              fill="url(#dotPattern)"
              opacity="0.4"
            />
          )}
          
          {/* 분할선 강조 */}
          <line
            x1={center.x}
            y1={center.y}
            x2={center.x + outerRadius * Math.cos(startAngle)}
            y2={center.y + outerRadius * Math.sin(startAngle)}
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* 숫자 라벨 */}
          <text
            x={center.x + (outerRadius + innerRadius) / 2 * Math.cos(startAngle + (endAngle - startAngle) / 2)}
            y={center.y + (outerRadius + innerRadius) / 2 * Math.sin(startAngle + (endAngle - startAngle) / 2)}
            fontSize="14"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={isFilled ? 'white' : strokeColor}
            fontFamily="Arial, sans-serif"
          >
            {i + 1}
          </text>
          
          {/* 애니메이션 효과 (호버 시뮬레이션) */}
          {isFilled && (
            <path
              d={donutPath}
              fill="white"
              opacity="0"
            >
              <animate
                attributeName="opacity"
                values="0;0.2;0"
                dur="3s"
                begin={`${i * 0.2}s`}
                repeatCount="indefinite"
              />
            </path>
          )}
        </g>
      );
    }

    elements.push(
      <g key="main-slices">
        {slices}
      </g>
    );

    // 중앙 원 (장식)
    elements.push(
      <g key="center-circle">
        <circle
          cx={center.x}
          cy={center.y}
          r={innerRadius}
          fill="white"
          stroke={strokeColor}
          strokeWidth="3"
          filter="url(#circleShadow)"
        />
        
        {/* 중앙 분수 표시 */}
        <text
          x={center.x}
          y={center.y - 10}
          fontSize="24"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={fillColor}
          fontFamily="Arial, sans-serif"
        >
          {filledParts}
        </text>
        
        <line
          x1={center.x - 20}
          y1={center.y}
          x2={center.x + 20}
          y2={center.y}
          stroke={strokeColor}
          strokeWidth="2"
        />
        
        <text
          x={center.x}
          y={center.y + 20}
          fontSize="24"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={strokeColor}
          fontFamily="Arial, sans-serif"
        >
          {totalParts}
        </text>
      </g>
    );

    // 범례
    elements.push(
      <g key="legend">
        {/* 채워진 부분 범례 */}
        <rect
          x="20"
          y="20"
          width="20"
          height="15"
          fill="url(#filledGradient)"
          stroke={strokeColor}
          strokeWidth="1"
          rx="3"
        />
        <text
          x="50"
          y="32"
          fontSize="14"
          fill={strokeColor}
          fontFamily="Arial, sans-serif"
        >
          색칠된 부분
        </text>
        
        {/* 빈 부분 범례 */}
        <rect
          x="20"
          y="45"
          width="20"
          height="15"
          fill="url(#emptyGradient)"
          stroke={strokeColor}
          strokeWidth="1"
          rx="3"
        />
        <text
          x="50"
          y="57"
          fontSize="14"
          fill={strokeColor}
          fontFamily="Arial, sans-serif"
        >
          빈 부분
        </text>
      </g>
    );

    return (
      <div className="flex flex-col items-center gap-6">
        <svg 
          width="300" 
          height="300" 
          viewBox="0 0 300 300"
          className="drop-shadow-2xl"
          role="img"
          aria-label={`${filledParts}/${totalParts} 분수를 나타내는 도넛형 차트`}
        >
          <title>{filledParts}/{totalParts} 분수 시각화</title>
          {elements}
        </svg>
        
        {/* 분수 설명 */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 shadow-lg">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">색칠된 부분은</div>
            <div className="text-4xl font-bold text-indigo-600">
              {filledParts}
              <span className="text-2xl text-gray-500">/{totalParts}</span>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              전체 {totalParts}개 중 {filledParts}개
            </div>
          </div>
        </div>
      </div>
    );
  }, [totalParts, filledParts, radius, fillColor, strokeColor]);

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

      {/* 분수 원형 시각화 */}
      {fractionVisualization}

      {/* 선택지 버튼들 */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
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
            {/* 선택지 내부 분수 미리보기 */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold">{option}</span>
              
              {/* 미니 원형 차트 */}
              <svg width="24" height="24" viewBox="0 0 24 24" className="opacity-60">
                {option.includes('/') && (() => {
                  const [num, denom] = option.split('/').map(Number);
                  if (isNaN(num) || isNaN(denom) || denom === 0) return null;
                  
                  const filled = Math.min(num, denom);
                  const total = denom;
                  const angle = (2 * Math.PI * filled) / total;
                  
                  if (filled === total) {
                    return <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.3" />;
                  }
                  
                  const x = 12 + 10 * Math.cos(angle - Math.PI / 2);
                  const y = 12 + 10 * Math.sin(angle - Math.PI / 2);
                  const largeArc = angle > Math.PI ? 1 : 0;
                  
                  return (
                    <path
                      d={`M 12 12 L 12 2 A 10 10 0 ${largeArc} 1 ${x} ${y} Z`}
                      fill="currentColor"
                      opacity="0.3"
                    />
                  );
                })()}
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* 도움말 */}
      {!feedbackVisible && (
        <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
          💡 색칠된 부분을 잘 보고 같은 크기의 분수를 모두 선택하세요
        </div>
      )}
    </div>
  );
}