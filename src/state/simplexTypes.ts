import type { LinearProgram, SimplexStep } from "../types";

export interface SimplexState {
  lp: LinearProgram | null;

  steps: SimplexStep[];
  currentStep: number;

  status:
    | "idle"
    | "ready"
    | "running"
    | "optimal"
    | "unbounded"
    | "infeasible"
    | "error";

  error: string | null;
}

export type SimplexAction =
  | { type: "SET_LP"; payload: LinearProgram }
  | {
      type: "LOAD_STEPS";
      payload: {
        steps: SimplexStep[];
        status: SimplexState["status"];
      };
    }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "GOTO_STEP"; payload: number }
  | { type: "RESET" }
  | { type: "ERROR"; payload: string };
