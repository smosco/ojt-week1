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

    console.log('Removing lines for from:', from, 'to:', to); // 디버깅용

    linesRef.current = linesRef.current.filter((line) => {
      const l = line as LineWithData;
      const isMatch =
        (from && l.data?.from === from) || (to && l.data?.to === to);

      if (isMatch) {
        console.log('Removing line:', l.data); // 디버깅용
        try {
          canvas.remove(line);
          canvas.requestRenderAll(); // 즉시 다시 그리기
        } catch (error) {
          console.warn('Failed to remove line:', error);
        }
        return false; // 배열에서 제거
      }
      return true; // 배열에 유지
    });
  };

  // matches 변경 시 부모에게 알림
  useEffect(() => {
    onMatch(matches);
  }, [matches, onMatch]);

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
        // TODO: 점을 텍스트 길이에 상관없이 같은 위치에 배치
        left: leftX + 150,
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
        console.log('Left point mousedown triggered for:', label); // 디버깅용

        if (feedbackVisible) {
          console.log('Feedback visible, ignoring mousedown');
          return;
        }

        // 현재 matches 상태를 가져와서 확인
        setMatches((currentMatches) => {
          if (currentMatches[label]) {
            console.log('Removing existing line for:', label);
            removeExistingLine(label);
            const updated = { ...currentMatches };
            delete updated[label];
            return updated;
          }
          return currentMatches;
        });

        console.log('Starting new line from:', label); // 디버깅용
        startLabel.current = label;

        const line = new Line(
          [point.left || 0, point.top || 0, point.left || 0, point.top || 0],
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
        console.log('Right point mouseup triggered for:', label); // 디버깅용

        if (feedbackVisible) {
          console.log('Feedback visible, ignoring');
          return;
        }

        const start = startLabel.current;
        console.log('Start label:', start); // 디버깅용

        if (!start || !leftPoints.current[start]) {
          console.log('No start label or left point');
          return;
        }

        const existingTargets = Object.values(matches);
        if (existingTargets.includes(label)) {
          console.log('Target already connected:', label);
          return;
        }

        const from = leftPoints.current[start];
        const to = point;

        removeExistingLine(start);
        removeExistingLine(undefined, label);

        if (currentLine.current) {
          console.log('Creating connection from', start, 'to', label); // 디버깅용

          currentLine.current.set({ x2: to.left, y2: to.top });
          (currentLine.current as LineWithData).data = {
            from: start,
            to: label,
          };
          canvas.requestRenderAll();
          linesRef.current.push(currentLine.current);

          setMatches((prev) => {
            const newMatches = { ...prev, [start]: label };
            console.log('New matches:', newMatches); // 디버깅용
            return newMatches;
          });
        } else {
          console.log('No current line available');
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

    // 전역 마우스 업 이벤트 추가 (연결 취소용)
    canvas.on('mouse:up', (opt) => {
      if (!currentLine.current) return;

      // 오른쪽 점 위가 아닌 곳에서 마우스 업 시 임시 선 제거
      const target = opt.target;
      const isRightPoint =
        target &&
        rightPoints.current &&
        Object.values(rightPoints.current).includes(target as Circle);

      if (!isRightPoint) {
        canvas.remove(currentLine.current);
        currentLine.current = null;
        startLabel.current = null;
      }
    });

    return () => {
      if (fabricCanvas.current) {
        fabricCanvas.current.dispose();
        fabricCanvas.current = null;
      }
    };
  }, [question.id, feedbackVisible]); // matches와 onMatch 제거

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
        [fromPt.left || 0, fromPt.top || 0, toPt.left || 0, toPt.top || 0],
        {
          stroke: isCorrect ? '#34D399' : '#F87171',
          strokeWidth: 4,
          selectable: false,
          evented: false,
        },
      );
      canvas.add(line);
      canvas.sendObjectToBack(line); // 라인을 뒤로 보내기
    });
    canvas.requestRenderAll();
  }, [feedbackVisible, userAnswer]);

  return (
    <div className='flex flex-col items-center gap-4'>
      <h2 className='text-4xl font-extrabold text-gray-800 text-center'>
        {question.question}
      </h2>

      <canvas ref={canvasRef} />

      {!feedbackVisible && (
        <div className='text-lg text-gray-500 text-center'>
          💡 왼쪽 항목을 클릭한 후 오른쪽 항목으로 드래그하여 연결하세요
          <br />
          연결된 개수: {Object.keys(matches).length} /{' '}
          {question.pairs.left.length}
        </div>
      )}
    </div>
  );
}
