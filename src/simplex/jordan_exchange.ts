import type { Matrix } from '../types/math'

/**
 * Performs a Jordan exchange (pivot operation) on a tableau
 * @param tableau The tableau matrix (rows x cols)
 * @param pivotRow The row index (0-based) of the pivot element
 * @param pivotCol The column index (0-based) of the pivot element
 * @returns A new tableau matrix after the exchange
 */
export function jordanExchange(
  tableau: Matrix,
  pivotRow: number,
  pivotCol: number
): Matrix {
  const rows = tableau.length
  const cols = tableau[0].length
  const pivot = tableau[pivotRow][pivotCol]

  if (Math.abs(pivot) < 1e-10) {
    throw new Error('Pivot element is too close to zero')
  }

  // Create a deep copy of the tableau
  const newTableau: Matrix = tableau.map(row => [...row])

  // Normalize pivot row: divide entire row by pivot element
  for (let j = 0; j < cols; j++) {
    newTableau[pivotRow][j] /= pivot
  }

  // Eliminate pivot column entries in all other rows
  // For each row i (except pivot row):
  // row[i] = row[i] - (row[i][pivotCol] / pivot) * normalized_pivot_row
  // But since we've normalized, we use: row[i] = row[i] - row[i][pivotCol] * normalized_pivot_row
  for (let i = 0; i < rows; i++) {
    if (i !== pivotRow) {
      const factor = tableau[i][pivotCol] // Use original value before any changes
      for (let j = 0; j < cols; j++) {
        newTableau[i][j] -= (factor / pivot) * newTableau[pivotRow][j]
      }
    }
  }

  return newTableau
}
