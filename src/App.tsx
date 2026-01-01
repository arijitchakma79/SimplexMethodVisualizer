import { useState, useEffect } from 'react'
import './App.css'
import { InputForm } from './components/InputForm'
import { LinearProgramDisplay } from './components/LinearProgramDisplay'
import { TableauDisplay } from './components/TableauDisplay'
import { TableauHistory } from './components/TableauHistory'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLeftColumnFullscreen, setIsLeftColumnFullscreen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      return savedTheme
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  const toggleLeftColumnFullscreen = () => {
    setIsLeftColumnFullscreen(prev => !prev)
  }

  return (
    <div className={`app-container ${isLeftColumnFullscreen ? 'left-fullscreen' : ''}`}>
      <div className={`left-column ${isSidebarOpen ? 'open' : 'closed'} ${isLeftColumnFullscreen ? 'fullscreen' : ''}`}>
        <div className="sidebar-header">
          <div className="header-buttons">
            <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button 
              className="fullscreen-btn" 
              onClick={toggleLeftColumnFullscreen} 
              title={isLeftColumnFullscreen ? 'Exit fullscreen' : 'Fullscreen left column'}
            >
              {isLeftColumnFullscreen ? '⤓' : '⤢'}
            </button>
            <button className="toggle-btn" onClick={toggleSidebar} title="Toggle sidebar">
              {isSidebarOpen ? '←' : '→'}
            </button>
          </div>
        </div>
        <div className="sidebar-content">
          <TableauDisplay />
          <InputForm />
          <LinearProgramDisplay />
          <TableauHistory />
        </div>
      </div>
      {!isLeftColumnFullscreen && (
        <div className="right-column">
          <div className="visualization-header">
            <div className="header-left">
              {!isSidebarOpen && (
                <button className="toggle-btn" onClick={toggleSidebar} title="Open sidebar">
                  →
                </button>
              )}
            </div>
            <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
          <div className="visualization-content">
            {/* Visualization content will go here */}
            <p>Visualization will be displayed here</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
