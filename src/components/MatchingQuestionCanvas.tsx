import { Canvas, Circle, FabricText, Line } from 'fabric';
import { useEffect, useRef, useState } from 'react';
import type { MatchingQuestion } from '../types/question';

interface Props {
  question: MatchingQuestion;
  onMatch: (matches: Record<string, string>) => void;
  feedbackVisible?: boolean;
}

interface MatchLine {
  from: string;
  to: string;
  line: Line;
}

export default function MatchingQuestionCanvas({
  question,
  onMatch,
  feedbackVisible = false,
}: Props) {
  const BASE_WIDTH = 900;
  const BASE_HEIGHT = 500;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<Canvas | null>(null);

  const [matches, setMatches] = useState<Record<string, string>>({});
  const [lines, setLines] = useState<MatchLine[]>([]);

  const leftPoints = useRef<Record<string, Circle>>({});
  const rightPoints = useRef<Record<string, Circle>>({});
  const startLabel = useRef<string | null>(null);
  const currentLine = useRef<Line | null>(null);

  const drawLinesFromMatches = (
    canvas: Canvas,
    matches: Record<string, string>,
    feedbackVisible: boolean,
  ) => {
    lines.forEach(({ line }) => canvas.remove(line));
    const newLines: MatchLine[] = [];

    Object.entries(matches).forEach(([from, to]) => {
      const fromPt = leftPoints.current[from];
      const toPt = rightPoints.current[to];
      if (!fromPt || !toPt) return;

      const isCorrect = question.correctMatches[from] === to;
      const strokeColor = feedbackVisible
        ? isCorrect
          ? '#34D399'
          : '#F87171'
        : '#94A3B8';

      const line = new Line(
        [fromPt.left ?? 0, fromPt.top ?? 0, toPt.left ?? 0, toPt.top ?? 0],
        {
          stroke: strokeColor,
          strokeWidth: 4,
          selectable: false,
          evented: false,
        },
      );

      canvas.add(line);
      canvas.sendObjectToBack(line);
      newLines.push({ from, to, line });
    });

    setLines(newLines);
    canvas.requestRenderAll();
  };

  // 캔버스 초기화 및 객체 추가
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new Canvas(canvasRef.current, { selection: false });
    fabricCanvas.current = canvas;

    // 기본 좌표계 설정
    canvas.setDimensions({ width: BASE_WIDTH, height: BASE_HEIGHT });

    const leftX = 120;
    const rightX = 780;
    const startY = 80;
    const gapY = 120;

    // 왼쪽 항목
    question.pairs.left.forEach((label, i) => {
      const y = startY + i * gapY;

      const text = new FabricText(label, {
        left: leftX,
        top: y,
        fontSize: 32,
        fontWeight: 'bold',
        fontFamily: 'Pretendard',
        fill: '#333',
        originX: 'left',
        originY: 'center',
        selectable: false,
      });

      const point = new Circle({
        left: leftX + 100,
        top: y,
        radius: 10,
        fill: '#7DD3FC',
        stroke: '#0EA5E9',
        strokeWidth: 2,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: true,
      });

      point.on('mousedown', () => {
        if (feedbackVisible) return;
        startLabel.current = label;

        setMatches((prev) => {
          const updated = { ...prev };
          delete updated[label];
          return updated;
        });

        const line = new Line(
          [point.left!, point.top!, point.left!, point.top!],
          {
            stroke: '#94A3B8',
            strokeWidth: 4,
            selectable: false,
            evented: false,
          },
        );

        currentLine.current = line;
        canvas.add(line);
        canvas.sendObjectToBack(line);
      });

      leftPoints.current[label] = point;
      canvas.add(text);
      canvas.add(point);
    });

    // 오른쪽 항목
    question.pairs.right.forEach((label, i) => {
      const y = startY + i * gapY;

      const text = new FabricText(label, {
        left: rightX,
        top: y,
        fontSize: 30,
        fontWeight: 'bold',
        fontFamily: 'Pretendard',
        fill: '#333',
        originX: 'right',
        originY: 'center',
        selectable: false,
      });

      const point = new Circle({
        left: rightX - 100,
        top: y,
        radius: 10,
        fill: '#FBCFE8',
        stroke: '#EC4899',
        strokeWidth: 2,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: true,
      });

      point.on('mouseup', () => {
        if (feedbackVisible) return;
        const start = startLabel.current;
        if (!start) return;

        if (currentLine.current) {
          currentLine.current.set({
            x2: point.left!,
            y2: point.top!,
          });
        }

        setMatches((prev) => {
          const updated = { ...prev };
          Object.entries(updated).forEach(([from, to]) => {
            if (from === start || to === label) delete updated[from];
          });
          updated[start] = label;
          return updated;
        });

        currentLine.current = null;
        startLabel.current = null;
      });

      rightPoints.current[label] = point;
      canvas.add(text);
      canvas.add(point);
    });

    canvas.on('mouse:move', (opt) => {
      if (currentLine.current) {
        const pointer = canvas.getPointer(opt.e);
        currentLine.current.set({ x2: pointer.x, y2: pointer.y });
        canvas.requestRenderAll();
      }
    });

    canvas.on('mouse:up', () => {
      if (currentLine.current) {
        canvas.remove(currentLine.current);
        currentLine.current = null;
      }
    });

    // 줌은 모든 객체 추가 후 마지막에
    const updateZoom = () => {
      const container = containerRef.current;
      if (!container) return;
      const zoom = Math.min(container.offsetWidth / BASE_WIDTH, 1);
      canvas.setZoom(zoom);
      canvas.setDimensions({
        width: BASE_WIDTH * zoom,
        height: BASE_HEIGHT * zoom,
      });
    };

    updateZoom();
    window.addEventListener('resize', updateZoom);

    return () => {
      window.removeEventListener('resize', updateZoom);
      canvas.dispose();
      fabricCanvas.current = null;
    };
  }, [question.id]);

  // matches나 feedbackVisible이 변경되면 라인 다시 그림
  useEffect(() => {
    if (!fabricCanvas.current) return;
    drawLinesFromMatches(fabricCanvas.current, matches, feedbackVisible);
    onMatch(matches);
  }, [matches, feedbackVisible]);

  return (
    <div className='flex flex-col items-center gap-4'>
      <h2 className='font-gmarket text-4xl font-extrabold text-center'>
        {question.question}
      </h2>

      <div ref={containerRef} className='w-full'>
        <canvas ref={canvasRef} />
      </div>

      <div className='text-lg text-gray-500 text-center'>
        💡 왼쪽 항목을 클릭한 후 오른쪽 항목으로 드래그하여 연결하세요
        <br />
        연결된 개수: {Object.keys(matches).length} /{' '}
        {question.pairs.left.length}
      </div>
    </div>
  );
}
