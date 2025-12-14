import type { SimplexState, SimplexAction } from "./simplexTypes";
import { initialSimplexState } from "./simplexInitialState";

export function simplexReducer(
  state: SimplexState,
  action: SimplexAction
): SimplexState {
  switch (action.type) {
    case "SET_LP":
      return {
        ...state,
        lp: action.payload,
        steps: [],
        currentStep: 0,
        status: "ready",
        error: null
      };

    case "LOAD_STEPS":
      return {
        ...state,
        steps: action.payload.steps,
        currentStep: 0,
        status: action.payload.status,
        error: null
      };

    case "NEXT_STEP":
      return {
        ...state,
        currentStep: Math.min(
          state.currentStep + 1,
          state.steps.length - 1
        )
      };

    case "PREV_STEP":
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 0)
      };

    case "GOTO_STEP":
      return {
        ...state,
        currentStep: Math.min(
          Math.max(action.payload, 0),
          state.steps.length - 1
        )
      };

    case "RESET":
      return initialSimplexState;

    case "ERROR":
      return {
        ...state,
        status: "error",
        error: action.payload
      };

    default:
      return state;
  }
}
