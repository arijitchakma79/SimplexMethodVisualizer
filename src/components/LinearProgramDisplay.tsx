import { useSimplex } from '../state'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import './LinearProgramDisplay.css'

export function LinearProgramDisplay() {
  const { state } = useSimplex()
  const { lp } = state

  if (!lp) {
    return null
  }

  const { sense, p, A, b, originalOperators } = lp

  // Format number for LaTeX
  const formatNumber = (num: number): string => {
    if (num === 0) return '0'
    if (Number.isInteger(num)) return num.toString()
    return num.toFixed(2).replace(/\.?0+$/, '')
  }

  // Build LaTeX for objective function
  const buildObjectiveLaTeX = (): string => {
    const terms: string[] = []
    
    for (let i = 0; i < p.length; i++) {
      if (p[i] !== 0) {
        const coeff = p[i]
        if (coeff === 1) {
          terms.push(`x_{${i + 1}}`)
        } else if (coeff === -1) {
          terms.push(`-x_{${i + 1}}`)
        } else {
          terms.push(`${formatNumber(coeff)}x_{${i + 1}}`)
        }
      }
    }
    
    if (terms.length === 0) return '0'
    return terms.join(' + ').replace(/\+\s+-/g, '- ')
  }

  // Check if a constraint is a non-negativity constraint (x_i >= 0)
  const isNonNegativityConstraint = (row: number[], rhs: number): number | null => {
    if (rhs !== 0) return null
    let varIndex = -1
    for (let i = 0; i < row.length; i++) {
      if (row[i] !== 0) {
        if (row[i] === 1 && varIndex === -1) {
          varIndex = i
        } else {
          return null // More than one non-zero or not 1
        }
      }
    }
    return varIndex >= 0 ? varIndex : null
  }

  // Build LaTeX for constraint
  const buildConstraintLaTeX = (row: number[], rhs: number, originalOp?: string, constraintIndex: number = -1): { latex: string; operator: string; displayRhs: number } => {
    // Check if this is a non-negativity constraint
    const nonNegVar = isNonNegativityConstraint(row, rhs)
    if (nonNegVar !== null) {
      return {
        latex: `x_{${nonNegVar + 1}}`,
        operator: '\\geq',
        displayRhs: 0
      }
    }

    // Use original operator if available
    let operator = '\\geq' // Default to >= since that's the standard form
    let displayRhs = rhs
    let displayRow = [...row] // Create a copy to avoid mutation
    
    if (originalOp === '<=') {
      // Reverse the conversion: if it was <=, convert back
      operator = '\\leq'
      displayRhs = -rhs
      // Reverse the row coefficients
      displayRow = displayRow.map(x => -x)
    } else if (originalOp === '=') {
      operator = '='
      displayRhs = rhs
    } else {
      // >= constraint (already in standard form)
      operator = '\\geq'
      displayRhs = rhs
    }

    const terms: string[] = []
    
    for (let i = 0; i < displayRow.length; i++) {
      if (displayRow[i] !== 0) {
        const coeff = displayRow[i]
        if (coeff === 1) {
          terms.push(`x_{${i + 1}}`)
        } else if (coeff === -1) {
          terms.push(`-x_{${i + 1}}`)
        } else {
          terms.push(`${formatNumber(coeff)}x_{${i + 1}}`)
        }
      }
    }
    
    if (terms.length === 0) return { latex: '0', operator, displayRhs }
    return { latex: terms.join(' + ').replace(/\+\s+-/g, '- '), operator, displayRhs }
  }

  // Build LaTeX for matrix p
  const buildMatrixPLaTeX = (): string => {
    const elements = p.map(formatNumber).join(' \\\\ ')
    return `\\begin{bmatrix} ${elements} \\end{bmatrix}`
  }

  // Build LaTeX for matrix A (converting constraints back to original form for display)
  const buildMatrixALaTeX = (): string => {
    const rows = A.map((row, index) => {
      const rhs = b[index]
      const originalOp = originalOperators?.[index]
      const nonNegVar = isNonNegativityConstraint(row, rhs)
      
      if (nonNegVar !== null) {
        // Non-negativity constraint is already in correct form (x_i >= 0)
        return row.map(formatNumber).join(' & ')
      }
      
      // For <= constraints, reverse the conversion to show original form
      if (originalOp === '<=') {
        const displayRow = row.map(x => -x)
        return displayRow.map(formatNumber).join(' & ')
      }
      
      // For >= and = constraints, display as is
      return row.map(formatNumber).join(' & ')
    }).join(' \\\\ ')
    return `\\begin{bmatrix} ${rows} \\end{bmatrix}`
  }

  // Build LaTeX for matrix b (converting constraints back to original form for display)
  const buildMatrixBLaTeX = (): string => {
    const elements = b.map((value, index) => {
      const originalOp = originalOperators?.[index]
      // For <= constraints, reverse the conversion to show original RHS
      if (originalOp === '<=') {
        return formatNumber(-value)
      }
      return formatNumber(value)
    }).join(' \\\\ ')
    return `\\begin{bmatrix} ${elements} \\end{bmatrix}`
  }

  return (
    <div className="lp-display">
      <div className="lp-display-header">
        <h3>Problem Display</h3>
      </div>
      <div className="lp-display-content">
        <div className="lp-section">
          <div className="lp-objective">
            <span className="lp-label">{sense === 'max' ? 'max' : 'min'}</span>
            <InlineMath math={buildObjectiveLaTeX()} />
          </div>
        </div>

        <div className="lp-section">
          <div className="lp-label">subject to</div>
          <div className="lp-constraints">
            {A.map((row, index) => {
              const originalOp = originalOperators?.[index]
              const constraint = buildConstraintLaTeX([...row], b[index], originalOp, index)
              return (
                <div key={index} className="lp-constraint">
                  <InlineMath math={`${constraint.latex} ${constraint.operator} ${formatNumber(constraint.displayRhs)}`} />
                </div>
              )
            })}
          </div>
        </div>

        <div className="lp-section">
          <div className="lp-matrix-group">
            <span className="lp-matrix-label">p =</span>
            <BlockMath math={buildMatrixPLaTeX()} />
          </div>
        </div>

        <div className="lp-section">
          <div className="lp-matrix-group">
            <span className="lp-matrix-label">A =</span>
            <BlockMath math={buildMatrixALaTeX()} />
          </div>
        </div>

        <div className="lp-section">
          <div className="lp-matrix-group">
            <span className="lp-matrix-label">b =</span>
            <BlockMath math={buildMatrixBLaTeX()} />
          </div>
        </div>
      </div>
    </div>
  )
}
