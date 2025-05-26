import { useEffect, useState } from 'react';
import ChoiceQuestionCanvas from '../components/ChoiceQuestionCanvas';
// import DragDropQuestionCanvas from '../components/DragDropQuestionCanvas';
import FractionCircleQuestionCanvas from '../components/FractionCircleQuestionCanvas';
import MatchingQuestionCanvas from '../components/MatchingQuestionCanvas';
// import SlotDragQuestionCanvas from '../components/SlotDragQuestionCanvas';
import useResultStore from '../stores/useResultStore';
import useToastStore from '../stores/useToastStore';
import type { InteractiveQuestion } from '../types/question';

interface Props {
  questions: InteractiveQuestion[];
  onComplete: () => void;
}

export default function QuestionRenderer({ questions, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [userAnswer, setUserAnswer] = useState<any>(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  const { addResult } = useResultStore();
  const { addToast } = useToastStore();

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
    if (current.type === 'slot-drag') {
      return (
        userAnswer &&
        Object.keys(userAnswer).length ===
          current.slots.filter((s) => !s.preset).length
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
    addResult({ id: current.id, isCorrect });
    if (isCorrect) {
      addToast('훌륭해요! 🎉', 'success');
    } else {
      addToast('다시 생각해봐요!', 'error');
    }
  };

  const goToNext = () => {
    const next = index + 1;
    if (next < questions.length) {
      setIndex(next);
      setUserAnswer(null);
      setFeedbackVisible(false);
    } else {
      onComplete();
    }
  };

  // useEffect(() => {
  //   console.log('[DEBUG] userAnswer changed:', userAnswer);
  // }, [userAnswer]);

  const progressPercentage = ((index + 1) / questions.length) * 100;

  return (
    <div className='w-screen min-h-screen bg-gradient-to-b from-[#B6E3FF] to-[#D5F8CE] flex flex-col items-center justify-start px-6 py-10 gap-8'>
      <div className='w-full max-w-5xl'>
        <div className='text-2xl font-extrabold text-[#444] mb-2'>
          문제 {index + 1} / {questions.length}
        </div>
        <div className='w-full h-5 bg-yellow-100 rounded-full overflow-hidden'>
          {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
          <div
            className='h-full bg-yellow-300 transition-all duration-500'
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className='w-full max-w-5xl bg-white rounded-3xl shadow-xl p-8'>
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
        )}

        {current.type === 'slot-drag' && (
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
      </div>

      <div className='mt-4'>
        {!feedbackVisible ? (
          <button
            type='button'
            onClick={checkAnswer}
            disabled={!isAnswerComplete}
            className='px-10 py-3 text-lg font-bold rounded-full shadow-md transition-all duration-200 text-white disabled:opacity-50 disabled:cursor-not-allowed bg-yellow-300 hover:bg-yellow-400'
          >
            정답 확인
          </button>
        ) : (
          <button
            type='button'
            onClick={goToNext}
            className='px-10 py-3 text-lg font-bold rounded-full shadow-md transition-all duration-200 text-white bg-yellow-300 hover:bg-yellow-400'
          >
            다음 문제
          </button>
        )}
      </div>
    </div>
  );
}
