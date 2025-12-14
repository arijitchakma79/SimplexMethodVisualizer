import type { Matrix, Vector } from "./types";

export interface LinearProgram {
    A: Matrix;        // constraint matrix (m x n)
    b: Vector;        // b (m x 1)
    p: Vector;        // objective coefficients (n x 1)
    sense: "max" | "min";
  }