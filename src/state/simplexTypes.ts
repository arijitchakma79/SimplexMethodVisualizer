import type { LinearProgram, SimplexStep } from "../types";

export interface TableauHistory {
  lp: LinearProgram;
  stepNumber: number;
  pivotRow?: number;
  pivotCol?: number;
  timestamp: number;
}

export interface SimplexState {
  lp: LinearProgram | null;

  steps: SimplexStep[];
  currentStep: number;
  
  history: TableauHistory[];

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
  | { type: "ERROR"; payload: string }
  | { type: "JORDAN_EXCHANGE"; payload: { row: number; col: number } }
  | { type: "LOAD_HISTORY"; payload: number };
