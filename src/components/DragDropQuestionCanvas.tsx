import {
  Canvas,
  FabricText,
  Group,
  Rect,
  FabricImage,
} from 'fabric';
import { useEffect, useRef, useState } from 'react';
import type { DragDropQuestion } from '../types/question';

type Props = {
  question: DragDropQuestion;
  onDrop: (answers: Record<string, string>) => void;
  userAnswer?: Record<string, string>;
  feedbackVisible?: boolean;
};

type AnswerMap = Record<string, string>;
type WordMap = Record<string, string>;

export default function DragDropQuestionCanvas({
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

  useEffect(() => {
    if (userAnswer) setAnswers(userAnswer);
  }, [userAnswer]);

  console.log(userAnswer)

  useEffect(() => {
    answersRef.current = answers;
    onDrop(answers);
  }, [answers, onDrop]);

  useEffect(() => {
    wordSlotMapRef.current = wordSlotMap;
  }, [wordSlotMap]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new Canvas(canvasRef.current, { selection: false });
    fabricCanvas.current = canvas;

    const SLOT_Y = 180;
    const SLOT_X_START = 120;
    const SLOT_GAP_X = 200;
    const IMAGE_Y = 90;
    const OPTION_Y = 350;
    const OPTION_X_START = 100;
    const OPTION_GAP = 140;

    const slotGroups: Record<string, Group> = {};
    const wordGroups: Record<string, Group> = {};
    const ghostGroups: Record<string, Group> = {};
    const initialPositions: Record<string, { left: number; top: number }> = {};

    question.leftLabels.forEach((label, i) => {
      const x = SLOT_X_START + i * SLOT_GAP_X;

      const mediaItem =
        question.media?.type === 'image-items'
          ? question.media.items.find((item) => item.label === label)
          : null;

      if (mediaItem) {
        FabricImage.fromURL(mediaItem.image).then((img) => {
          img.scaleToWidth(100);
          img.scaleToHeight(100);
          img.set({
            left: x,
            top: IMAGE_Y,
            originX: 'center',
            originY: 'center',
            selectable: false,
          });
          canvas.add(img);
        });
      }

      const rect = new Rect({
        width: 120,
        height: 40,
        fill: '#fffbe6',
        stroke: '#facc15',
        strokeWidth: 2,
        rx: 12,
        ry: 12,
        originX: 'center',
        originY: 'center',
      });

      const group = new Group([rect], {
        left: x,
        top: SLOT_Y,
        hasControls: false,
        hasBorders: false,
        selectable: false,
      });

      slotGroups[label] = group;
      canvas.add(group);
    });

    question.options.forEach((word, i) => {
      const left = OPTION_X_START + i * OPTION_GAP;
      const top = OPTION_Y;

      const text = new FabricText(word, {
        fontSize: 18,
        fill: '#374151',
        fontWeight: 'bold',
        originX: 'center',
        originY: 'center',
      });

      const rect = new Rect({
        width: 100,
        height: 40,
        fill: '#e0f2fe',
        rx: 10,
        ry: 10,
        originX: 'center',
        originY: 'center',
        // shadow: {
        //   color: '#94a3b8',
        //   blur: 4,
        //   offsetX: 2,
        //   offsetY: 2,
        //   affectStroke: true,
        // },
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
        width: 100,
        height: 40,
        fill: '#e0f2fe',
        rx: 10,
        ry: 10,
        originX: 'center',
        originY: 'center',
        opacity: 0.3,
      });
      const ghostText = new FabricText(word, {
        fontSize: 18,
        fill: '#94a3b8',
        originX: 'center',
        originY: 'center',
        opacity: 0.3,
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
        rect.set({ stroke: '#3b82f6', strokeWidth: 2 });
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
          slotRect.set('fill', isOverlapping ? '#bbf7d0' : '#fffbe6');
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
          slotRect.set('fill', '#fffbe6');
        }
        for (const ghost of Object.values(ghostGroups)) {
          const rect = ghost.item(0) as Rect;
          rect.set({ stroke: null, strokeWidth: 0 });
        }

        canvas.renderAll();
      });
    });

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
      <h2 className='text-2xl font-extrabold text-[#333] text-center'>
        {question.question}
      </h2>
      <canvas ref={canvasRef} width={900} height={500} />
    </div>
  );
}