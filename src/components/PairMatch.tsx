import { Canvas, Circle, FabricText, Line } from 'fabric';
import { useEffect, useRef, useState } from 'react';
import type { MatchQuestion } from '../types/question';

type Props = {
  question: MatchQuestion;
};

type MatchLine = {
  from: string;
  to: string;
  line: Line;
};

export default function PairMatch({ question }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<Canvas | null>(null);

  const [lines, setLines] = useState<MatchLine[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const leftPoints = useRef<Record<string, Circle>>({});
  const rightPoints = useRef<Record<string, Circle>>({});
  const labelPositions = useRef<Record<string, { x: number; y: number }>>({});

  const currentLine = useRef<Line | null>(null);
  const startLabel = useRef<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      selection: false,
      hoverCursor: 'pointer',
    });

    fabricCanvas.current = canvas;

    const offsetX = 50;
    const rightX = 450;
    const offsetY = 80;
    const gapY = 80;

    // 좌측 텍스트 + 포인트
    question.leftOptions.forEach((label, i) => {
      const y = offsetY + i * gapY;

      const text = new FabricText(label, {
        left: offsetX,
        top: y,
        fontSize: 18,
        originX: 'left',
        originY: 'center',
        selectable: false,
      });

      const point = new Circle({
        left: offsetX + 120,
        top: y,
        radius: 5,
        fill: 'gray',
        originX: 'center',
        originY: 'center',
        selectable: false,
      });

      point.on('mousedown', () => {
        if (submitted) return;

        const { left, top } = point;
        if (!left || !top) return;

        const line = new Line([left, top, left, top], {
          stroke: 'gray',
          strokeWidth: 2,
          selectable: false,
        });

        canvas.add(line);
        currentLine.current = line;
        startLabel.current = label;
      });

      labelPositions.current[label] = { x: point.left!, y: point.top! };
      leftPoints.current[label] = point;

      canvas.add(text, point);
    });

    // 우측 텍스트 + 포인트
    question.rightOptions.forEach((label, i) => {
      const y = offsetY + i * gapY;

      const text = new FabricText(label, {
        left: rightX,
        top: y,
        fontSize: 18,
        originX: 'left',
        originY: 'center',
        selectable: false,
      });

      const point = new Circle({
        left: rightX - 20,
        top: y,
        radius: 5,
        fill: 'gray',
        originX: 'center',
        originY: 'center',
        selectable: false,
      });

      point.on('mouseup', () => {
        if (submitted || !currentLine.current || !startLabel.current) return;

        const { left, top } = point;
        if (!left || !top) return;

        currentLine.current.set({ x2: left, y2: top });
        canvas.renderAll();

        const from = startLabel.current;
        const to = label;

        setLines((prev) => [...prev, { from, to, line: currentLine.current! }]);
        currentLine.current = null;
        startLabel.current = null;
      });

      labelPositions.current[label] = { x: point.left!, y: point.top! };
      rightPoints.current[label] = point;

      canvas.add(text, point);
    });

    // 실시간 선 따라다니기
    canvas.on('mouse:move', (e) => {
      if (!currentLine.current || !e.pointer) return;
      currentLine.current.set({ x2: e.pointer.x, y2: e.pointer.y });
      canvas.renderAll();
    });

    return () => {
      canvas.dispose();
    };
  }, [question, submitted]);

  const handleCheck = () => {
    if (!fabricCanvas.current) return;
    setSubmitted(true);

    lines.forEach(({ from, to, line }) => {
      const isCorrect = question.correctPairs.some(
        ([correctFrom, correctTo]) => correctFrom === from && correctTo === to,
      );
      line.set({ stroke: isCorrect ? 'green' : 'red' });
    });

    fabricCanvas.current.renderAll();
  };

  return (
    <div className='flex flex-col items-center p-6 gap-4'>
      <h2 className='text-xl font-bold'>{question.question}</h2>
      <canvas ref={canvasRef} width={700} height={500} />
      {!submitted ? (
        <button
          type='button'
          className='bg-blue-500 text-white px-4 py-2 rounded'
          onClick={handleCheck}
        >
          정답 확인
        </button>
      ) : (
        <p className='text-lg font-semibold text-gray-700'>
          {lines.every(({ from, to }) =>
            question.correctPairs.some(([a, b]) => a === from && b === to),
          )
            ? '✅ 정답입니다!'
            : '❌ 다시 확인해보세요.'}
        </p>
      )}
    </div>
  );
}
