import { Canvas, Circle, FabricText, Line } from 'fabric';
import { useEffect, useRef, useState } from 'react';
import type { MatchingQuestion } from '../types/question';

interface Props {
  question: MatchingQuestion;
  onMatch: (matches: Record<string, string>) => void;
  userAnswer?: Record<string, string>;
  feedbackVisible?: boolean;
}

// Line에 data 프로퍼티를 추가한 커스텀 타입 선언
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
      width: 700,
      height: 400,
      selection: false,
    });
    fabricCanvas.current = canvas;

    const leftStartX = 100;
    const rightStartX = 600;
    const startY = 50;
    const gapY = 60;

    question.pairs.left.forEach((label, i) => {
      const y = startY + i * gapY;
      const text = new FabricText(label, {
        left: leftStartX,
        top: y,
        fontSize: 16,
        originX: 'left',
        originY: 'center',
        selectable: false,
        evented: false,
      });
      const point = new Circle({
        left: leftStartX - 20,
        top: y,
        radius: 6,
        fill: 'blue',
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: true,
      });
      point.on('mousedown', () => {
        if (feedbackVisible) return;

        // 기존 연결 제거
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
            stroke: 'black',
            strokeWidth: 2,
            selectable: false,
            evented: false,
          },
        ) as LineWithData;
        currentLine.current = line;
        canvas.add(line);
        // @ts-ignore
        canvas.sendToBack(line); // 라인을 항상 맨 아래로 보내기
      });
      leftPoints.current[label] = point;
      canvas.add(text);
      canvas.add(point);
    });

    question.pairs.right.forEach((label, i) => {
      const y = startY + i * gapY;
      const text = new FabricText(label, {
        left: rightStartX,
        top: y,
        fontSize: 16,
        originX: 'right',
        originY: 'center',
        selectable: false,
        evented: false,
      });
      const point = new Circle({
        left: rightStartX + 20,
        top: y,
        radius: 6,
        fill: 'red',
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: true,
      });
      point.on('mouseup', () => {
        if (feedbackVisible) return;
        const start = startLabel.current;
        if (!start || !leftPoints.current[start]) return;

        // 이미 연결된 오른쪽 점이면 무시
        const existingTargets = Object.values(matches);
        if (existingTargets.includes(label)) return;

        const from = leftPoints.current[start];
        const to = point;

        // 기존 연결 제거
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

          // matches 안전하게 누적
          setMatches((prev) => {
            const newMatches = { ...prev, [start]: label };

            console.log('[DEBUG] 현재 matches:', newMatches);
            console.log('[DEBUG] 필요한 수:', question.pairs.left.length);

            if (Object.keys(newMatches).length === question.pairs.left.length) {
              console.log('[onMatch 호출됨]', newMatches);
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
        const pointer = canvas.getViewportPoint(opt.e);
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
          stroke: isCorrect ? 'green' : 'red',
          strokeWidth: 2,
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
