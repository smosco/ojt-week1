import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className='w-screen h-screen bg-gradient-to-b from-[#B6E3FF] to-[#D5F8CE] flex items-center justify-center overflow-hidden relative'>
      {/* 배경 캐릭터, 장식 */}
      <img
        src='/bg-clouds.svg'
        alt='구름'
        className='absolute top-0 left-0 w-full opacity-60 pointer-events-none'
      />
      <img
        src='/bg-mascot.svg'
        alt='마스코트'
        className='absolute bottom-0 right-0 w-[300px] lg:w-[400px] pointer-events-none'
      />

      {/* 메인 콘텐츠 */}
      <div className='text-center z-10'>
        <h1 className='text-6xl font-extrabold text-[#333] drop-shadow-md mb-6'>
          🎯 문제 풀이 시작!
        </h1>
        <p className='text-2xl text-[#444] mb-10'>
          오늘도 즐겁게 퀴즈 풀어볼까? ✨
        </p>

        <button
          type='button'
          onClick={() => navigate('/question')}
          className='px-12 py-5 bg-yellow-300 hover:bg-yellow-400 active:scale-95 transition-all duration-200 text-2xl font-bold text-white rounded-[2rem] shadow-lg'
        >
          🚀 시작하기
        </button>
      </div>
    </div>
  );
}
