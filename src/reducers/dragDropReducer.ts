export type AnswerMap = Record<string, string>;

export type DragDropAction =
  | { type: 'DROP_WORD'; payload: { word: string; slot: string } }
  | { type: 'REMOVE_WORD'; payload: { word: string } }
  | { type: 'RESET' };

export function dragDropReducer(
  state: AnswerMap,
  action: DragDropAction,
): AnswerMap {
  switch (action.type) {
    case 'DROP_WORD': {
      const { word, slot } = action.payload;
      const newState = { ...state };
      Object.keys(newState).forEach((key) => {
        if (newState[key] === word) delete newState[key];
      });
      newState[slot] = word;
      return newState;
    }
    case 'REMOVE_WORD': {
      const { word } = action.payload;
      const newState = { ...state };
      Object.keys(newState).forEach((key) => {
        if (newState[key] === word) delete newState[key];
      });
      return newState;
    }
    case 'RESET':
      return {};
    default:
      return state;
  }
}
