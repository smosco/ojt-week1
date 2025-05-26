import { useState } from 'react';
import ChoiceQuestionCanvas from '../components/ChoiceQuestionCanvas';
import FractionCircleQuestionCanvas from '../components/FractionCircleQuestionCanvas';
import MatchingQuestionCanvas from '../components/MatchingQuestionCanvas';
import useResultStore from '../stores/useResultStore';
import useToastStore from '../stores/useToastStore';
import type {
  ChoiceQuestion,
  DragDropQuestion,
  InteractiveQuestion,
  MatchingQuestion,
} from '../types/question';
import DragDropQuestionCanvas from './DragDropQuestionCanvas';

interface Props {
  questions: InteractiveQuestion[];
  onComplete: () => void;
}

// 각 문제 타입별 답안 타입 정의
type ChoiceAnswer = string | string[] | null;
type DragDropAnswer = Record<string, string> | null;
type MatchingAnswer = Record<string, string> | null;
type UserAnswer = ChoiceAnswer | DragDropAnswer | MatchingAnswer;

// 정답 확인 함수들
const answerCheckers = {
  choice: (question: ChoiceQuestion, answer: ChoiceAnswer): boolean => {
    if (!answer) return false;

    // 다중 선택인지 확인
    const isMultipleChoice = question.correctAnswers.length > 1;

    if (isMultipleChoice) {
      // 다중 선택: 배열로 받은 답안이 정답과 완전히 일치해야 함
      if (!Array.isArray(answer)) return false;

      // 선택한 답의 개수와 정답의 개수가 같아야 함
      if (answer.length !== question.correctAnswers.length) return false;

      // 모든 선택한 답이 정답에 포함되어야 함
      return (
        answer.every((ans) => question.correctAnswers.includes(ans)) &&
        question.correctAnswers.every((correct) => answer.includes(correct))
      );
    } else {
      // 단일 선택: 기존 로직
      const answerToCheck = Array.isArray(answer) ? answer[0] : answer;
      return (
        answerToCheck !== null &&
        question.correctAnswers.includes(answerToCheck)
      );
    }
  },

  drag: (question: DragDropQuestion, answer: DragDropAnswer): boolean => {
    if (!answer || !Array.isArray(question.correctPairs)) return false;

    const answerEntries = Object.entries(answer);
    return (
      answerEntries.length === question.correctPairs.length &&
      question.correctPairs.every(([slot, word]) => answer[slot] === word)
    );
  },

  match: (question: MatchingQuestion, answer: MatchingAnswer): boolean => {
    if (!answer) return false;

    return Object.entries(question.correctMatches).every(
      ([key, val]) => answer[key] === val,
    );
  },
};

// 답안 완성도 확인 함수들
const completenessCheckers = {
  choice: (question: ChoiceQuestion, answer: ChoiceAnswer): boolean => {
    if (!answer) return false;

    // 다중 선택인지 확인
    const isMultipleChoice = question.correctAnswers.length > 1;

    if (isMultipleChoice) {
      // 다중 선택: 최소 1개 이상 선택되어야 함
      return Array.isArray(answer) && answer.length > 0;
    } else {
      // 단일 선택: 기존 로직
      return Array.isArray(answer) ? answer.length > 0 : answer !== null;
    }
  },

  drag: (question: DragDropQuestion, answer: DragDropAnswer): boolean => {
    return (
      answer !== null &&
      Object.keys(answer).length === question.leftLabels.length
    );
  },

  match: (question: MatchingQuestion, answer: MatchingAnswer): boolean => {
    return (
      answer !== null &&
      Object.keys(answer).length === question.pairs.left.length
    );
  },
};

