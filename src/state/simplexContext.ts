import { createContext, useContext } from "react";
import type { Dispatch } from "react";
import type { SimplexState, SimplexAction } from "./simplexTypes";
import { initialSimplexState } from "./simplexInitialState";

interface SimplexContextValue {
  state: SimplexState;
  dispatch: Dispatch<SimplexAction>;
}

export const SimplexContext = createContext<SimplexContextValue>({
  state: initialSimplexState,
  dispatch: () => {}
});

export function useSimplex() {
  return useContext(SimplexContext);
}
