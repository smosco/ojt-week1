export type BaseQuestion = {
  id: string;
  type: 'choice' | 'match' | 'drag';
  question: string;
};

export type ChoiceQuestion = BaseQuestion & {
  type: 'choice';
  prompt?: string;
  multiple: boolean;
  options: string[];
  correctAnswers: string[];
};

export type MatchQuestion = BaseQuestion & {
  type: 'match';
  leftOptions: string[];
  rightOptions: string[];
  correctPairs: [string, string][];
};

export type DragQuestion = {
  question: string;
  leftLabels: string[];
  rightLabels: string[];
  options: string[];
  correctPairs: [string, string][];
};

export type AnyQuestion = ChoiceQuestion | MatchQuestion | DragQuestion;
