import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RequestsPage from './pages/RequestsPage'
import RequestDetailPage from './pages/RequestDetailPage'
import CreateRequestPage from './pages/CreateRequestPage'
import EditRequestPage from './pages/EditRequestPage'
import CreateOfferPage from './pages/CreateOfferPage'
import OfferDetailPage from './pages/OfferDetailPage'
import EditOfferPage from './pages/EditOfferPage'
import ProfilePage from './pages/ProfilePage'
import SheltersPage from './pages/SheltersPage'
import VolunteersPage from './pages/VolunteersPage'
import MapPage from './pages/MapPage'
import RegistryPage from './pages/RegistryPage'
import MessagesPage from './pages/MessagesPage'
import BeneficiaryDashboard from './pages/BeneficiaryDashboard'
import DonorDashboard from './pages/DonorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import WriteReviewPage from './pages/WriteReviewPage'
import VerificationRequestPage from './pages/VerificationRequestPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route path="requests/:id" element={<RequestDetailPage />} />
        <Route
          path="requests/:id/edit"
          element={
            <ProtectedRoute requireRoles={['beneficiary', 'shelter', 'ngo', 'admin']}>
              <EditRequestPage />
            </ProtectedRoute>
          }
        />
        <Route path="registry" element={<RegistryPage />} />
        <Route path="offers/:id" element={<OfferDetailPage />} />
        <Route
          path="offers/:id/edit"
          element={
            <ProtectedRoute requireRoles={['donor', 'shelter', 'ngo', 'admin']}>
              <EditOfferPage />
            </ProtectedRoute>
          }
        />
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
        <Route
          path="messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="reviews/write/:userId"
          element={
            <ProtectedRoute>
              <WriteReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="verification/request"
          element={
            <ProtectedRoute>
              <VerificationRequestPage />
            </ProtectedRoute>
          }
        />

        {/* Dashboard routes */}
        <Route
          path="dashboard/beneficiary"
          element={
            <ProtectedRoute requireRoles={['beneficiary', 'shelter', 'ngo', 'admin']}>
              <BeneficiaryDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/donor"
          element={
            <ProtectedRoute requireRoles={['donor', 'shelter', 'ngo', 'admin']}>
              <DonorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/admin"
          element={
            <ProtectedRoute requireRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
