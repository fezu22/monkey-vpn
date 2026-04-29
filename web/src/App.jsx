import { Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Territories from './pages/Territories.jsx'
import Profile from './pages/Profile.jsx'
import SurvivalKit from './pages/SurvivalKit.jsx'
import Agility from './pages/Agility.jsx'
import AppLayout from './components/AppLayout.jsx'
import { useAuth } from './lib/auth.jsx'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="grid place-items-center h-full text-gold-500">Waking the monkey…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route element={<Protected><AppLayout /></Protected>}>
        <Route path="/app" element={<Dashboard />} />
        <Route path="/app/territories" element={<Territories />} />
        <Route path="/app/agility" element={<Agility />} />
        <Route path="/app/profile" element={<Profile />} />
        <Route path="/app/survival-kit" element={<SurvivalKit />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
