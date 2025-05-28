import { Canvas, Circle, FabricText, Line } from 'fabric';
import { useEffect, useRef, useState } from 'react';
import type { MatchingQuestion } from '../types/question';
import ResponsiveCanvasWrapper from './common/ResponsiveCanvasWrapper';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<Canvas | null>(null);

  const [matches, setMatches] = useState<Record<string, string>>({});
  const [lines, setLines] = useState<MatchLine[]>([]);

  const leftPoints = useRef<Record<string, Circle>>({});
  const rightPoints = useRef<Record<string, Circle>>({});
  const startLabel = useRef<string | null>(null);
  const currentLine = useRef<Line | null>(null);

  // matches로 라인 그리는 함수
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

  // 기본 라인 그림
  useEffect(() => {
    if (!fabricCanvas.current) return;
    drawLinesFromMatches(fabricCanvas.current, matches, feedbackVisible);
    onMatch(matches);
  }, [matches, feedbackVisible]);

  // 포인트 그리기 및 이벤트 등록
  useEffect(() => {
    if (!canvasRef.current || fabricCanvas.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: 900,
      height: 500,
      selection: false,
    });
    fabricCanvas.current = canvas;

    const leftX = 120;
    const rightX = 780;
    const startY = 80;
    const gapY = 120;

    question.pairs.left.forEach((label, i) => {
      const y = startY + i * gapY;

      const text = new FabricText(label, {
        left: leftX,
        top: y,
        fontSize: 32,
        fontWeight: 'bold',
        fill: '#333',
        originX: 'left',
        originY: 'center',
        selectable: false,
        evented: false,
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

        const fromPt = point;
        startLabel.current = label;

        setMatches((prev) => {
          const updated = { ...prev };
          Object.entries(updated).forEach(([from]) => {
            if (from === label) delete updated[from];
          });
          return updated;
        });

        const line = new Line(
          [
            fromPt.left ?? 0,
            fromPt.top ?? 0,
            fromPt.left ?? 0,
            fromPt.top ?? 0,
          ],
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

    question.pairs.right.forEach((label, i) => {
      const y = startY + i * gapY;

      const text = new FabricText(label, {
        left: rightX,
        top: y,
        fontSize: 30,
        fontWeight: 'bold',
        fill: '#333',
        originX: 'right',
        originY: 'center',
        selectable: false,
        evented: false,
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

        const toPt = point;
        if (currentLine.current) {
          currentLine.current.set({
            x2: toPt.left ?? 0,
            y2: toPt.top ?? 0,
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
        const pointer = canvas.getViewportPoint(opt.e);
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

    return () => {
      fabricCanvas.current?.dispose();
      fabricCanvas.current = null;
    };
  }, [question.id, feedbackVisible]);

  // 피드백 라인 그림
  useEffect(() => {
    if (!fabricCanvas.current) return;
    drawLinesFromMatches(fabricCanvas.current, matches, feedbackVisible);
  }, [feedbackVisible]);

  return (
    <div className='flex flex-col items-center gap-4'>
      <h2 className='text-4xl font-extrabold text-center'>
        {question.question}
      </h2>
      <ResponsiveCanvasWrapper width={900} height={500}>
        <canvas ref={canvasRef} />
      </ResponsiveCanvasWrapper>

      <div className='text-lg text-gray-500 text-center'>
        💡 왼쪽 항목을 클릭한 후 오른쪽 항목으로 드래그하여 연결하세요
        <br />
        연결된 개수: {Object.keys(matches).length} /{' '}
        {question.pairs.left.length}
      </div>
    </div>
  );
}
