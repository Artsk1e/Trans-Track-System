import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/login-page'
import { WaybillsPage } from '@/pages/waybills-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { DeckAllocationPage } from '@/pages/deck-allocation-page'
import { TrackPage } from '@/pages/track-page'
import { SchedulePage } from '@/pages/schedule-page'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/waybills" element={<WaybillsPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/deck-allocation" element={<DeckAllocationPage />} />
      <Route path="/track" element={<TrackPage />} />
      <Route path="/schedule" element={<SchedulePage />} />
      {/* Root route shows login page */}
      <Route path="/" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App