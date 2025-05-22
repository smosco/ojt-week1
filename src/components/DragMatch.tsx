import { Canvas, FabricText, Group, Rect } from 'fabric';
import { useEffect, useRef, useState } from 'react';
import type { DragQuestion } from '../types/question';

type Props = {
  question: DragQuestion;
};

type AnswerMap = Record<string, string>; // { slotLabel: word }
type WordMap = Record<string, string>; // { word: slotLabel }

export default function DragMatchCanvas({ question }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<Canvas | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [wordSlotMap, setWordSlotMap] = useState<WordMap>({});
  const answersRef = useRef(answers);
  const wordSlotMapRef = useRef(wordSlotMap);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      selection: false,
    });
    fabricCanvas.current = canvas;

    const SLOT_X = 150;
    const SLOT_Y_START = 100;
    const SLOT_GAP_Y = 70;
    const OPTION_Y = 400;
    const OPTION_X_START = 100;
    const OPTION_GAP = 100;

    const slotGroups: Record<string, Group> = {};
    const wordGroups: Record<string, Group> = {};
    const initialPositions: Record<string, { left: number; top: number }> = {};

    // 슬롯(빈칸) 생성
    question.leftLabels.forEach((label, i) => {
      const y = SLOT_Y_START + i * SLOT_GAP_Y;

      const labelText = new FabricText(label, {
        left: SLOT_X,
        top: y,
        fontSize: 16,
        originX: 'left',
        originY: 'center',
        selectable: false,
      });

      const rect = new Rect({
        width: 100,
        height: 30,
        fill: 'lightgray',
        rx: 8,
        ry: 8,
        originX: 'left',
        originY: 'center',
      });

      const group = new Group([rect], {
        left: SLOT_X + 100,
        top: y - 16,
        hasControls: false,
        hasBorders: false,
        selectable: false,
        hoverCursor: 'pointer',
      });

      group.on('mouseover', () => {
        if (!submitted) {
          rect.set('fill', 'green');
          canvas.renderAll();
        }
      });

      group.on('mouseout', () => {
        if (!submitted) {
          rect.set('fill', 'lightgray');
          canvas.renderAll();
        }
      });

      slotGroups[label] = group;
      canvas.add(labelText, group);
    });

    // 단어 그룹 생성
    question.options.forEach((word, i) => {
      const left = OPTION_X_START + i * OPTION_GAP;
      const top = OPTION_Y;

      const text = new FabricText(word, {
        fontSize: 14,
        originX: 'center',
        originY: 'center',
      });

      const rect = new Rect({
        width: 80,
        height: 30,
        fill: '#eee',
        rx: 5,
        ry: 5,
        originX: 'center',
        originY: 'center',
      });

      const group = new Group([rect, text], {
        left,
        top,
        hasControls: false,
        hasBorders: false,
        lockMovementX: false,
        lockMovementY: false,
      });

      initialPositions[word] = { left, top };

      group.on('mousedown', () => {
        if (submitted) return;
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        (group as any).bringToFront?.();
      });

      group.on('mouseup', () => {
        if (submitted) return;

        let dropped = false;
        for (const [slotLabel, slotGroup] of Object.entries(slotGroups)) {
          const slotBox = slotGroup.getBoundingRect();
          const wordBox = group.getBoundingRect();

          if (
            wordBox.left < slotBox.left + slotBox.width &&
            wordBox.left + wordBox.width > slotBox.left &&
            wordBox.top < slotBox.top + slotBox.height &&
            wordBox.top + wordBox.height > slotBox.top
          ) {
            // ref에서 최신값 사용
            const existingWord = answersRef.current[slotLabel];
            const prevSlot = wordSlotMapRef.current[word];

            if (prevSlot && prevSlot !== slotLabel) {
              setAnswers((prev) => {
                const updated = { ...prev };
                delete updated[prevSlot];
                return updated;
              });
            }

            if (existingWord && existingWord !== word) {
              const prevGroup = wordGroups[existingWord];
              const { left, top } = initialPositions[existingWord];
              prevGroup.set({ left, top });
              prevGroup.setCoords();
            }

            setAnswers((prev) => ({ ...prev, [slotLabel]: word }));
            setWordSlotMap((prev) => ({ ...prev, [word]: slotLabel }));

            group.set({ left: slotGroup.left, top: slotGroup.top });
            group.setCoords();
            canvas.renderAll();
            dropped = true;
            break;
          }
        }

        if (!dropped) {
          const { left, top } = initialPositions[word];
          group.set({ left, top });
          group.setCoords();
          canvas.renderAll();
        }
      });

      canvas.add(group);
      wordGroups[word] = group;
    });

    return () => {
      canvas.dispose();
    };
  }, [question, submitted]);

  // 상태와 ref 동기화
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    wordSlotMapRef.current = wordSlotMap;
  }, [wordSlotMap]);

  const handleCheck = () => {
    setSubmitted(true);
    const canvas = fabricCanvas.current;
    if (!canvas) return;

    Object.entries(answers).forEach(([slot, word]) => {
      const group = fabricCanvas.current?.getObjects().find(
        (obj) =>
          obj.type === 'group' &&
          (obj as Group)
            .getObjects()
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            .some((o) => (o as any).text === word),
      ) as Group | undefined;

      if (!group) return;
      const bg = group.item(0) as Rect;
      const isCorrect = question.correctPairs.some(
        ([l, r]) => l === slot && r === word,
      );
      bg.set({ stroke: isCorrect ? 'green' : 'red', strokeWidth: 2 });
    });

    canvas.renderAll();
  };

  // console.log(answers, answersRef);

  return (
    <div className='flex flex-col items-center gap-4'>
      <h2 className='text-xl font-bold text-center'>{question.question}</h2>
      <canvas ref={canvasRef} width={800} height={500} />
      {!submitted ? (
        <button
          type='button'
          onClick={handleCheck}
          className='bg-blue-500 text-white px-4 py-2 rounded'
        >
          정답 확인
        </button>
      ) : (
        <p className='text-gray-700'>결과를 확인하세요!</p>
      )}
    </div>
  );
}
