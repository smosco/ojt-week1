import { useState } from 'react';
import ChoiceQuestionCanvas from '../components/ChoiceQuestionCanvas';
// import DragDropQuestionCanvas from '../components/DragDropQuestionCanvas';
import FractionCircleQuestionCanvas from '../components/FractionCircleQuestionCanvas';
import MatchingQuestionCanvas from '../components/MatchingQuestionCanvas';
// import SlotDragQuestionCanvas from '../components/SlotDragQuestionCanvas';
import useResultStore from '../stores/useResultStore';
import useToastStore from '../stores/useToastStore';
import type { ChoiceQuestion, InteractiveQuestion } from '../types/question';

interface Props {
  questions: InteractiveQuestion[];
  onComplete: () => void;
}

export default function QuestionRenderer({ questions, onComplete }: Props) {
  const [currentIndex, seCurrentIndex] = useState(0);
  const currentQuestion = questions[currentIndex];
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [userAnswer, setUserAnswer] = useState<any>(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  const { total, addResult } = useResultStore();
  const { addToast } = useToastStore();

  // 현재 문제의 답변이 완전한지 여부를 판단하는 함수
  const isAnswerComplete = (() => {
    if (currentQuestion.type === 'choice') {
      return userAnswer !== null;
    }
    if (currentQuestion.type === 'drag') {
      return (
        userAnswer &&
        Object.keys(userAnswer).length === currentQuestion.draggableItems.length
      );
    }
    if (currentQuestion.type === 'slot-drag') {
      return (
        userAnswer &&
        Object.keys(userAnswer).length ===
          currentQuestion.slots.filter((s) => !s.preset).length
      );
    }
    if (currentQuestion.type === 'match') {
      return (
        userAnswer &&
        Object.keys(userAnswer).length === currentQuestion.pairs.left.length
      );
    }
    return false;
  })();

  // 정답을 확인하고 피드백을 표시하는 함수
  const checkAnswer = () => {
    // TODO: isCorrect 초기값을 false로 설정해도 괜찮은지 고민
    let isCorrect = false;

    if (currentQuestion.type === 'choice') {
      isCorrect = currentQuestion.correctAnswers.includes(userAnswer);
    } else if (currentQuestion.type === 'drag') {
      isCorrect = Object.entries(currentQuestion.correctPlacements).every(
        ([key, val]) => userAnswer[key] === val,
      );
    } else if (currentQuestion.type === 'match') {
      isCorrect = Object.entries(currentQuestion.correctMatches).every(
        ([key, val]) => userAnswer[key] === val,
      );
    }

    setFeedbackVisible(true);
    addResult({ id: currentQuestion.id, isCorrect });

    if (isCorrect) {
      addToast('훌륭해요! 🎉', 'success');
    } else {
      addToast('다시 생각해봐요!', 'error');
    }
  };

  const goToNext = () => {
    const next = currentIndex + 1;
    if (next < questions.length) {
      seCurrentIndex(next);
      setUserAnswer(null);
      setFeedbackVisible(false);
    } else {
      onComplete();
    }
  };

  const progressPercentage = ((currentIndex + 1) / total) * 100;

  return (
    <div className='w-screen min-h-screen bg-gradient-to-b from-[#B6E3FF] to-[#D5F8CE] flex flex-col items-center justify-start px-6 py-10 gap-8'>
      <div className='w-full max-w-5xl'>
        <div className='text-2xl font-extrabold text-[#444] mb-2'>
          문제 {currentIndex + 1} / {total}
        </div>
        <div className='w-full h-5 bg-yellow-100 rounded-full overflow-hidden'>
          <div
            className='h-full bg-yellow-300 transition-all duration-500'
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className='w-full max-w-5xl bg-white rounded-3xl shadow-xl p-8'>
        {currentQuestion.type === 'choice' &&
          (currentQuestion.media?.type === 'fraction-circle' ? (
            <FractionCircleQuestionCanvas
              question={currentQuestion as ChoiceQuestion}
              onAnswer={setUserAnswer}
              userAnswer={userAnswer}
              feedbackVisible={feedbackVisible}
            />
          ) : (
            <ChoiceQuestionCanvas
              question={currentQuestion}
              onAnswer={setUserAnswer}
              userAnswer={userAnswer}
              feedbackVisible={feedbackVisible}
            />
          ))}

        {/* {currentQuestion.type === 'drag' && (
          <DragDropQuestionCanvas
            question={currentQuestion}
            onDrop={setUserAnswer}
            userAnswer={userAnswer}
            feedbackVisible={feedbackVisible}
          />
        )}

        {currentQuestion.type === 'slot-drag' && (
          <SlotDragQuestionCanvas
            question={currentQuestion}
            onDrop={setUserAnswer}
            userAnswer={userAnswer}
            feedbackVisible={feedbackVisible}
          />
        )} */}

        {currentQuestion.type === 'match' && (
          <MatchingQuestionCanvas
            question={currentQuestion}
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
