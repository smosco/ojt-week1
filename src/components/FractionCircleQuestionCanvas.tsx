import { Canvas, Path } from 'fabric';
import { useEffect, useRef } from 'react';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      selection: false,
      width: 300,
      height: 300,
    });
    fabricCanvas.current = canvas;

    if (question.media?.type === 'fraction-circle') {
      const {
        totalParts,
        filledParts,
        radius,
        fillColor,
        strokeColor,
        centerX = 150,
        centerY = 150,
      } = question.media;

      const anglePerPart = 360 / totalParts;

      for (let i = 0; i < totalParts; i++) {
        const startAngle = (anglePerPart * i * Math.PI) / 180;
        const endAngle = (anglePerPart * (i + 1) * Math.PI) / 180;

        const x1 = centerX + radius * Math.cos(startAngle);
        const y1 = centerY + radius * Math.sin(startAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = centerY + radius * Math.sin(endAngle);

        const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

        const slice = new Path(pathData, {
          fill: i < filledParts ? fillColor : '#eee',
          stroke: strokeColor,
          strokeWidth: 1,
          selectable: false,
          evented: false,
        });
        canvas.add(slice);
      }
    }

    return () => {
      fabricCanvas.current?.dispose();
      fabricCanvas.current = null;
    };
  }, [question]);

  const getButtonClass = (opt: string) => {
    if (userAnswer !== opt) {
      return 'bg-white border border-gray-300';
    }

    if (feedbackVisible) {
      return question.correctAnswers.includes(opt)
        ? 'bg-green-100 border-green-500'
        : 'bg-red-100 border-red-500';
    }

    return 'bg-blue-100 border-blue-500';
  };

  return (
    <div>
      <canvas ref={canvasRef} />
      <div className='mt-4 flex flex-wrap gap-3'>
        {question.options.map((opt) => (
          <button
            key={opt}
            type='button'
            onClick={() => onAnswer(opt)}
            disabled={feedbackVisible}
            className={`px-4 py-2 text-base rounded-md transition
              ${getButtonClass(opt)}
              ${feedbackVisible ? 'cursor-default' : 'hover:bg-blue-50 cursor-pointer'}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
