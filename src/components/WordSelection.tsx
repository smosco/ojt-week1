import { useState } from 'react';

type Option = {
  word: string;
  isAnswer: boolean;
};

const options: Option[] = [
  { word: '발', isAnswer: false },
  { word: '신발', isAnswer: true },
  { word: '사과', isAnswer: false },
  { word: '식빵', isAnswer: false },
  { word: '고추', isAnswer: true },
  { word: '주먹', isAnswer: false },
];

export default function WordSelection() {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const isSelected = (word: string) => selected.includes(word);

  const toggleSelect = (word: string) => {
    if (submitted) return;
    setSelected((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word],
    );
  };

  const getOptionStyle = (word: string, isAnswer: boolean) => {
    if (!submitted) {
      return isSelected(word)
        ? 'fill-green-100 stroke-green-600'
        : 'fill-white stroke-gray-300';
    }

    if (isSelected(word)) {
      return isAnswer
        ? 'fill-green-100 stroke-green-600'
        : 'fill-red-100 stroke-red-600';
    }

    return 'fill-white stroke-gray-300';
  };

  const getFeedbackSymbol = (word: string, isAnswer: boolean) => {
    if (!submitted || !isSelected(word)) return null;

    return isAnswer ? '✅' : '❌';
  };

  const isCorrect =
    selected.every((word) => options.find((o) => o.word === word)?.isAnswer) &&
    options.filter((o) => o.isAnswer).every((o) => selected.includes(o.word));

  return (
    <div className='flex flex-col items-center gap-6 p-6'>
      <h2 className='text-xl font-bold'>
        주어진 말과 합하여 새로운 낱말이 되는 것을 모두 선택해 보세요.
      </h2>

      {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
      <svg width='500' height='300'>
        <text x='220' y='60' fontSize='20' fill='black'>
          풋
        </text>
        {options.map((opt, idx) => {
          const x = 50 + (idx % 3) * 150;
          const y = 100 + Math.floor(idx / 3) * 100;
          return (
            // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
            <g
              key={opt.word}
              onClick={() => toggleSelect(opt.word)}
              className={`cursor-pointer ${submitted ? 'pointer-events-none' : ''}`}
            >
              <rect
                x={x}
                y={y}
                width='120'
                height='50'
                rx='10'
                className={getOptionStyle(opt.word, opt.isAnswer)}
              />
              <text
                x={x + 60}
                y={y + 30}
                fill='black'
                fontSize='16'
                textAnchor='middle'
              >
                {opt.word}
              </text>
              {submitted && isSelected(opt.word) && (
                <text x={x + 100} y={y + 20} fontSize='18' textAnchor='middle'>
                  {getFeedbackSymbol(opt.word, opt.isAnswer)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {!submitted ? (
        <button
          type='button'
          onClick={() => setSubmitted(true)}
          className='mt-4 bg-blue-500 text-white px-4 py-2 rounded'
        >
          정답 확인
        </button>
      ) : (
        <p className='text-lg font-semibold'>
          {isCorrect ? '✅ 정답입니다!' : '❌ 다시 생각해보세요.'}
        </p>
      )}
    </div>
  );
}
