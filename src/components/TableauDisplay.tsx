import { useState, useEffect } from 'react'
import { useSimplex } from '../state'
import './TableauDisplay.css'

export function TableauDisplay() {
  const { state, dispatch } = useSimplex()
  const { lp } = state
  const [pivotRow, setPivotRow] = useState<string>('')
  const [pivotCol, setPivotCol] = useState<string>('')

  // Reset inputs when a new tableau is set up
  useEffect(() => {
    setPivotRow('')
    setPivotCol('')
  }, [lp])

  // Don't show tableau if no linear program or invalid data
  if (!lp || !lp.p || !lp.A || !lp.b) {
    return null
  }

  const { sense, p, A, b } = lp
  const numVars = p.length
  const numConstraints = A.length

  // Don't show if no variables or constraints
  if (numVars === 0 || numConstraints === 0) {
    return null
  }

  // Format number for display
  const formatNumber = (num: number): string => {
    if (num === 0) return '0'
    if (Number.isInteger(num)) return num.toString()
    return num.toFixed(2).replace(/\.?0+$/, '')
  }

  // Build variable names (x1, x2, ..., decision variables)
  const varNames: string[] = []
  for (let i = 0; i < numVars; i++) {
    varNames.push(`x${i + 1}`)
  }

  // Build basic variable labels (x3=, x4=, ... for constraints, z= for objective)
  const buildBasicVars = (): string[] => {
    const labels: string[] = []
    for (let i = 0; i < numConstraints; i++) {
      labels.push(`x${numVars + i + 1}`)
    }
    labels.push(`z`)
    return labels
  }

  const basicVars = buildBasicVars()

  // Calculate pivot column and row for Simplex method
  const calculatePivot = (): { col: number | null; row: number | null } => {
    // Find pivot column: most negative in z-row (for max) or most positive (for min)
    let pivotCol: number | null = null
    let bestValue = sense === 'max' ? Infinity : -Infinity

    for (let i = 0; i < numVars; i++) {
      const zValue = p[i]
      if (sense === 'max') {
        // For maximization, find most negative (or positive if all positive, then we're done)
        if (zValue < 0 && zValue < bestValue) {
          bestValue = zValue
          pivotCol = i
        }
      } else {
        // For minimization, find most positive (or negative if all negative, then we're done)
        if (zValue > 0 && zValue > bestValue) {
          bestValue = zValue
          pivotCol = i
        }
      }
    }

    if (pivotCol === null) {
      return { col: null, row: null } // Optimal solution reached
    }

    // Find pivot row: minimum ratio test (RHS / pivot column coefficient)
    let pivotRow: number | null = null
    let minRatio = Infinity

    for (let i = 0; i < numConstraints; i++) {
      const pivotCoeff = A[i][pivotCol]
      if (pivotCoeff > 0) {
        const ratio = -b[i] / pivotCoeff // Negate b because we negated it in display
        if (ratio >= 0 && ratio < minRatio) {
          minRatio = ratio
          pivotRow = i
        }
      }
    }

    return { col: pivotCol, row: pivotRow }
  }

  const pivot = calculatePivot()
  // Use input values directly - don't auto-populate, let user enter what they want
  const pivotColValue = pivotCol
  const pivotRowValue = pivotRow

  const handleJordanExchange = () => {
    const row = parseInt(pivotRowValue)
    const col = parseInt(pivotColValue)
    
    if (isNaN(row) || isNaN(col)) {
      dispatch({
        type: 'ERROR',
        payload: 'Please enter valid row and column numbers'
      })
      return
    }
    
    // Validate row and col are within bounds
    const totalRows = numConstraints + 1 // constraints + z row
    const totalCols = numVars + 1 // variables + RHS column
    
    if (row < 1 || row > totalRows) {
      dispatch({
        type: 'ERROR',
        payload: `Row must be between 1 and ${totalRows}`
      })
      return
    }
    
    if (col < 1 || col > totalCols) {
      dispatch({
        type: 'ERROR',
        payload: `Column must be between 1 and ${totalCols}`
      })
      return
    }
    
    dispatch({
      type: 'JORDAN_EXCHANGE',
      payload: { row, col }
    })
  }

  return (
    <div className="tableau-display">
      <div className="tableau-header">
        <div className="tableau-optimization-type">
          {sense === 'max' ? 'maximize' : 'minimize'}
        </div>
        <h3>Simplex Tableau</h3>
      </div>
      <div className="tableau-content">
        <table className="tableau-table">
          <thead>
            <tr>
              <th className="tableau-basic-header"></th>
              {varNames.map((name, index) => (
                <th key={index} className="tableau-var-header">{name}</th>
              ))}
              <th className="tableau-rhs-header">1</th>
            </tr>
          </thead>
          <tbody>
            {A.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="tableau-basic-var">{basicVars[rowIndex]} =</td>
                {row.map((coeff, colIndex) => (
                  <td key={colIndex} className="tableau-cell">
                    {formatNumber(coeff)}
                  </td>
                ))}
                <td className="tableau-rhs-cell">{formatNumber(-b[rowIndex])}</td>
              </tr>
            ))}
            <tr className="tableau-z-row">
              <td className="tableau-basic-var">{basicVars[basicVars.length - 1]} =</td>
              {p.map((coeff, colIndex) => (
                <td key={colIndex} className="tableau-cell">
                  {formatNumber(coeff)}
                </td>
              ))}
              <td className="tableau-rhs-cell">0</td>
            </tr>
          </tbody>
        </table>
        <div className="tableau-instructions">
          <div className="instruction-command">
            ljx(
            <input
              type="text"
              className="instruction-input"
              value={pivotRowValue}
              onChange={(e) => setPivotRow(e.target.value)}
              placeholder="row"
            />
            , 
            <input
              type="text"
              className="instruction-input"
              value={pivotColValue}
              onChange={(e) => setPivotCol(e.target.value)}
              placeholder="col"
            />
            )
          </div>
          <div className="instruction-buttons">
            <button 
              className="jordan-exchange-btn"
              onClick={handleJordanExchange}
              title="Perform Jordan exchange"
            >
              Execute
            </button>
            <button 
              className="clear-btn"
              onClick={() => {
                dispatch({ type: 'RESET' })
                setPivotRow('')
                setPivotCol('')
              }}
              title="Clear tableau and history"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
