// 기본 문제 인터페이스
interface BaseQuestion {
  id: string;
  question: string;
  prompt?: string;
}

// 선택형 문제
export interface ChoiceQuestion extends BaseQuestion {
  type: 'choice';
  options: string[];
  correctAnswers: string[];
  media?: DotsMedia | FractionCircleMedia | ClockMedia;
}

// 드래그앤드롭 문제
export interface DragDropQuestion extends BaseQuestion {
  type: 'drag';
  leftLabels: string[]; // 드래그 가능한 항목들
  options: string[]; // 슬롯들 (ex: 예각, 직각, 둔각)
  correctPairs: [string, string][]; // [항목, 정답 슬롯]
  media?: ImageItemsMedia;
}

// 선 연결형 문제
export interface MatchingQuestion extends BaseQuestion {
  type: 'match';
  pairs: {
    left: string[];
    right: string[];
  };
  correctMatches: Record<string, string>;
  media?: PolygonIconsMedia | TextMatchMedia;
}

// 문제 타입 통합 (중복 제거)
export type InteractiveQuestion = ChoiceQuestion | DragDropQuestion | MatchingQuestion;

// 답안 타입들
export type ChoiceAnswer = string;
export type DragDropAnswer = Record<string, string>;
export type MatchingAnswer = Record<string, string>;

// DropZone 정의
export interface DropZoneLabel {
  label: string;
  description?: string;
}

// Media 타입들
export interface DotsMedia {
  type: 'dots';
  groups: number[];
  dotRadius: number;
  dotSpacing: number;
  groupSpacing: number;
  dotColor: string;
  startX?: number;
  startY?: number;
}

export interface FractionCircleMedia {
  type: 'fraction-circle';
  totalParts: number;
  filledParts: number;
  radius: number;
  fillColor: string;
  strokeColor: string;
  centerX?: number;
  centerY?: number;
}

export interface ClockMedia {
  type: 'clock';
  hour: number;
  minute: number;
  radius?: number;
}

export interface ObjectIconsMedia {
  type: 'object-icons';
  items: {
    label: string;
    icon: string;
  }[];
}

export interface CategoryBoxesMedia {
  type: 'category-boxes';
  dropZoneStyle: {
    width: number;
    height: number;
    fillColor: string;
  };
  labels?: Record<string, string>;
}

export interface DropZoneMedia {
  type: 'dropzones';
  zones: {
    label: string;
    width: number;
    height: number;
    left: number;
    top: number;
    fillColor?: string;
    borderColor?: string;
    textColor?: string;
  }[];
}

export interface PolygonIconsMedia {
  type: 'polygon-icons';
  icons: {
    sides: number;
    label: string;
    color: string;
  }[];
}

export interface TextMatchMedia {
  type: 'text-match';
  fontSize: number;
  lineSpacing: number;
}

export interface ImageItemsMedia {
  type: 'image-items';
  items: {
    label: string;
    image: string;
  }[];
}

// 유틸리티 타입들
export type QuestionType = InteractiveQuestion['type'];
export type MediaType = 
  | DotsMedia['type']
  | FractionCircleMedia['type'] 
  | ClockMedia['type']
  | ObjectIconsMedia['type']
  | CategoryBoxesMedia['type']
  | DropZoneMedia['type']
  | PolygonIconsMedia['type']
  | TextMatchMedia['type']
  | ImageItemsMedia['type'];