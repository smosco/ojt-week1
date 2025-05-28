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

// 타입 분리: 각 문제 타입별 답안 타입 정의
type SingleChoiceAnswer = string | null;
type MultipleChoiceAnswer = string[] | null;
type DragDropAnswer = Record<string, string> | null;
type MatchingAnswer = Record<string, string> | null;
type UserAnswer =
  | SingleChoiceAnswer
  | MultipleChoiceAnswer
  | DragDropAnswer
  | MatchingAnswer;

// 타입 가드 함수들
const isMultipleChoice = (question: ChoiceQuestion): boolean => {
  return question.correctAnswers.length > 1;
};

const isFractionCircle = (question: ChoiceQuestion): boolean => {
  return question.media?.type === 'fraction-circle';
};

// 정답 확인 함수들 - 타입별로 분리
const singleChoiceChecker = {
  isCorrect: (
    question: ChoiceQuestion,
    answer: SingleChoiceAnswer,
  ): boolean => {
    return answer !== null && question.correctAnswers.includes(answer);
  },

  isComplete: (answer: SingleChoiceAnswer): boolean => {
    return answer !== null;
  },
};

const multipleChoiceChecker = {
  isCorrect: (
    question: ChoiceQuestion,
    answer: MultipleChoiceAnswer,
  ): boolean => {
    if (!answer || !Array.isArray(answer)) return false;

    // 선택한 답의 개수와 정답의 개수가 같아야 함
    if (answer.length !== question.correctAnswers.length) return false;

    // 모든 선택한 답이 정답에 포함되어야 함
    return (
      answer.every((ans) => question.correctAnswers.includes(ans)) &&
      question.correctAnswers.every((correct) => answer.includes(correct))
    );
  },

  isComplete: (answer: MultipleChoiceAnswer): boolean => {
    return answer !== null && Array.isArray(answer) && answer.length > 0;
  },
};

const dragDropChecker = {
  isCorrect: (question: DragDropQuestion, answer: DragDropAnswer): boolean => {
    if (!answer || !Array.isArray(question.correctPairs)) return false;

    const answerEntries = Object.entries(answer);
    return (
      answerEntries.length === question.correctPairs.length &&
      question.correctPairs.every(([slot, word]) => answer[slot] === word)
    );
  },

  isComplete: (question: DragDropQuestion, answer: DragDropAnswer): boolean => {
    return (
      answer !== null &&
      Object.keys(answer).length === question.leftLabels.length
    );
  },
};

const matchingChecker = {
  isCorrect: (question: MatchingQuestion, answer: MatchingAnswer): boolean => {
    if (!answer) return false;

    return Object.entries(question.correctMatches).every(
      ([key, val]) => answer[key] === val,
    );
  },

  isComplete: (question: MatchingQuestion, answer: MatchingAnswer): boolean => {
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
    switch (currentQuestion.type) {
      case 'choice': {
        const choiceQuestion = currentQuestion as ChoiceQuestion;

        if (isMultipleChoice(choiceQuestion)) {
          return multipleChoiceChecker.isComplete(
            userAnswer as MultipleChoiceAnswer,
          );
        }
        return singleChoiceChecker.isComplete(userAnswer as SingleChoiceAnswer);
      }

      case 'drag':
        return dragDropChecker.isComplete(
          currentQuestion as DragDropQuestion,
          userAnswer as DragDropAnswer,
        );

      case 'match':
        return matchingChecker.isComplete(
          currentQuestion as MatchingQuestion,
          userAnswer as MatchingAnswer,
        );

      default:
        return false;
    }
  };

  // 정답 확인
  const checkAnswer = (): void => {
    let isCorrect = false;

    switch (currentQuestion.type) {
      case 'choice': {
        const choiceQuestion = currentQuestion as ChoiceQuestion;

        if (isMultipleChoice(choiceQuestion)) {
          isCorrect = multipleChoiceChecker.isCorrect(
            choiceQuestion,
            userAnswer as MultipleChoiceAnswer,
          );
        } else {
          isCorrect = singleChoiceChecker.isCorrect(
            choiceQuestion,
            userAnswer as SingleChoiceAnswer,
          );
        }
        break;
      }

      case 'drag':
        isCorrect = dragDropChecker.isCorrect(
          currentQuestion as DragDropQuestion,
          userAnswer as DragDropAnswer,
        );
        break;

      case 'match':
        isCorrect = matchingChecker.isCorrect(
          currentQuestion as MatchingQuestion,
          userAnswer as MatchingAnswer,
        );
        break;
    }

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

  // 단일 선택 핸들러
  const handleSingleChoice = (answer: string): void => {
    setUserAnswer(answer);
  };

  // 다중 선택 핸들러
  const handleMultipleChoice = (answers: string[]): void => {
    setUserAnswer(answers);
  };

  // 드래그앤드롭 핸들러
  const handleDragDrop = (answer: Record<string, string>): void => {
    setUserAnswer(answer);
  };

  // 매칭 핸들러
  const handleMatching = (answer: Record<string, string>): void => {
    setUserAnswer(answer);
  };

  // 문제 컴포넌트 렌더링
  const renderQuestionComponent = () => {
    switch (currentQuestion.type) {
      case 'choice': {
        const choiceQuestion = currentQuestion as ChoiceQuestion;

        if (isFractionCircle(choiceQuestion)) {
          // 분수 원형 문제 (다중 선택)
          return (
            <FractionCircleQuestionCanvas
              key={currentQuestion.id}
              question={choiceQuestion}
              onAnswer={handleMultipleChoice}
              userAnswer={userAnswer as MultipleChoiceAnswer}
              feedbackVisible={feedbackVisible}
            />
          );
        }

        // 일반 선택형 문제 (단일 선택)
        return (
          <ChoiceQuestionCanvas
            key={currentQuestion.id}
            question={choiceQuestion}
            onAnswer={handleSingleChoice}
            userAnswer={userAnswer as SingleChoiceAnswer}
            feedbackVisible={feedbackVisible}
          />
        );
      }

      case 'drag':
        return (
          <DragDropQuestionCanvas
            key={currentQuestion.id}
            question={currentQuestion as DragDropQuestion}
            onDrop={handleDragDrop}
            feedbackVisible={feedbackVisible}
          />
        );

      case 'match':
        return (
          <MatchingQuestionCanvas
            key={currentQuestion.id}
            question={currentQuestion as MatchingQuestion}
            onMatch={handleMatching}
            userAnswer={userAnswer as MatchingAnswer}
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
