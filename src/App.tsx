import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Dashboard } from './pages/Dashboard'
import { AdminPage } from './pages/AdminPage'
import { MethodologyPage } from './pages/MethodologyPage'
import { WelcomeModal } from './components/WelcomeModal'

function App() {
  const [showWelcome, setShowWelcome] = useState(true)

  return (
    <AuthProvider>
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
