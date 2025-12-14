import type { Matrix, Vector } from "./math";

export type VariableName = string;

export interface PivotInfo {
  enteringVar: VariableName | null;
  leavingVar: VariableName | null;
  pivotRow: number | null;
  pivotCol: number | null;
}

export interface SimplexStep {
  tableau: Matrix;
  basis: VariableName[];
  vertex: Vector;
  objectiveValue: number;
  pivot: PivotInfo;
}
