import type { ChoiceQuestion } from '../types/question';

interface Props {
  question: ChoiceQuestion;
  onAnswer: (selected: string) => void;
  userAnswer?: string;
  feedbackVisible?: boolean;
}

export default function FractionCircleQuestionCanvas({
  question,
  onAnswer,
  userAnswer,
  feedbackVisible = false,
}: Props) {
  if (!question.media || question.media.type !== 'fraction-circle') {
    throw new Error(
      'FractionCircleQuestionCanvas: media must be of type fraction-circle',
    );
  }
  const { totalParts, filledParts, radius, fillColor, strokeColor } =
    question.media;

  const getButtonClass = (opt: string) => {
    if (feedbackVisible) {
      if (question.correctAnswers.includes(opt))
        return 'bg-green-200 text-green-900';
      if (userAnswer === opt) return 'bg-red-200 text-red-900';
      return 'bg-gray-100 text-gray-600';
    }
    if (userAnswer === opt) return 'bg-yellow-200 text-yellow-900';
    return 'bg-white text-[#333]';
  };

  const center = 100;
  const slices = Array.from({ length: totalParts }).map((_, i) => {
    const startAngle = (2 * Math.PI * i) / totalParts;
    const endAngle = (2 * Math.PI * (i + 1)) / totalParts;

    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return (
      <path
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        key={i}
        d={pathData}
        fill={i < filledParts ? fillColor : '#eee'}
        stroke={strokeColor}
        strokeWidth='2'
      />
    );
  });

  return (
    <div className='flex flex-col items-center gap-6 w-full px-4'>
      <h2 className='text-3xl font-extrabold text-[#333] tracking-wide text-center'>
        {question.prompt}
      </h2>

      {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
      <svg width='200' height='200' viewBox='0 0 200 200'>
        {slices}
      </svg>

      <div className='grid grid-cols-2 gap-4 w-full max-w-md'>
        {question.options.map((opt) => (
          <button
            type='button'
            key={opt}
            onClick={() => onAnswer(opt)}
            disabled={feedbackVisible}
            className={`px-6 py-4 text-xl font-bold rounded-xl shadow-md transition transform hover:scale-105 active:scale-95 ${getButtonClass(
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
