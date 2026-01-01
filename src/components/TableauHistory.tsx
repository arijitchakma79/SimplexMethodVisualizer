import { useSimplex } from '../state'
import './TableauHistory.css'

export function TableauHistory() {
  const { state, dispatch } = useSimplex()
  const { history } = state

  if (history.length === 0) {
    return null
  }

  const handleLoadHistory = (index: number) => {
    dispatch({
      type: 'LOAD_HISTORY',
      payload: index
    })
  }

  return (
    <div className="tableau-history">
      <div className="history-header">
        <h3>Tableau History</h3>
        <div className="history-count">{history.length} step{history.length !== 1 ? 's' : ''}</div>
      </div>
      <div className="history-list">
        {history.map((entry, index) => (
          <div 
            key={index} 
            className={`history-item ${index === state.currentStep ? 'active' : ''}`}
            onClick={() => handleLoadHistory(index)}
          >
            <div className="history-step">Step {entry.stepNumber}</div>
            {entry.pivotRow && entry.pivotCol && (
              <div className="history-pivot">
                Pivot: ({entry.pivotRow}, {entry.pivotCol})
              </div>
            )}
            <div className="history-timestamp">
              {new Date(entry.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
