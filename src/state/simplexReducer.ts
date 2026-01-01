import type { SimplexState, SimplexAction, TableauHistory } from "./simplexTypes";
import { initialSimplexState } from "./simplexInitialState";
import { jordanExchange } from "../simplex/jordan_exchange";
import type { Matrix } from "../types/math";

export function simplexReducer(
  state: SimplexState,
  action: SimplexAction
): SimplexState {
  switch (action.type) {
    case "SET_LP":
      // Save initial tableau to history
      const newHistory: TableauHistory[] = [
        {
          lp: action.payload,
          stepNumber: 0,
          timestamp: Date.now()
        }
      ]
      
      return {
        ...state,
        lp: action.payload,
        steps: [],
        currentStep: 0,
        history: newHistory,
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

    case "LOAD_HISTORY":
      const historyIndex = action.payload
      if (historyIndex >= 0 && historyIndex < state.history.length) {
        const historyEntry = state.history[historyIndex]
        return {
          ...state,
          lp: historyEntry.lp,
          currentStep: historyIndex,
          status: "ready",
          error: null
        }
      }
      return state

    case "ERROR":
      return {
        ...state,
        status: "error",
        error: action.payload
      };

    case "JORDAN_EXCHANGE":
      if (!state.lp) {
        return {
          ...state,
          status: "error",
          error: "No linear program set up"
        };
      }

      try {
        const { row, col } = action.payload
        const { A, b, p } = state.lp
        
        // Build the full tableau matrix: [A | b] stacked with [p | 0]
        const tableau: Matrix = []
        
        // Add constraint rows
        for (let i = 0; i < A.length; i++) {
          tableau.push([...A[i], -b[i]]) // Negate b because we display it negated
        }
        
        // Add objective row
        tableau.push([...p, 0])
        
        // Perform Jordan exchange (convert to 0-based indexing)
        const pivotRow = row - 1
        const pivotCol = col - 1
        
        if (pivotRow < 0 || pivotRow >= tableau.length || pivotCol < 0 || pivotCol >= tableau[0].length) {
          return {
            ...state,
            status: "error",
            error: "Invalid pivot row or column"
          };
        }
        
        const newTableau = jordanExchange(tableau, pivotRow, pivotCol)
        
        // Extract A, b, p from the new tableau
        const newA: Matrix = []
        const newB: number[] = []
        const newP: number[] = []
        
        // Extract constraint rows (excluding the last row which is z)
        for (let i = 0; i < A.length; i++) {
          const rowData = newTableau[i]
          newA.push(rowData.slice(0, -1))
          newB.push(-rowData[rowData.length - 1]) // Negate back
        }
        
        // Extract objective row (last row)
        const zRow = newTableau[newTableau.length - 1]
        newP.push(...zRow.slice(0, -1))
        
        const updatedLP: LinearProgram = {
          ...state.lp,
          A: newA,
          b: newB,
          p: newP
        }
        
        // Save to history
        const historyEntry: TableauHistory = {
          lp: updatedLP,
          stepNumber: state.history.length,
          pivotRow: row,
          pivotCol: col,
          timestamp: Date.now()
        }
        
        const updatedHistory = [...state.history, historyEntry]
        
        return {
          ...state,
          lp: updatedLP,
          history: updatedHistory,
          status: "ready",
          error: null
        };
      } catch (error) {
        return {
          ...state,
          status: "error",
          error: error instanceof Error ? error.message : "Jordan exchange failed"
        };
      }

    default:
      return state;
  }
}
