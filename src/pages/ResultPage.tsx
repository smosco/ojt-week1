import { type ReactNode, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useResultStore, { useQuizStats } from '../stores/useResultStore';

// 성과 메시지 및 이모지 계산 함수
const getPerformanceMessage = (accuracyRate: number): { message: string; emoji: ReactNode } => {
  if (accuracyRate === 1) {
    return {
      message: '완벽해요! 최고예요!',
      emoji: <span className='text-5xl'>🏆</span>
    };
  }
  
  if (accuracyRate >= 0.8) {
    return {
      message: '아주 잘했어요!',
      emoji: <span className='text-5xl'>🌟</span>
    };
  }
  
  if (accuracyRate >= 0.5) {
    return {
      message: '잘했어요! 조금만 더!',
      emoji: <span className='text-5xl'>😊</span>
    };
  }
  
  return {
    message: '조금 더 연습해봐요!',
    emoji: <span className='text-5xl'>😅</span>
  };
};

// 시간 포맷팅 함수
const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${minutes}분 ${seconds}초`;
};

export default function ResultPage() {
  const navigate = useNavigate();
  const { reset } = useResultStore();
  const { correctCount, totalCount, accuracyRate, timeInSeconds } = useQuizStats();

  // 성과 메시지와 이모지를 메모화
  const { message, emoji } = useMemo(
    () => getPerformanceMessage(accuracyRate),
    [accuracyRate]
  );

  // 포맷된 시간을 메모화
  const formattedTime = useMemo(
    () => formatTime(timeInSeconds),
    [timeInSeconds]
  );

  const handleRestart = () => {
    reset();
    navigate('/question');
  };

  const handleGoHome = () => {
    reset();
    navigate('/');
  };

  return (
    <div className='w-screen h-screen bg-gradient-to-b from-sky-100 to-green-100 flex items-center justify-center px-4'>
      <div className='bg-white rounded-3xl shadow-lg p-8 w-full max-w-3xl text-center space-y-6'>
        {/* 제목 */}
        <h2 className='text-2xl font-bold text-gray-800'>
          🎉 문제 풀이 완료!
        </h2>

        {/* 이모지 */}
        {emoji}

        {/* 점수 표시 */}
        <div className='space-y-2'>
          <p className='text-xl text-gray-700'>
            <strong className='text-yellow-500 text-3xl'>{correctCount}</strong>
            {' '}/{' '}
            {totalCount} 문제 맞혔어요
          </p>
          
          {/* 정확도 표시 */}
          <p className='text-lg text-gray-600'>
            정확도: {Math.round(accuracyRate * 100)}%
          </p>
        </div>

        {/* 소요 시간 */}
        <p className='text-lg text-gray-500'>
          풀이 시간: {formattedTime}
        </p>

        {/* 성과 메시지 */}
        <div className='text-xl font-semibold text-pink-600'>
          {message}
        </div>

        {/* 버튼들 */}
        <div className='flex gap-4 justify-center mt-6'>
          <button
            type='button'
            onClick={handleRestart}
            className='px-6 py-3 rounded-full bg-yellow-300 hover:bg-yellow-400 shadow-md transition text-lg font-bold text-white'
          >
            다시 풀기
          </button>
          
          <button
            type='button'
            onClick={handleGoHome}
            className='px-6 py-3 rounded-full bg-blue-300 hover:bg-blue-400 shadow-md transition text-lg font-bold text-white'
          >
            홈으로
          </button>
        </div>

        {/* 상세 결과 (선택적) */}
        {totalCount > 0 && (
          <div className='mt-8 p-4 bg-gray-50 rounded-xl'>
            <h3 className='text-lg font-semibold text-gray-700 mb-2'>
              상세 결과
            </h3>
            <div className='grid grid-cols-3 gap-4 text-sm'>
              <div className='text-green-600'>
                <div className='font-bold text-lg'>{correctCount}</div>
                <div>정답</div>
              </div>
              <div className='text-red-500'>
                <div className='font-bold text-lg'>{totalCount - correctCount}</div>
                <div>오답</div>
              </div>
              <div className='text-blue-600'>
                <div className='font-bold text-lg'>{totalCount}</div>
                <div>총 문제</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}