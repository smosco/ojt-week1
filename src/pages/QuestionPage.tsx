import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionRenderer from '../components/QuestionRenderer';
import { questionData } from '../data/questions';
import useResultStore, { useQuizProgress } from '../stores/useResultStore';

export default function QuestionPage() {
  const navigate = useNavigate();
  const { start, finish } = useResultStore();
  const { isComplete } = useQuizProgress();

  useEffect(() => {
    // 문제 데이터가 있을 때만 시작
    if (questionData.length > 0) {
      start(questionData.length);
    }
  }, [start]);

  // 퀴즈 완료 처리
  useEffect(() => {
    if (isComplete) {
      finish();
      navigate('/result');
    }
  }, [isComplete, finish, navigate]);

  const handleComplete = () => {
    finish();
    navigate('/result');
  };

  // 문제 데이터가 없는 경우 처리
  if (questionData.length === 0) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-[#B6E3FF] to-[#D5F8CE] flex items-center justify-center'>
        <div className='bg-white rounded-3xl shadow-xl p-8 text-center'>
          <h2 className='text-2xl font-bold text-gray-700 mb-4'>
            문제를 불러오는 중...
          </h2>
          <p className='text-gray-500'>잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <QuestionRenderer questions={questionData} onComplete={handleComplete} />
  );
}