export default function QuestionRenderer({ questions, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<UserAnswer>(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  const { total, addResult } = useResultStore();
  const { addToast } = useToastStore();

  const currentQuestion = questions[currentIndex];

  // 현재 문제의 답변이 완전한지 확인
  const isAnswerComplete = (): boolean => {
    const checker = completenessCheckers[currentQuestion.type];
    return checker(currentQuestion as any, userAnswer as any);
  };

  // 정답 확인
  const checkAnswer = (): void => {
    const checker = answerCheckers[currentQuestion.type];
    const isCorrect = checker(currentQuestion as any, userAnswer as any);

    setFeedbackVisible(true);
    addResult({ id: currentQuestion.id, isCorrect });

    if (isCorrect) {
      addToast('훌륭해요! 🎉', 'success');
    } else {
      addToast('다시 생각해봐요!', 'error');
    }
  };

  // 다음 문제로 이동
  const goToNext = (): void => {
    const nextIndex = currentIndex + 1;

    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex);
      setUserAnswer(null);
      setFeedbackVisible(false);
    } else {
      onComplete();
    }
  };

  // 문제 컴포넌트 렌더링
  // renderQuestionComponent 함수 수정
  const renderQuestionComponent = () => {
    switch (currentQuestion.type) {
      case 'choice': {
        const choiceQuestion = currentQuestion as ChoiceQuestion;

        if (choiceQuestion.media?.type === 'fraction-circle') {
          return (
            <FractionCircleQuestionCanvas
              key={currentQuestion.id}
              question={choiceQuestion}
              onAnswer={setUserAnswer}
              userAnswer={userAnswer as string[] | null}
              feedbackVisible={feedbackVisible}
            />
          );
        }

        return (
          <ChoiceQuestionCanvas
            key={currentQuestion.id}
            question={currentQuestion}
            onAnswer={(answer: string) => {
              // 기존 단일 선택 문제는 배열로 래핑
              setUserAnswer([answer]);
            }}
            userAnswer={Array.isArray(userAnswer) ? userAnswer[0] : userAnswer}
            feedbackVisible={feedbackVisible}
          />
        );
      }

      case 'drag':
        return (
          <DragDropQuestionCanvas
            key={currentQuestion.id}
            question={currentQuestion}
            onDrop={setUserAnswer}
            userAnswer={userAnswer}
            feedbackVisible={feedbackVisible}
          />
        );

      case 'match':
        return (
          <MatchingQuestionCanvas
            key={currentQuestion.id}
            question={currentQuestion}
            onMatch={setUserAnswer}
            userAnswer={userAnswer}
            feedbackVisible={feedbackVisible}
          />
        );

      default:
        return null;
    }
  };

  const progressPercentage = ((currentIndex + 1) / total) * 100;

  return (
    <div className='min-h-screen bg-gradient-to-b from-[#B6E3FF] to-[#D5F8CE] flex flex-col items-center justify-start px-6 py-10 gap-8'>
      {/* 진행 상황 표시 */}
      <div className='w-full max-w-5xl'>
        <div className='font-["GmarketSans"] text-2xl font-bold text-[#444] mb-2'>
          문제 {currentIndex + 1} / {total}
        </div>
        <div className='w-full h-5 bg-yellow-100 rounded-full overflow-hidden'>
          <div
            className='h-full bg-yellow-300 transition-all duration-500'
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 문제 영역 */}
      <div className='w-full max-w-5xl bg-white rounded-3xl shadow-xl px-8 py-16'>
        {renderQuestionComponent()}
      </div>

      {/* 버튼 영역 */}
      <div className='mt-4'>
        {!feedbackVisible ? (
          <button
            type='button'
            onClick={checkAnswer}
            disabled={!isAnswerComplete()}
            className='px-10 py-3 text-2xl font-bold rounded-full shadow-md transition-all duration-200 text-white disabled:opacity-50 disabled:cursor-not-allowed bg-yellow-400 hover:bg-yellow-500'
          >
            정답 확인
          </button>
        ) : (
          <button
            type='button'
            onClick={goToNext}
            className='px-10 py-3 text-2xl font-bold rounded-full shadow-md transition-all duration-200 text-white bg-yellow-400 hover:bg-yellow-500'
          >
            {currentIndex + 1 < questions.length ? '다음 문제' : '완료'}
          </button>
        )}
      </div>
    </div>
  );
}
