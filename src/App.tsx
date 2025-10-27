import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RequestsPage from './pages/RequestsPage'
import CreateRequestPage from './pages/CreateRequestPage'
import ProfilePage from './pages/ProfilePage'
import SheltersPage from './pages/SheltersPage'
import VolunteersPage from './pages/VolunteersPage'
import MapPage from './pages/MapPage'
import RegistryPage from './pages/RegistryPage'
import { useAuthStore } from './stores/authStore'

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route path="registry" element={<RegistryPage />} />
        <Route path="shelters" element={<SheltersPage />} />
        <Route path="volunteers" element={<VolunteersPage />} />
        <Route path="map" element={<MapPage />} />

        {/* Protected routes */}
        <Route
          path="create-request"
          element={isAuthenticated ? <CreateRequestPage /> : <Navigate to="/login" />}
        />
        <Route
          path="profile"
          element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Route>
    </Routes>
  )
}

export default App
