import { useState, useEffect } from 'react'
import { useSimplex } from '../state'
import type { LinearProgram } from '../types'
import './InputForm.css'

interface Constraint {
  coefficients: string[]
  operator: '<=' | '>=' | '='
  value: string
}

export function InputForm() {
  const { dispatch } = useSimplex()
  const [sense, setSense] = useState<'max' | 'min'>('max')
  const [objectiveCoefficients, setObjectiveCoefficients] = useState<string[]>([''])
  const [constraints, setConstraints] = useState<Constraint[]>([
    { coefficients: [''], operator: '<=', value: '' }
  ])

  const addObjectiveVariable = () => {
    setObjectiveCoefficients([...objectiveCoefficients, ''])
  }

  const removeObjectiveVariable = (index: number) => {
    if (objectiveCoefficients.length > 1) {
      setObjectiveCoefficients(objectiveCoefficients.filter((_, i) => i !== index))
      // Remove the coefficient at the same index from all constraints
      setConstraints(constraints.map(constraint => ({
        ...constraint,
        coefficients: constraint.coefficients.filter((_, i) => i !== index)
      })))
    }
  }

  const updateObjectiveCoefficient = (index: number, value: string) => {
    const updated = [...objectiveCoefficients]
    updated[index] = value
    setObjectiveCoefficients(updated)
  }

  const addConstraint = () => {
    const numVars = objectiveCoefficients.length
    setConstraints([
      ...constraints,
      { coefficients: Array(numVars).fill(''), operator: '<=', value: '' }
    ])
  }

  const removeConstraint = (index: number) => {
    if (constraints.length > 1) {
      setConstraints(constraints.filter((_, i) => i !== index))
    }
  }

  const updateConstraintCoefficient = (constraintIndex: number, varIndex: number, value: string) => {
    const updated = [...constraints]
    updated[constraintIndex].coefficients[varIndex] = value
    setConstraints(updated)
  }

  const updateConstraintOperator = (index: number, operator: '<=' | '>=' | '=') => {
    const updated = [...constraints]
    updated[index].operator = operator
    setConstraints(updated)
  }

  const updateConstraintValue = (index: number, value: string) => {
    const updated = [...constraints]
    updated[index].value = value
    setConstraints(updated)
  }

  // Sync constraints whenever the number of variables changes
  useEffect(() => {
    const numVars = objectiveCoefficients.length
    setConstraints(prevConstraints => 
      prevConstraints.map(constraint => {
        const currentLength = constraint.coefficients.length
        if (currentLength < numVars) {
          return {
            ...constraint,
            coefficients: [...constraint.coefficients, ...Array(numVars - currentLength).fill('')]
          }
        } else if (currentLength > numVars) {
          return {
            ...constraint,
            coefficients: constraint.coefficients.slice(0, numVars)
          }
        }
        return constraint
      })
    )
  }, [objectiveCoefficients.length])

  const handleObjectiveVariableChange = (index: number, value: string) => {
    updateObjectiveCoefficient(index, value)
  }

  const parseNumber = (value: string): number => {
    const trimmed = value.trim()
    if (trimmed === '' || trimmed === '-') return 0
    return parseFloat(trimmed) || 0
  }

  const handleSubmit = () => {
    try {
      // Parse objective function
      const p = objectiveCoefficients.map(parseNumber)
      const numVars = p.length

      // Parse constraints
      const A: number[][] = []
      const b: number[] = []
      const originalOperators: ("<=" | ">=" | "=")[] = []

      for (const constraint of constraints) {
        const row = constraint.coefficients.map(parseNumber)
        const rhs = parseNumber(constraint.value)

        // Convert all constraints to >= form (standard form)
        if (constraint.operator === '<=') {
          // For <= constraints, multiply by -1 to convert to >=
          A.push(row.map(x => -x))
          b.push(-rhs)
          originalOperators.push('<=')
        } else if (constraint.operator === '=') {
          // For equality, we add both >= constraints
          A.push(row)
          b.push(rhs)
          originalOperators.push('=')
          A.push(row.map(x => -x))
          b.push(-rhs)
          originalOperators.push('=')
        } else {
          // >= constraint (already in standard form)
          A.push(row)
          b.push(rhs)
          originalOperators.push('>=')
        }
      }

      const lp: LinearProgram = {
        sense,
        p,
        A,
        b,
        originalOperators
      }

      dispatch({ type: 'SET_LP', payload: lp })
    } catch (error) {
      dispatch({ 
        type: 'ERROR', 
        payload: error instanceof Error ? error.message : 'Invalid input' 
      })
    }
  }

  return (
    <div className="input-form">
      <div className="form-section">
        <label className="form-label">Optimization Type</label>
        <select 
          className="form-select" 
          value={sense} 
          onChange={(e) => setSense(e.target.value as 'max' | 'min')}
          title="Optimization type"
        >
          <option value="max">Maximize</option>
          <option value="min">Minimize</option>
        </select>
      </div>

      <div className="form-section">
        <div className="form-section-header">
          <label className="form-label">Objective Function</label>
          <button 
            type="button" 
            className="add-btn" 
            onClick={addObjectiveVariable}
            title="Add variable"
          >
            + Add Variable
          </button>
        </div>
        <div className="objective-function">
          {objectiveCoefficients.map((coeff, index) => (
            <div key={index} className="objective-term">
              <input
                type="text"
                className="form-input coefficient-input"
                placeholder="0"
                value={coeff}
                onChange={(e) => handleObjectiveVariableChange(index, e.target.value)}
              />
              <span className="variable-label">x{index + 1}</span>
              {objectiveCoefficients.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeObjectiveVariable(index)}
                  title="Remove variable"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-header">
          <label className="form-label">Constraints</label>
          <button 
            type="button" 
            className="add-btn" 
            onClick={addConstraint}
            title="Add constraint"
          >
            + Add Constraint
          </button>
        </div>
        <div className="constraints-list">
          {constraints.map((constraint, constraintIndex) => (
            <div key={constraintIndex} className="constraint-item">
              <div className="constraint-coefficients">
                {constraint.coefficients.map((coeff, varIndex) => (
                  <div key={varIndex} className="constraint-term">
                    <input
                      type="text"
                      className="form-input coefficient-input"
                      placeholder="0"
                      value={coeff}
                      onChange={(e) => updateConstraintCoefficient(constraintIndex, varIndex, e.target.value)}
                    />
                    <span className="variable-label">x{varIndex + 1}</span>
                    {varIndex < constraint.coefficients.length - 1 && (
                      <span className="plus-sign">+</span>
                    )}
                  </div>
                ))}
              </div>
              <select
                className="form-select operator-select"
                value={constraint.operator}
                onChange={(e) => updateConstraintOperator(constraintIndex, e.target.value as '<=' | '>=' | '=')}
                title="Constraint operator"
              >
                <option value="<=">≤</option>
                <option value=">=">≥</option>
                <option value="=">=</option>
              </select>
              <input
                type="text"
                className="form-input value-input"
                placeholder="0"
                value={constraint.value}
                onChange={(e) => updateConstraintValue(constraintIndex, e.target.value)}
              />
              {constraints.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeConstraint(constraintIndex)}
                  title="Remove constraint"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <button 
        type="button" 
        className="submit-btn" 
        onClick={handleSubmit}
      >
        Set up tableau
      </button>
    </div>
  )
}
