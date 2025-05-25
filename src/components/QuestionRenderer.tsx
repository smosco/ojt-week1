import { useEffect, useState } from 'react';
import ChoiceQuestionCanvas from '../components/ChoiceQuestionCanvas';
import DragDropQuestionCanvas from '../components/DragDropQuestionCanvas';
import FractionCircleQuestionCanvas from '../components/FractionCircleQuestionCanvas';
import MatchingQuestionCanvas from '../components/MatchingQuestionCanvas';
import SlotDragQuestionCanvas from '../components/SlotDragQuestionCanvas';
import type { InteractiveQuestion } from '../types/question';

interface Props {
  questions: InteractiveQuestion[];
  onComplete: (results: QuestionResult[]) => void;
}

interface QuestionResult {
  id: string;
  isCorrect: boolean;
}

export default function QuestionRenderer({ questions, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<QuestionResult[]>([]);
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [userAnswer, setUserAnswer] = useState<any>(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  const current = questions[index];

  const isAnswerComplete = (() => {
    if (current.type === 'choice') {
      return userAnswer !== null;
    }
    if (current.type === 'drag') {
      return (
        userAnswer &&
        Object.keys(userAnswer).length === current.draggableItems.length
      );
    }
    if (current.type === 'match') {
      return (
        userAnswer &&
        Object.keys(userAnswer).length === current.pairs.left.length
      );
    }
    return false;
  })();

  const checkAnswer = () => {
    let isCorrect = false;

    if (current.type === 'choice') {
      isCorrect = current.correctAnswers.includes(userAnswer);
    } else if (current.type === 'drag') {
      isCorrect = Object.entries(current.correctPlacements).every(
        ([key, val]) => userAnswer[key] === val,
      );
    } else if (current.type === 'match') {
      isCorrect = Object.entries(current.correctMatches).every(
        ([key, val]) => userAnswer[key] === val,
      );
    }

    setFeedbackVisible(true);
    setResults([...results, { id: current.id, isCorrect }]);
  };

  const goToNext = () => {
    const next = index + 1;
    if (next < questions.length) {
      setIndex(next);
      setUserAnswer(null);
      setFeedbackVisible(false);
    } else {
      onComplete(results);
    }
  };

  useEffect(() => {
    console.log('[DEBUG] userAnswer changed:', userAnswer);
  }, [userAnswer]);

  return (
    <div>
      <h2>
        문제 {index + 1} / {questions.length}
      </h2>

      {current.type === 'choice' &&
        (current.media?.type === 'fraction-circle' ? (
          <FractionCircleQuestionCanvas
            question={current}
            onAnswer={setUserAnswer}
            userAnswer={userAnswer}
            feedbackVisible={feedbackVisible}
          />
        ) : (
          <ChoiceQuestionCanvas
            question={current}
            onAnswer={setUserAnswer}
            userAnswer={userAnswer}
            feedbackVisible={feedbackVisible}
          />
        ))}

      {/* {current.type === 'drag' && (
        <DragDropQuestionCanvas
          question={current}
          onDrop={setUserAnswer}
          userAnswer={userAnswer}
          feedbackVisible={feedbackVisible}
        />
      )} */}

      {/* {current.type === 'slot-drag' && (
        <SlotDragQuestionCanvas
          question={current}
          onDrop={setUserAnswer}
          userAnswer={userAnswer}
          feedbackVisible={feedbackVisible}
        />
      )} */}

      {current.type === 'match' && (
        <MatchingQuestionCanvas
          question={current}
          onMatch={setUserAnswer}
          userAnswer={userAnswer}
          feedbackVisible={feedbackVisible}
        />
      )}

      <div style={{ marginTop: 24 }}>
        {!feedbackVisible ? (
          <button
            type='button'
            onClick={checkAnswer}
            disabled={!isAnswerComplete}
            style={{ padding: '10px 20px', fontSize: 16 }}
          >
            정답 확인
          </button>
        ) : (
          <button
            type='button'
            onClick={goToNext}
            style={{ padding: '10px 20px', fontSize: 16 }}
          >
            다음 문제
          </button>
        )}
      </div>
    </div>
  );
}
