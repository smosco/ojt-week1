import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className='text-2xl font-bold mb-4'>문제 풀이</h1>
      <button
        type='button'
        className='px-4 py-2 bg-blue-500 text-white rounded'
        onClick={() => navigate('/question')}
      >
        시작하기
      </button>
    </div>
  );
}
