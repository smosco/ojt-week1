import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionRenderer from '../components/QuestionRenderer';
import { questionData } from '../data/questions';
import useResultStore from '../stores/useResultStore';

export default function QuestionPage() {
  const navigate = useNavigate();
  const { start, finish } = useResultStore();

  useEffect(() => {
    start(questionData.length);
  }, [questionData]);

  const handleComplete = () => {
    finish();
    navigate('/result');
  };

  return (
    <QuestionRenderer questions={questionData} onComplete={handleComplete} />
  );
}
