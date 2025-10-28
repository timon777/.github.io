import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import { useRoleAccess } from '../hooks/useRoleAccess'
import LanguageSwitcher from './LanguageSwitcher'
import CitySelector from './CitySelector'
import VerifiedBadge from './VerifiedBadge'

export default function Header() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { canCreateRequests, canCreateOffers } = useRoleAccess()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setIsMobileMenuOpen(false)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">Ú</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Úmit</span>
          </Link>

          {/* Desktop Navigation */}
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

          {/* Desktop Auth buttons & Language Switcher */}
          <div className="hidden md:flex items-center space-x-2">
            <CitySelector />
            <LanguageSwitcher />

            {isAuthenticated && user ? (
              <>
                {canCreateRequests() && (
                  <Link to="/create-request" className="btn-primary text-sm">
                    {t('requests.createNew')}
                  </Link>
                )}
                {canCreateOffers() && (
                  <Link to="/create-offer" className="btn-primary text-sm">
                    {t('registry.createNew')}
                  </Link>
                )}
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
                <button onClick={handleLogout} className="btn-secondary text-sm">
                  {t('common.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                  {t('common.login')}
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  {t('common.register')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <CitySelector />
            <LanguageSwitcher />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-primary-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/requests"
                className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-1"
                onClick={closeMobileMenu}
              >
                {t('nav.requests')}
              </Link>
              <Link
                to="/registry"
                className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-1"
                onClick={closeMobileMenu}
              >
                {t('nav.registry')}
              </Link>
              <Link
                to="/shelters"
                className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-1"
                onClick={closeMobileMenu}
              >
                {t('nav.shelters')}
              </Link>
              <Link
                to="/volunteers"
                className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-1"
                onClick={closeMobileMenu}
              >
                {t('nav.volunteers')}
              </Link>
              <Link
                to="/map"
                className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-1"
                onClick={closeMobileMenu}
              >
                {t('nav.map')}
              </Link>

              {/* Mobile Auth Section */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                {isAuthenticated && user ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors px-2 py-1"
                      onClick={closeMobileMenu}
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
                    {canCreateRequests() && (
                      <Link
                        to="/create-request"
                        className="block btn-primary text-center"
                        onClick={closeMobileMenu}
                      >
                        {t('requests.createNew')}
                      </Link>
                    )}
                    {canCreateOffers() && (
                      <Link
                        to="/create-offer"
                        className="block btn-primary text-center"
                        onClick={closeMobileMenu}
                      >
                        {t('registry.createNew')}
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full btn-secondary">
                      {t('common.logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block text-center text-gray-700 hover:text-primary-600 transition-colors px-2 py-1"
                      onClick={closeMobileMenu}
                    >
                      {t('common.login')}
                    </Link>
                    <Link
                      to="/register"
                      className="block btn-primary text-center"
                      onClick={closeMobileMenu}
                    >
                      {t('common.register')}
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
