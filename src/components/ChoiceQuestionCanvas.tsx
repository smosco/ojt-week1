import { Canvas, Circle } from 'fabric';
import { useEffect, useRef } from 'react';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      selection: false,
      width: 600,
      height: 300,
    });
    fabricCanvas.current = canvas;

    if (question.media?.type === 'dots') {
      const {
        groups,
        dotRadius,
        dotSpacing,
        groupSpacing,
        dotColor,
        startX = 50,
        startY = 100,
      } = question.media;

      let x = startX;
      groups.forEach((count) => {
        for (let i = 0; i < count; i++) {
          const circle = new Circle({
            radius: dotRadius,
            fill: dotColor,
            left: x,
            top: startY,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
          });
          canvas.add(circle);
          x += dotSpacing;
        }
        x += groupSpacing;
      });
    }

    return () => {
      fabricCanvas.current?.dispose();
      fabricCanvas.current = null;
    };
  }, [question]);

  const getButtonClass = (opt: string) => {
    if (feedbackVisible) {
      if (question.correctAnswers.includes(opt))
        return 'bg-green-100 border-green-400';
      if (userAnswer === opt) return 'bg-red-100 border-red-400';
      return 'bg-gray-100 border-gray-300';
    }
    if (userAnswer === opt) return 'bg-yellow-100 border-yellow-300';
    return 'bg-white';
  };

  return (
    <div>
      <canvas ref={canvasRef} />
      <div className='mt-4 space-x-3'>
        {question.options.map((opt) => (
          <button
            type='button'
            key={opt}
            disabled={feedbackVisible}
            onClick={() => onAnswer(opt)}
            className={`px-4 py-2 text-base rounded-md border transition
              ${feedbackVisible ? 'cursor-default' : 'hover:bg-blue-50 cursor-pointer'}
              ${getButtonClass(opt)}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
