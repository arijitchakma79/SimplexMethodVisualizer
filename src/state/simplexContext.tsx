import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import type { Dispatch } from "react";
import type { SimplexState, SimplexAction } from "./simplexTypes";
import { initialSimplexState } from "./simplexInitialState";
import { simplexReducer } from "./simplexReducer";
import type { LinearProgram } from "../types";

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

interface SimplexProviderProps {
  children: ReactNode;
}

// Load state from localStorage
function loadStateFromStorage(): SimplexState {
  try {
    const savedState = localStorage.getItem('simplex_state')
    if (savedState) {
      const parsed = JSON.parse(savedState)
      // Validate and return saved state
      if (parsed && typeof parsed === 'object') {
        return {
          ...initialSimplexState,
          ...parsed,
          // Ensure lp is properly structured if it exists
          lp: parsed.lp ? parsed.lp as LinearProgram : null,
          history: parsed.history || []
        }
      }
    }
  } catch (e) {
    console.error('Failed to load state from storage:', e)
  }
  return initialSimplexState
}

export function SimplexProvider({ children }: SimplexProviderProps) {
  const [state, dispatch] = useReducer(simplexReducer, loadStateFromStorage());

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      const stateToSave = {
        lp: state.lp,
        history: state.history,
        currentStep: state.currentStep,
        status: state.status,
        error: state.error
      }
      localStorage.setItem('simplex_state', JSON.stringify(stateToSave))
    } catch (e) {
      console.error('Failed to save state to storage:', e)
    }
  }, [state.lp, state.history, state.currentStep, state.status, state.error])

  return (
    <SimplexContext.Provider value={{ state, dispatch }}>
      {children}
    </SimplexContext.Provider>
  );
}
