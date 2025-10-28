import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RequestsPage from './pages/RequestsPage'
import CreateRequestPage from './pages/CreateRequestPage'
import CreateOfferPage from './pages/CreateOfferPage'
import OfferDetailPage from './pages/OfferDetailPage'
import ProfilePage from './pages/ProfilePage'
import SheltersPage from './pages/SheltersPage'
import VolunteersPage from './pages/VolunteersPage'
import MapPage from './pages/MapPage'
import RegistryPage from './pages/RegistryPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route path="registry" element={<RegistryPage />} />
        <Route path="offers/:id" element={<OfferDetailPage />} />
        <Route path="shelters" element={<SheltersPage />} />
        <Route path="volunteers" element={<VolunteersPage />} />
        <Route path="map" element={<MapPage />} />

        {/* Role-based protected routes */}
        <Route
          path="create-request"
          element={
            <ProtectedRoute requireRoles={['beneficiary', 'shelter', 'ngo', 'admin']}>
              <CreateRequestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="create-offer"
          element={
            <ProtectedRoute requireRoles={['donor', 'shelter', 'ngo', 'admin']}>
              <CreateOfferPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
