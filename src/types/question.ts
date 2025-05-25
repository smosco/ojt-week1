// 문제 타입 통합
export type InteractiveQuestion =
  | ChoiceQuestion
  | DragDropQuestion
  | SlotDragQuestion
  | MatchingQuestion;

// 선택형 문제
export type ChoiceQuestion = {
  id: string;
  type: 'choice';
  question: string;
  expression?: string;
  options: string[];
  correctAnswers: string[];
  media?: DotsMedia | FractionCircleMedia | ClockMedia;
};

// 드래그앤드롭 문제
export type DragDropQuestion = {
  id: string;
  type: 'drag';
  question: string;
  draggableItems: string[];
  dropZones: string[] | DropZoneLabel[];
  correctPlacements: Record<string, string>;
  media?: ObjectIconsMedia | CategoryBoxesMedia | DropZoneMedia;
};

export type SlotDragQuestion = {
  id: string;
  type: 'slot-drag';
  question: string;
  slots: {
    id: string;
    label: string; // 예: '사과'
    preset?: string; // 이미 채워진 값 (optional)
  }[];
  draggableItems: string[]; // ex: ['apple', 'orange']
  correctPlacements: Record<string, string>; // slotId → 정답
};

// 선 연결형 문제
export type MatchingQuestion = {
  id: string;
  type: 'match';
  question: string;
  pairs: {
    left: string[];
    right: string[];
  };
  correctMatches: Record<string, string>;
  media?: PolygonIconsMedia | TextMatchMedia;
};

// DropZone 정의
export type DropZoneLabel = {
  label: string;
  description?: string;
};

// media 타입들
export type DotsMedia = {
  type: 'dots';
  groups: number[];
  dotRadius: number;
  dotSpacing: number;
  groupSpacing: number;
  dotColor: string;
  startX?: number;
  startY?: number;
};

export type FractionCircleMedia = {
  type: 'fraction-circle';
  totalParts: number;
  filledParts: number;
  radius: number;
  fillColor: string;
  strokeColor: string;
  centerX?: number;
  centerY?: number;
};

export type ClockMedia = {
  type: 'clock';
  hour: number;
  minute: number;
  radius?: number;
};

export type ObjectIconsMedia = {
  type: 'object-icons';
  items: {
    label: string;
    icon: string;
  }[];
};

export type CategoryBoxesMedia = {
  type: 'category-boxes';
  dropZoneStyle: {
    width: number;
    height: number;
    fillColor: string;
  };
  labels?: Record<string, string>;
};

export type DropZoneMedia = {
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
};

export type PolygonIconsMedia = {
  type: 'polygon-icons';
  icons: {
    sides: number;
    label: string;
    color: string;
  }[];
};

export type TextMatchMedia = {
  type: 'text-match';
  fontSize: number;
  lineSpacing: number;
};
