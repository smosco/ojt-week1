import type { Canvas, Group } from 'fabric';
import { FabricText, type Rect } from 'fabric';
import { useEffect } from 'react';
import type { DragDropQuestion } from '../types/question';

type AnswerMap = Record<string, string>;

interface UseFeedbackProps {
  canvas: Canvas | null;
  answers: AnswerMap;
  question: DragDropQuestion;
  feedbackVisible?: boolean;
  slotGroups: React.RefObject<Map<string, Group>>;
  wordGroups: React.RefObject<Map<string, Group>>;
}

export function useDragDropFeedback({
  canvas,
  answers,
  question,
  feedbackVisible,
  slotGroups,
  wordGroups,
}: UseFeedbackProps) {
  useEffect(() => {
    if (!feedbackVisible || !canvas) return;

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

      // 기존 피드백 텍스트 제거
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
          feedbackText.left = slotGroup.left! + 100;
          canvas.add(feedbackText);
        }
      }
    }

    canvas.renderAll();

    // TODO: 의존성 배열에 불필요한 것 없는지 확인 필요
  }, [feedbackVisible, canvas, answers, question, slotGroups, wordGroups]);
}
