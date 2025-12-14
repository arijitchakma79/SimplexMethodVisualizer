import type { SimplexState } from "./simplexTypes";

export const initialSimplexState: SimplexState = {
  lp: null,
  steps: [],
  currentStep: 0,
  status: "idle",
  error: null
};
