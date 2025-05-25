import type { InteractiveQuestion } from '../types/question';

export const questionData: InteractiveQuestion[] = [
  {
    id: 'math4',
    type: 'choice',
    question: '다음 덧셈을 하세요.',
    expression: '6 + 1 = ?',
    options: ['5', '6', '7', '8'],
    correctAnswers: ['7'],
    media: {
      type: 'dots',
      groups: [6, 1],
      dotRadius: 10,
      dotSpacing: 16,
      groupSpacing: 24,
      dotColor: '#FF5A5A',
      startX: 50,
      startY: 60,
    },
  },
  {
    id: 'math5',
    type: 'choice',
    question: '색칠된 부분에 해당하는 분수를 고르세요.',
    options: ['1/4', '2/3', '3/4', '4/5'],
    correctAnswers: ['3/4'],
    media: {
      type: 'fraction-circle',
      totalParts: 4,
      filledParts: 3,
      radius: 40,
      fillColor: '#4FADF7',
      strokeColor: '#000000',
      centerX: 150,
      centerY: 100,
    },
  },
  // {
  //   id: 'drag1',
  //   type: 'drag',
  //   question: '다음 물체를 자석에 붙는지 여부에 따라 분류하세요.',
  //   draggableItems: ['클립', '나무 조각', '동전', '유리 조각', '못'],
  //   dropZones: ['붙는다', '붙지 않는다'],
  //   correctPlacements: {
  //     클립: '붙는다',
  //     못: '붙는다',
  //     '나무 조각': '붙지 않는다',
  //     동전: '붙지 않는다',
  //     '유리 조각': '붙지 않는다',
  //   },
  //   media: {
  //     type: 'object-icons',
  //     items: [
  //       { label: '클립', icon: 'clip.svg' },
  //       { label: '나무 조각', icon: 'wood.svg' },
  //       { label: '동전', icon: 'coin.svg' },
  //       { label: '유리 조각', icon: 'glass.svg' },
  //       { label: '못', icon: 'nail.svg' },
  //     ],
  //   },
  // },
  // {
  //   id: 'drag2',
  //   type: 'slot-drag',
  //   question: '다음 단어에 알맞은 영어를 빈칸에 끌어다 놓으세요.',
  //   slots: [
  //     { id: 'slot1', label: '사과' },
  //     { id: 'slot3', label: '오렌지' },
  //   ],
  //   draggableItems: ['apple', 'orange'],
  //   correctPlacements: {
  //     slot1: 'apple',
  //     slot3: 'orange',
  //   },
  // },
  {
    id: 'match1',
    type: 'match',
    question: '도형의 이름과 내각의 합을 연결해 보세요.',
    pairs: {
      left: ['정삼각형', '정사각형', '정오각형'],
      right: ['180도', '360도', '540도'],
    },
    correctMatches: {
      정삼각형: '180도',
      정사각형: '360도',
      정오각형: '540도',
    },
    media: {
      type: 'polygon-icons',
      icons: [
        { sides: 3, label: '정삼각형', color: '#FFD54F' },
        { sides: 4, label: '정사각형', color: '#4FC3F7' },
        { sides: 5, label: '정오각형', color: '#BA68C8' },
      ],
    },
  },
  {
    id: 'match2',
    type: 'match',
    question: '사자성어와 그 뜻을 올바르게 연결하세요.',
    pairs: {
      left: ['작심삼일', '우공이산', '일석이조'],
      right: [
        '잠깐 마음먹은 것을 오래 못함',
        '꾸준히 하면 큰 일도 이룸',
        '한 번에 두 가지 이익',
      ],
    },
    correctMatches: {
      작심삼일: '잠깐 마음먹은 것을 오래 못함',
      우공이산: '꾸준히 하면 큰 일도 이룸',
      일석이조: '한 번에 두 가지 이익',
    },
    media: {
      type: 'text-match',
      fontSize: 18,
      lineSpacing: 20,
    },
  },
];
