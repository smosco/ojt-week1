import type { InteractiveQuestion } from '../types/question';

export const questionData: InteractiveQuestion[] = [
  {
    id: 'choice1',
    type: 'choice',
    question: '다음 덧셈을 하세요.',
    prompt: '7 + 3 = ?',
    options: ['5', '6', '7', '8', '9', '10'],
    correctAnswers: ['10'],
    media: {
      type: 'dots',
      groups: [7, 3],
      dotRadius: 18,
      dotSpacing: 24,
      groupSpacing: 120,
      dotColor: '#FF5A5A',
      startX: 50,
      startY: 60,
    },
  },
  {
    id: 'choice2',
    type: 'choice',
    question: '색칠된 부분보다 큰 분수를 모두 고르세요.',
    options: ['1/4', '2/3', '3/4', '4/5', '7/8'],
    correctAnswers: ['4/5', '7/8'],
    media: {
      type: 'fraction-circle',
      totalParts: 8,
      filledParts: 5, // 기준 분수: 5/8
      radius: 80,
      fillColor: '#60a5fa',
      strokeColor: '#1e40af',
      centerX: 150,
      centerY: 100,
    },
  },
  {
    id: 'drag1',
    type: 'drag',
    question: '각도를 보고 알맞은 분류에 끌어 놓으세요.',
    leftLabels: ['30도', '90도', '150도'],
    options: ['예각', '직각', '둔각'],
    correctPairs: [
      ['30도', '예각'],
      ['90도', '직각'],
      ['150도', '둔각'],
    ],
    media: {
      type: 'image-items',
      items: [
        { label: '30도', image: '/images/acute.png' },
        { label: '90도', image: '/images/right.png' },
        { label: '150도', image: '/images/obtuse.png' },
      ],
    },
  },
  {
    id: 'drag2',
    type: 'drag',
    question: '도형을 보고 한 각의 크기를 알맞게 연결하세요.',
    leftLabels: ['정삼각형', '정사각형', '정오각형'],
    options: ['60도', '108도', '90도'],
    correctPairs: [
      ['정삼각형', '60도'],
      ['정사각형', '90도'],
      ['정오각형', '108도'],
    ],
    media: {
      type: 'image-items',
      items: [
        { label: '정삼각형', image: '/images/triangle.png' },
        { label: '정사각형', image: '/images/square.png' },
        { label: '정오각형', image: '/images/pentagon.png' },
      ],
    },
  },
  {
    id: 'match1',
    type: 'match',
    question: '단위를 측정 대상과 알맞게 연결하세요.',
    pairs: {
      left: ['kg', 'm', 'L'],
      right: ['길이', '무게', '부피'],
    },
    correctMatches: {
      kg: '무게',
      m: '길이',
      L: '부피',
    },
  },
  {
    id: 'match2',
    type: 'match',
    question: '단위에 따라 알맞은 수치를 연결해 보세요.',
    pairs: {
      left: ['1m', '100cm', '1km'],
      right: ['1000m', '100cm', '1m'],
    },
    correctMatches: {
      '1m': '100cm',
      '100cm': '1m',
      '1km': '1000m',
    },
  },
];
