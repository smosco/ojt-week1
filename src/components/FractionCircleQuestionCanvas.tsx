import { useMemo } from 'react';
import type { BaseQuestionProps } from '../types/common';
import type { ChoiceQuestion } from '../types/question';
import {
  baseButtonClasses,
  getMultipleAnswerButtonStyle,
} from '../utils/style';

interface Props extends BaseQuestionProps<string[]> {
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
      'FractionCircleQuestionCanvas requires media of type "fraction-circle"',
    );
  }

  const media = question.media;
  const { totalParts, filledParts, radius, fillColor, strokeColor } = media;

  // 다중 선택 여부 확인
  const isMultipleChoice = question.correctAnswers.length > 1;

  // 선택지 토글 함수
  const toggleOption = (option: string) => {
    if (feedbackVisible) return;

    if (isMultipleChoice) {
      // 다중 선택 모드
      const currentAnswers = userAnswer || [];
      const newAnswers = currentAnswers.includes(option)
        ? currentAnswers.filter((ans) => ans !== option)
        : [...currentAnswers, option];
      onAnswer(newAnswers);
    } else {
      // 단일 선택 모드
      onAnswer([option]);
    }
  };

  // 복잡한 SVG 원형 차트 생성 (기존 코드와 동일)
  const fractionVisualization = useMemo(() => {
    const center = { x: 150, y: 150 };
    const outerRadius = radius;

    const elements: React.ReactNode[] = [];

    // SVG 정의 (그라데이션, 패턴, 필터)
    elements.push(
      <defs key='definitions'>
        {/* 채워진 부분 그라데이션 */}
        <radialGradient id='filledGradient' cx='40%' cy='40%'>
          <stop offset='0%' stopColor={fillColor} stopOpacity='1' />
          <stop offset='50%' stopColor={fillColor} stopOpacity='0.8' />
          <stop offset='100%' stopColor={fillColor} stopOpacity='0.6' />
        </radialGradient>

        {/* 빈 부분 그라데이션 */}
        <radialGradient id='emptyGradient' cx='40%' cy='40%'>
          <stop offset='0%' stopColor='#ffffff' stopOpacity='0.9' />
          <stop offset='50%' stopColor='#f8f9fa' stopOpacity='0.7' />
          <stop offset='100%' stopColor='#e9ecef' stopOpacity='0.8' />
        </radialGradient>

        {/* 점선 패턴 */}
        <pattern
          id='dotPattern'
          x='0'
          y='0'
          width='8'
          height='8'
          patternUnits='userSpaceOnUse'
        >
          <circle cx='4' cy='4' r='1' fill={fillColor} opacity='0.3' />
        </pattern>

        {/* 그림자 필터 */}
        <filter id='circleShadow' x='-50%' y='-50%' width='200%' height='200%'>
          <feDropShadow
            dx='3'
            dy='3'
            stdDeviation='4'
            floodColor='#000000'
            floodOpacity='0.3'
          />
        </filter>

        {/* 내부 광택 효과 */}
        <filter id='innerGlow' x='-50%' y='-50%' width='200%' height='200%'>
          <feGaussianBlur stdDeviation='3' result='coloredBlur' />
          <feMerge>
            <feMergeNode in='coloredBlur' />
            <feMergeNode in='SourceGraphic' />
          </feMerge>
        </filter>
      </defs>,
    );

    // 메인 원의 조각들
    const slices: React.ReactNode[] = [];

    for (let i = 0; i < totalParts; i++) {
      const startAngle = (2 * Math.PI * i) / totalParts - Math.PI / 2;
      const endAngle = (2 * Math.PI * (i + 1)) / totalParts - Math.PI / 2;
      const isFilled = i < filledParts;

      // 외부 원의 좌표들
      const outerStartX = center.x + outerRadius * Math.cos(startAngle);
      const outerStartY = center.y + outerRadius * Math.sin(startAngle);
      const outerEndX = center.x + outerRadius * Math.cos(endAngle);
      const outerEndY = center.y + outerRadius * Math.sin(endAngle);

      const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

      // 일반 원형 슬라이스 경로
      const slicePath = `
        M ${center.x} ${center.y}
        L ${outerStartX} ${outerStartY}
        A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEndX} ${outerEndY}
        Z
      `;

      slices.push(
        <g key={`slice-${i}`}>
          {/* 슬라이스 배경 */}
          <path
            d={slicePath}
            fill={isFilled ? 'url(#filledGradient)' : 'url(#emptyGradient)'}
            stroke={strokeColor}
            strokeWidth='2'
            filter='url(#circleShadow)'
          />

          {/* 패턴 오버레이 (채워진 부분만) */}
          {isFilled && (
            <path d={slicePath} fill='url(#dotPattern)' opacity='0.4' />
          )}
        </g>,
      );
    }

    elements.push(<g key='main-slices'>{slices}</g>);

    return (
      <div className='flex flex-col items-center gap-6'>
        <svg
          width='300'
          height='300'
          viewBox='0 0 300 300'
          className='drop-shadow-2xl'
          role='img'
          aria-label={`${filledParts}/${totalParts} 분수를 나타내는 도넛형 차트`}
        >
          <title>
            {filledParts}/{totalParts} 분수 시각화
          </title>
          {elements}
        </svg>
      </div>
    );
  }, [totalParts, filledParts, radius, fillColor, strokeColor]);

  return (
    <div className='flex flex-col items-center gap-8 w-full px-4'>
      {/* 문제 제목 */}
      <div className='text-center'>
        <h2 className='text-4xl font-extrabold text-gray-800 leading-tight mb-2'>
          {question.question}
        </h2>
        {question.prompt && (
          <h3 className='text-2xl font-semibold text-gray-600'>
            {question.prompt}
          </h3>
        )}
      </div>

      {/* 분수 원형 시각화 */}
      {fractionVisualization}

      {/* 선택지 버튼들 */}
      <div className='grid grid-cols-2 gap-4 w-full max-w-md'>
        {question.options.map((option) => (
          <button
            key={option}
            type='button'
            onClick={() => toggleOption(option)}
            disabled={feedbackVisible}
            className={`${baseButtonClasses} ${getMultipleAnswerButtonStyle(
              option,
              userAnswer,
              question.correctAnswers,
              feedbackVisible,
            )} disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden`}
            aria-pressed={userAnswer?.includes(option) || false}
            aria-label={`선택지 ${option}`}
          >
            {/* 선택 표시 */}
            {userAnswer?.includes(option) && (
              <div className='absolute top-1 right-1'>
                {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 16 16'
                  fill='currentColor'
                >
                  <path d='M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm3.5 6L7 10.5 4.5 8 5.91 6.59 7 7.67l3.59-3.58L12 5.5z' />
                </svg>
              </div>
            )}

            {/* 선택지 내부 분수 미리보기 */}
            <div className='flex items-center justify-center gap-2'>
              <span className='text-2xl font-bold'>{option}</span>

              {/* 미니 원형 차트 */}
              {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                className='opacity-60'
              >
                {option.includes('/') &&
                  (() => {
                    const [num, denom] = option.split('/').map(Number);
                    if (Number.isNaN(num) || Number.isNaN(denom) || denom === 0)
                      return null;

                    const filled = Math.min(num, denom);
                    const total = denom;
                    const angle = (2 * Math.PI * filled) / total;

                    if (filled === total) {
                      return (
                        <circle
                          cx='12'
                          cy='12'
                          r='10'
                          fill='currentColor'
                          opacity='0.3'
                        />
                      );
                    }

                    const x = 12 + 10 * Math.cos(angle - Math.PI / 2);
                    const y = 12 + 10 * Math.sin(angle - Math.PI / 2);
                    const largeArc = angle > Math.PI ? 1 : 0;

                    return (
                      <path
                        d={`M 12 12 L 12 2 A 10 10 0 ${largeArc} 1 ${x} ${y} Z`}
                        fill='currentColor'
                        opacity='0.3'
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
        <div className='text-center text-lg text-gray-500 bg-gray-50 rounded-lg p-3'>
          {isMultipleChoice ? (
            <span>
              💡 색칠된 부분보다 큰 분수를 <strong>모두</strong> 선택하세요
              (여러 개 선택 가능)
            </span>
          ) : (
            <span>💡 색칠된 부분을 잘 보고 같은 크기의 분수를 선택하세요</span>
          )}
        </div>
      )}

      {/* 선택 현황 표시 (다중 선택인 경우) */}
      {isMultipleChoice &&
        !feedbackVisible &&
        userAnswer &&
        userAnswer.length > 0 && (
          <div className='text-center text-lg text-blue-600 bg-blue-50 rounded-lg p-3'>
            선택한 답: {userAnswer.join(', ')} ({userAnswer.length}개 선택됨)
          </div>
        )}
    </div>
  );
}
