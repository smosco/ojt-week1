import { Canvas, FabricImage, FabricText, Group, Rect } from 'fabric';
import { useEffect, useReducer, useRef, useState } from 'react';
import { dragDropReducer } from '../reducers/dragDropReducer';
import type { DragDropQuestion } from '../types/question';
import ResponsiveCanvasWrapper from './common/ResponsiveCanvasWrapper';

type Props = {
  question: DragDropQuestion;
  onDrop: (answers: Record<string, string>) => void;
  feedbackVisible?: boolean;
};

export default function DragDropQuestionCanvas({
  question,
  onDrop,
  feedbackVisible,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<Canvas | null>(null);

  const [answers, dispatch] = useReducer(dragDropReducer, {});

  const slotGroups = useRef<Map<string, Group>>(new Map());
  const wordGroups = useRef<Map<string, Group>>(new Map());
  const ghostGroups = useRef<Map<string, Group>>(new Map());
  const initialPositions = useRef<Map<string, { left: number; top: number }>>(
    new Map(),
  );

  useEffect(() => {
    onDrop(answers);
  }, [answers]);

  useEffect(() => {
    const canvas = new Canvas(canvasRef.current!, { selection: false });
    fabricCanvas.current = canvas;

    const SLOT_Y = 240;
    const SLOT_X_START = 100;
    const SLOT_GAP = 250;
    const OPTION_Y = 350;
    const OPTION_X_START = 100;
    const OPTION_GAP = 250;

    // 슬롯
    question.leftLabels.forEach((label, i) => {
      const x = SLOT_X_START + i * SLOT_GAP;

      const mediaItem =
        question.media?.type === 'image-items'
          ? question.media.items.find((item) => item.label === label)
          : null;

      if (mediaItem) {
        FabricImage.fromURL(mediaItem.image).then((img) => {
          img.scaleToWidth(200);
          img.set({
            left: x + 100,
            top: SLOT_Y - 120,
            originX: 'center',
            originY: 'center',
            selectable: false,
          });
          canvas.add(img);
        });
      }

      const rect = new Rect({
        width: 200,
        height: 50,
        fill: '#fef3c7',
        stroke: '#f59e0b',
        strokeWidth: 3,
        rx: 15,
        ry: 15,
        originX: 'center',
        originY: 'center',
      });
      const group = new Group([rect], {
        left: x,
        top: SLOT_Y,
        selectable: false,
      });
      slotGroups.current.set(label, group);
      canvas.add(group);
    });

    // 옵션
    question.options.forEach((word, i) => {
      const x = OPTION_X_START + i * OPTION_GAP;
      const text = new FabricText(word, {
        fontSize: 28,
        fill: '#374151',
        originX: 'center',
        originY: 'center',
      });
      const rect = new Rect({
        width: 200,
        height: 50,
        fill: '#dcfce7',
        stroke: '#16a34a',
        strokeWidth: 2,
        rx: 15,
        ry: 15,
        originX: 'center',
        originY: 'center',
      });
      const group = new Group([rect, text], {
        left: x,
        top: OPTION_Y,
        selectable: true,
        hasControls: false,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
        hasBorders: false,
      });

      initialPositions.current.set(word, { left: x, top: OPTION_Y });
      wordGroups.current.set(word, group);
      canvas.add(group);

      const ghostRect = new Rect({
        width: 200,
        height: 50,
        fill: '#dcfce7',
        stroke: '#c084fc',
        strokeWidth: 2,
        rx: 15,
        ry: 15,
        originX: 'center',
        originY: 'center',
        opacity: 0.4,
      });
      const ghostText = new FabricText(word, {
        fontSize: 28,
        fill: '#94a3b8',
        originX: 'center',
        originY: 'center',
        opacity: 0.4,
      });
      const ghostGroup = new Group([ghostRect, ghostText], {
        left: x,
        top: OPTION_Y,
        selectable: false,
        visible: false,
      });
      ghostGroups.current.set(word, ghostGroup);
      canvas.add(ghostGroup);
      canvas.sendObjectToBack(ghostGroup);

      group.on('mousedown', () => {
        if (feedbackVisible) return;
        ghostGroup.set('visible', true);
        canvas.requestRenderAll();
      });

      group.on('mouseup', () => {
        if (feedbackVisible) return;
        const box = group.getBoundingRect();
        let dropped = false;
        for (const [label, slot] of slotGroups.current.entries()) {
          const sbox = slot.getBoundingRect();
          const hit =
            box.left < sbox.left + sbox.width &&
            box.left + box.width > sbox.left &&
            box.top < sbox.top + sbox.height &&
            box.top + box.height > sbox.top;
          if (hit) {
            dispatch({ type: 'DROP_WORD', payload: { word, slot: label } });
            dropped = true;
            break;
          }
        }
        if (!dropped) dispatch({ type: 'REMOVE_WORD', payload: { word } });
      });
    });

    return () => {
      canvas.dispose();
    };
  }, [question]);

  useEffect(() => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;

    // Reset 위치
    for (const [word, group] of wordGroups.current.entries()) {
      const matchedSlot = Object.entries(answers).find(
        ([_, w]) => w === word,
      )?.[0];
      const pos = matchedSlot ? slotGroups.current.get(matchedSlot) : undefined;
      const fallback = initialPositions.current.get(word);

      if (pos) {
        group.set({ left: pos.left, top: pos.top });
        ghostGroups.current.get(word)?.set('visible', true);
      } else if (fallback) {
        group.set(fallback);
        ghostGroups.current.get(word)?.set('visible', false);
      }

      group.set({ selectable: true, evented: true }); // ✅ 이걸 확실히
      group.setCoords(); // ✅ 필수
    }
    canvas.renderAll();
  }, [answers]);

  useEffect(() => {
    if (!feedbackVisible || !fabricCanvas.current) return;
    const canvas = fabricCanvas.current;

    for (const [slot, userWord] of Object.entries(answers)) {
      const wordGroup = wordGroups.current.get(userWord);
      const slotGroup = slotGroups.current.get(slot);
      if (!wordGroup || !slotGroup) continue;

      const isCorrect = question.correctPairs.some(
        ([correctSlot, correctWord]) =>
          correctSlot === slot && correctWord === userWord,
      );

      const color = isCorrect ? '#16a34a' : '#dc2626';

      const wordRect = wordGroup.item(0) as Rect;
      wordRect.set({ stroke: color, strokeWidth: 4 });

      const slotRect = slotGroup.item(0) as Rect;
      slotRect.set({ stroke: color, strokeWidth: 3 });

      // 슬롯에 남아있는 피드백 텍스트 제거
      slotGroup.getObjects('text').forEach((t) => {
        const textObj = t as FabricText;
        if (textObj.text?.startsWith('정답:')) slotGroup.remove(textObj);
      });

      if (!isCorrect) {
        const correctAnswer = question.correctPairs.find(
          ([s]) => s === slot,
        )?.[1];
        if (correctAnswer) {
          const feedbackText = new FabricText(`정답: ${correctAnswer}`, {
            fontSize: 16,
            fill: '#dc2626',
            fontWeight: 'bold',
            originX: 'center',
            originY: 'bottom',
          });
          feedbackText.top = slotGroup.top;
          feedbackText.left = slotGroup.left + 100;
          canvas.add(feedbackText);
        }
      }
    }
    canvas.renderAll();
  }, [feedbackVisible]);

  return (
    <div className='flex flex-col items-center gap-4 w-full'>
      <h2 className='text-4xl font-extrabold text-center'>
        {question.question}
      </h2>
      <ResponsiveCanvasWrapper width={900} height={500}>
        <canvas ref={canvasRef} width={900} height={500} />
      </ResponsiveCanvasWrapper>
    </div>
  );
}
