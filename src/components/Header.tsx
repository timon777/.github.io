import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import LanguageSwitcher from './LanguageSwitcher'
import VerifiedBadge from './VerifiedBadge'

export default function Header() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">Ú</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Úmit</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/requests" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('nav.requests')}
            </Link>
            <Link to="/registry" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('nav.registry')}
            </Link>
            <Link to="/shelters" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('nav.shelters')}
            </Link>
            <Link to="/volunteers" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('nav.volunteers')}
            </Link>
            <Link to="/map" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('nav.map')}
            </Link>
          </nav>

          {/* Auth buttons & Language Switcher */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />

            {isAuthenticated && user ? (
              <>
                <Link to="/create-request" className="btn-primary">
                  {t('requests.createNew')}
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">
                      {user.first_name?.[0] || user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="flex items-center space-x-1">
                    <span>{user.first_name || user.email}</span>
                    <VerifiedBadge verified={user.verified || false} size="sm" />
                  </span>
                </Link>
                <button onClick={handleLogout} className="btn-secondary">
                  {t('common.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                  {t('common.login')}
                </Link>
                <Link to="/register" className="btn-primary">
                  {t('common.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
