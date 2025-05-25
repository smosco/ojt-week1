import { useNavigate } from 'react-router-dom';
import QuestionRenderer from '../components/QuestionRenderer';
import { questionData } from '../data/questions';

export default function QuestionPage() {
  const navigate = useNavigate();

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const handleComplete = (results: any[]) => {
    // 결과를 저장하거나 전달 (예: localStorage or 상태관리)
    localStorage.setItem('quiz-results', JSON.stringify(results));
    navigate('/result');
  };

  return (
    <QuestionRenderer questions={questionData} onComplete={handleComplete} />
  );
}
