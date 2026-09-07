import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in A.R.M.O.R. UI:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] h-full p-6 text-center bg-[#0B1117] text-[#E8EDF2]">
          <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="font-display text-lg font-bold uppercase tracking-wider text-armor-text-primary mb-2">
            Subsystem UI Exception Recovered
          </h2>
          <p className="font-mono text-xs text-armor-text-dim max-w-md mb-4">
            A temporary component error occurred while rendering telemetry or diagnostics data.
          </p>
          {this.state.error && (
            <pre className="font-mono text-[11px] p-3 rounded bg-[#0D1620] border border-[#1E2D3D] text-red-400 max-w-xl overflow-x-auto text-left mb-6">
              {this.state.error.toString()}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded font-mono text-xs font-bold bg-[#1D8CF8] hover:bg-[#1D8CF8]/80 text-white transition-colors"
          >
            <RefreshCw size={14} />
            RELOAD MISSION CONTROL
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
