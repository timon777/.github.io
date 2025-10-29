import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import DemoBanner from './DemoBanner'
import EmergencyBanner from './EmergencyBanner'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <DemoBanner />
      <EmergencyBanner />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
