import { type ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useResultStore from '../stores/useResultStore'; // zustand 상태 가져오기

export default function ResultPage() {
  const navigate = useNavigate();
  const { results, timeInSeconds, reset } = useResultStore();
  const [message, setMessage] = useState('');
  const [emoji, setEmoji] = useState<ReactNode | null>(null);
  // 시간 포매팅
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  const formattedTime = `${minutes}분 ${seconds}초`;

  const totalCnt = results.length;
  const correctCnt = results.filter((result) => result.isCorrect).length;
  console.log(results, timeInSeconds);

  useEffect(() => {
    const rate = correctCnt / totalCnt;

    if (rate === 1) {
      setMessage('완벽해요! 최고예요!');
      setEmoji(<span className='text-5xl'>🏆</span>);
    } else if (rate >= 0.8) {
      setMessage('아주 잘했어요!');
      setEmoji(<span className='text-5xl'>🌟</span>);
    } else if (rate >= 0.5) {
      setMessage('잘했어요! 조금만 더!');
      setEmoji(<span className='text-5xl'>😊</span>);
    } else {
      setMessage('조금 더 연습해봐요!');
      setEmoji(<span className='text-5xl'>😅</span>);
    }
  }, [results]);

  const handleRestart = () => {
    reset();
    navigate('/question');
  };

  return (
    <div className='w-screen h-screen bg-gradient-to-b from-sky-100 to-green-100 flex items-center justify-center px-4'>
      <div className='bg-white rounded-3xl shadow-lg p-8 w-full max-w-3xl text-center space-y-6'>
        <h2 className='text-2xl font-bold text-gray-800'>🎉 문제 풀이 완료!</h2>

        {emoji}

        <p className='text-xl text-gray-700'>
          <strong className='text-yellow-500 text-3xl'>{correctCnt}</strong> /{' '}
          {totalCnt} 문제 맞혔어요
        </p>

        <p className='text-lg text-gray-500'>풀이 시간: {formattedTime}</p>

        <div className='text-xl font-semibold text-pink-600'>{message}</div>

        <button
          type='button'
          onClick={handleRestart}
          className='mt-6 px-6 py-3 rounded-full bg-yellow-300 hover:bg-yellow-400 shadow-md transition text-lg font-bold text-white'
        >
          다시 풀기
        </button>
      </div>
    </div>
  );
}
