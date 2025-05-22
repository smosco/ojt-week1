import DragMatchCanvas from './components/DragMatch';
import PairMatch from './components/PairMatch';
import WordSelection from './components/WordSelection';
import type { DragQuestion, MatchQuestion } from './types/question';

const matchQuestion: MatchQuestion = {
  id: 'q2',
  type: 'match',
  question: '본문을 읽고, 사괘에 담긴 뜻을 알맞게 이어 보세요.',
  leftOptions: ['건', '곤', '감', '이'],
  rightOptions: ['땅, 풍요', '하늘, 정의', '불, 광명', '물, 지혜'],
  correctPairs: [
    ['건', '하늘, 정의'],
    ['곤', '땅, 풍요'],
    ['감', '물, 지혜'],
    ['이', '불, 광명'],
  ],
};

const dragQuestion: DragQuestion = {
  question: '한옥과 양옥의 차이를 생각해 보고, 빈칸에 알맞은 말을 옮겨 보세요.',
  leftLabels: ['창호지', '대청마루', '부뚜막'],
  rightLabels: ['유리', '거실', '보일러'],
  options: ['유리', '거실', '부뚜막', '보일러', '구렛나루'],
  correctPairs: [
    ['창호지', '유리'],
    ['대청마루', '거실'],
    ['부뚜막', '보일러'],
  ],
};

function App() {
  return (
    <>
      <WordSelection />
      <PairMatch question={matchQuestion} />
      <DragMatchCanvas question={dragQuestion} />
    </>
  );
}

export default App;
