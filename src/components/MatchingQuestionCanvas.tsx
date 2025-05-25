import { Canvas, Circle, FabricText, Line } from 'fabric';
import { useEffect, useRef, useState } from 'react';
import type { MatchingQuestion } from '../types/question';

interface Props {
  question: MatchingQuestion;
  onMatch: (matches: Record<string, string>) => void;
  userAnswer?: Record<string, string>;
  feedbackVisible?: boolean;
}

interface LineWithData extends Line {
  data?: { from: string; to: string };
}

export default function MatchingQuestionCanvas({
  question,
  onMatch,
  userAnswer = {},
  feedbackVisible = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<Canvas | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});

  const linesRef = useRef<Line[]>([]);
  const leftPoints = useRef<Record<string, Circle>>({});
  const rightPoints = useRef<Record<string, Circle>>({});
  const startLabel = useRef<string | null>(null);
  const currentLine = useRef<Line | null>(null);

  const removeExistingLine = (from?: string, to?: string) => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;
    linesRef.current = linesRef.current.filter((line) => {
      const l = line as LineWithData;
      const isMatch =
        (from && l.data?.from === from) || (to && l.data?.to === to);
      if (isMatch && canvas.getObjects().includes(line)) {
        canvas.remove(line);
      }
      return !isMatch;
    });
  };

  useEffect(() => {
    if (!canvasRef.current || fabricCanvas.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 500,
      selection: false,
    });
    fabricCanvas.current = canvas;

    const leftX = 120;
    const rightX = 680;
    const startY = 80;
    const gapY = 80;

    question.pairs.left.forEach((label, i) => {
      const y = startY + i * gapY;

      const text = new FabricText(label, {
        left: leftX,
        top: y,
        fontSize: 22,
        fontWeight: 'bold',
        fill: '#333',
        originX: 'left',
        originY: 'center',
        selectable: false,
        evented: false,
      });

      const point = new Circle({
        left: leftX + text.width! + 20,
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

        if (matches[label]) {
          removeExistingLine(label);
          const updated = { ...matches };
          delete updated[label];
          setMatches(updated);
        }

        startLabel.current = label;
        const line = new Line(
          [point.left!, point.top!, point.left!, point.top!],
          {
            stroke: '#94A3B8',
            strokeWidth: 4,
            selectable: false,
            evented: false,
          },
        ) as LineWithData;
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
        fontSize: 22,
        fontWeight: 'bold',
        fill: '#333',
        originX: 'right',
        originY: 'center',
        selectable: false,
        evented: false,
      });

      const point = new Circle({
        left: rightX - text.width! - 20,
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
        if (!start || !leftPoints.current[start]) return;

        const existingTargets = Object.values(matches);
        if (existingTargets.includes(label)) return;

        const from = leftPoints.current[start];
        const to = point;

        removeExistingLine(start);
        removeExistingLine(undefined, label);

        if (currentLine.current) {
          currentLine.current.set({ x2: to.left, y2: to.top });
          (currentLine.current as LineWithData).data = {
            from: start,
            to: label,
          };
          canvas.requestRenderAll();
          linesRef.current.push(currentLine.current);

          setMatches((prev) => {
            const newMatches = { ...prev, [start]: label };
            if (Object.keys(newMatches).length === question.pairs.left.length) {
              onMatch(newMatches);
            }
            return newMatches;
          });
        }

        startLabel.current = null;
        currentLine.current = null;
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

    return () => {
      if (fabricCanvas.current) {
        fabricCanvas.current.dispose();
        fabricCanvas.current = null;
      }
    };
  }, [question, feedbackVisible]);

  useEffect(() => {
    setMatches({});
  }, [question.id]);

  useEffect(() => {
    if (!feedbackVisible || !fabricCanvas.current) return;
    const canvas = fabricCanvas.current;
    Object.entries(userAnswer).forEach(([from, to]) => {
      const fromPt = leftPoints.current[from];
      const toPt = rightPoints.current[to];
      if (!fromPt || !toPt) return;
      const isCorrect = question.correctMatches[from] === to;
      const line = new Line(
        [fromPt.left!, fromPt.top!, toPt.left!, toPt.top!],
        {
          stroke: isCorrect ? '#34D399' : '#F87171',
          strokeWidth: 4,
          selectable: false,
          evented: false,
        },
      );
      canvas.add(line);
    });
    canvas.requestRenderAll();
  }, [feedbackVisible, userAnswer]);

  return <canvas ref={canvasRef} />;
}
