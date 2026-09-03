import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { Dashboard } from './pages/Dashboard'
import { LiveVision } from './pages/LiveVision'
import { MineMap } from './pages/MineMap'
import { Telemetry } from './pages/Telemetry'
import { GasMonitoring } from './pages/GasMonitoring'
import { Communication } from './pages/Communication'
import { RoverControl } from './pages/RoverControl'
import { MissionLogs } from './pages/MissionLogs'
import { Reports } from './pages/Reports'
import { Rover3D } from './pages/Rover3D'
import { telemetryService } from './services/telemetryService'

export default function App() {
  useEffect(() => {
    // Start WebSocket connection on mount
    telemetryService.connect()
    return () => {
      telemetryService.disconnect()
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/live-vision" element={<LiveVision />} />
          <Route path="/mine-map" element={<MineMap />} />
          <Route path="/telemetry" element={<Telemetry />} />
          <Route path="/gas-monitoring" element={<GasMonitoring />} />
          <Route path="/communication" element={<Communication />} />
          <Route path="/rover-control" element={<RoverControl />} />
          <Route path="/mission-logs" element={<MissionLogs />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/rover-3d" element={<Rover3D />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
