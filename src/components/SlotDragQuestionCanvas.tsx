import { Canvas, FabricText, Group, Rect } from 'fabric';
import { useEffect, useRef, useState } from 'react';
import type { SlotDragQuestion } from '../types/question';

type Props = {
  question: SlotDragQuestion;
  onDrop: (answers: Record<string, string>) => void;
  userAnswer?: Record<string, string>;
  feedbackVisible?: boolean;
};

type AnswerMap = Record<string, string>;
type WordMap = Record<string, string>;

export default function SlotDragQuestionCanvas({
  question,
  onDrop,
  userAnswer,
  feedbackVisible,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<Canvas | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>(userAnswer || {});
  const [wordSlotMap, setWordSlotMap] = useState<WordMap>({});
  const answersRef = useRef(answers);
  const wordSlotMapRef = useRef(wordSlotMap);

  // userAnswer prop이 바뀌면 내부 상태도 동기화
  useEffect(() => {
    if (userAnswer) {
      setAnswers(userAnswer);
    }
  }, [userAnswer]);

  useEffect(() => {
    answersRef.current = answers;
    onDrop(answers); // 드롭 결과를 상위로 전달
  }, [answers, onDrop]);

  useEffect(() => {
    wordSlotMapRef.current = wordSlotMap;
  }, [wordSlotMap]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, { selection: false });
    fabricCanvas.current = canvas;

    const SLOT_X = 150;
    const SLOT_Y_START = 100;
    const SLOT_GAP_Y = 70;
    const OPTION_Y = 400;
    const OPTION_X_START = 100;
    const OPTION_GAP = 100;

    const slotGroups: Record<string, Group> = {};
    const wordGroups: Record<string, Group> = {};
    const ghostGroups: Record<string, Group> = {};
    const initialPositions: Record<string, { left: number; top: number }> = {};

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
      });

      slotGroups[label] = group;
      canvas.add(labelText, group);
    });

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
        selectable: true,
        evented: true,
      });

      initialPositions[word] = { left, top };
      wordGroups[word] = group;
      canvas.add(group);

      const ghostRect = new Rect({
        width: 80,
        height: 30,
        fill: '#eee',
        rx: 5,
        ry: 5,
        originX: 'center',
        originY: 'center',
        opacity: 0.4,
      });
      const ghostText = new FabricText(word, {
        fontSize: 14,
        originX: 'center',
        originY: 'center',
        opacity: 0.4,
      });
      const ghostGroup = new Group([ghostRect, ghostText], {
        left,
        top,
        hasControls: false,
        hasBorders: false,
        selectable: false,
        evented: false,
        visible: false,
      });
      ghostGroups[word] = ghostGroup;
      canvas.add(ghostGroup);
      canvas.sendObjectToBack(ghostGroup);

      group.on('mousedown', () => {
        if (feedbackVisible) return;
        const ghost = ghostGroups[word];
        const rect = ghost.item(0) as Rect;
        rect.set({ stroke: 'green', strokeWidth: 2 });
        ghost.set('visible', true);
        canvas.requestRenderAll();
      });

      group.on('moving', () => {
        if (feedbackVisible) return;
        for (const slotGroup of Object.values(slotGroups)) {
          const slotRect = slotGroup.item(0) as Rect;
          const slotBox = slotGroup.getBoundingRect();
          const wordBox = group.getBoundingRect();
          const isOverlapping =
            wordBox.left < slotBox.left + slotBox.width &&
            wordBox.left + wordBox.width > slotBox.left &&
            wordBox.top < slotBox.top + slotBox.height &&
            wordBox.top + wordBox.height > slotBox.top;
          slotRect.set('fill', isOverlapping ? 'green' : 'lightgray');
        }
        canvas.requestRenderAll();
      });

      group.on('mouseup', () => {
        if (feedbackVisible) return;

        let dropped = false;

        for (const [slotLabel, slotGroup] of Object.entries(slotGroups)) {
          const slotBox = slotGroup.getBoundingRect();
          const wordBox = group.getBoundingRect();

          const isOverlapping =
            wordBox.left < slotBox.left + slotBox.width &&
            wordBox.left + wordBox.width > slotBox.left &&
            wordBox.top < slotBox.top + slotBox.height &&
            wordBox.top + wordBox.height > slotBox.top;

          if (isOverlapping) {
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

            ghostGroups[word].set('visible', true);
            dropped = true;
            break;
          }
        }

        if (!dropped) {
          const { left, top } = initialPositions[word];
          group.set({ left, top });
          group.setCoords();
        }

        for (const slotGroup of Object.values(slotGroups)) {
          const slotRect = slotGroup.item(0) as Rect;
          slotRect.set('fill', 'lightgray');
        }
        for (const ghost of Object.values(ghostGroups)) {
          const rect = ghost.item(0) as Rect;
          rect.set({ stroke: null, strokeWidth: 0 });
        }

        canvas.renderAll();
      });
    });

    // userAnswer가 있으면, 드롭된 상태로 렌더링
    if (userAnswer) {
      Object.entries(userAnswer).forEach(([slotLabel, word]) => {
        const slotGroup = slotGroups[slotLabel];
        const wordGroup = wordGroups[word];
        if (slotGroup && wordGroup) {
          wordGroup.set({ left: slotGroup.left, top: slotGroup.top });
          wordGroup.setCoords();
          ghostGroups[word].set('visible', true);
        }
      });
      canvas.renderAll();
    }

    // feedbackVisible이 true면 정답 표시
    if (feedbackVisible) {
      Object.entries(answers).forEach(([slot, word]) => {
        const group = wordGroups[word];
        if (!group) return;
        const bg = group.item(0) as Rect;
        const isCorrect = question.correctPairs.some(
          ([l, r]) => l === slot && r === word,
        );
        bg.set({ stroke: isCorrect ? 'green' : 'red', strokeWidth: 2 });
      });
      canvas.renderAll();
    }

    return () => {
      canvas.dispose();
    };
  }, [question, userAnswer, feedbackVisible]);

  return (
    <div className='flex flex-col items-center gap-4'>
      <h2 className='text-xl font-bold text-center'>{question.question}</h2>
      <canvas ref={canvasRef} width={800} height={500} />
    </div>
  );
}
