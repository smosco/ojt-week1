import { useMemo } from 'react';
import type { ChoiceQuestion } from '../types/question';

interface Props {
  question: ChoiceQuestion;
  onAnswer: (selected: string) => void;
  userAnswer?: string;
  feedbackVisible?: boolean;
}

export default function ChoiceQuestionCanvas({
  question,
  onAnswer,
  userAnswer,
  feedbackVisible,
}: Props) {
  const colors = ['#FFD1DC', '#A7E0F9'];
  const dotRadius = 16;
  const spacing = 10;
  const groupGap = 60;

  const getButtonStyle = (opt: string) => {
    if (feedbackVisible) {
      if (question.correctAnswers.includes(opt))
        return 'bg-green-200 text-green-900';
      if (userAnswer === opt) return 'bg-red-200 text-red-900';
      return 'bg-gray-100 text-gray-600';
    }
    if (userAnswer === opt) return 'bg-yellow-200 text-yellow-900';
    return 'bg-white text-[#333]';
  };

  const svgGroups = useMemo(() => {
    const result: React.ReactNode[] = [];
    let offsetX = 0;

    if (question.media && question.media.type === 'dots') {
      const media = question.media;
      media.groups.forEach((count, groupIdx) => {
        const groupWidth = count * (dotRadius * 2 + spacing) - spacing;
        const startX = offsetX;

        result.push(
          <rect
            key={`group-bg-${
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              groupIdx
            }`}
            x={startX - 12}
            y={44}
            rx={20}
            ry={20}
            width={groupWidth + 24}
            height={44}
            fill='#fff'
            stroke={colors[groupIdx % colors.length]}
            strokeWidth={2}
          />,
        );

        for (let i = 0; i < count; i++) {
          const cx = startX + i * (dotRadius * 2 + spacing) + dotRadius;
          result.push(
            <circle
              key={`g${groupIdx}-d${i}`}
              cx={cx}
              cy={66}
              r={dotRadius}
              fill={colors[groupIdx % colors.length]}
            />,
          );
        }

        offsetX += groupWidth + groupGap;

        if (groupIdx < media.groups.length - 1) {
          result.push(
            <text
              key={`plus-${
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                groupIdx
              }`}
              x={offsetX - groupGap / 2}
              y={66}
              fontSize={28}
              textAnchor='middle'
              dominantBaseline='middle'
              fill='#FFB703'
              fontWeight='bold'
            >
              +
            </text>,
          );
        }
      });
    }
    return result;
  }, [question]);

  return (
    <div className='flex flex-col items-center gap-6 w-full px-4'>
      <h2 className='text-4xl font-extrabold text-[#333] tracking-wide text-center'>
        {question.prompt}
      </h2>

      {question.media?.type === 'dots' && (
        <svg
          width='100%'
          height='120'
          viewBox='0 0 500 120'
          className='max-w-3xl'
        >
          <title>점 그룹 시각화</title>
          {svgGroups}
        </svg>
      )}

      {question.media?.type === 'dots' && (
        <div className='text-2xl font-bold text-[#333]'>
          {question.media.groups.join(' + ')} = ?
        </div>
      )}

      <div className='grid grid-cols-2 gap-4 w-full max-w-md'>
        {question.options.map((opt) => (
          <button
            type='button'
            key={opt}
            onClick={() => onAnswer(opt)}
            disabled={feedbackVisible}
            className={`px-6 py-4 text-xl font-bold rounded-xl shadow-md transition transform hover:scale-105 active:scale-95 ${getButtonStyle(
              opt,
            )}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
