import { useState, useRef, useEffect } from 'react'
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
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const createRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setIsMobileMenuOpen(false)
    setIsProfileDropdownOpen(false)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
      if (createRef.current && !createRef.current.contains(event.target as Node)) {
        setIsCreateDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const bothPermissions = canCreateRequests() && canCreateOffers()

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0" onClick={closeMobileMenu}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">Ú</span>
            </div>
            <span className="text-xl md:text-2xl font-bold text-gray-900">Úmit</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
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

          {/* Desktop Auth buttons & Controls */}
          <div className="hidden lg:flex items-center space-x-3">
            <CitySelector />
            <LanguageSwitcher />

            {isAuthenticated && user ? (
              <>
                {/* Create Button with Dropdown */}
                {(canCreateRequests() || canCreateOffers()) && (
                  <div ref={createRef} className="relative">
                    {bothPermissions ? (
                      <>
                        <button
                          onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
                          className="btn-primary text-sm flex items-center space-x-1"
                        >
                          <span>{t('common.create')}</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                        {isCreateDropdownOpen && (
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[1001]">
                            <Link
                              to="/create-request"
                              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                              onClick={() => setIsCreateDropdownOpen(false)}
                            >
                              📝 {t('requests.createNew')}
                            </Link>
                            <Link
                              to="/create-offer"
                              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                              onClick={() => setIsCreateDropdownOpen(false)}
                            >
                              🎁 {t('registry.createNew')}
                            </Link>
                          </div>
                        )}
                      </>
                    ) : canCreateRequests() ? (
                      <Link to="/create-request" className="btn-primary text-sm">
                        {t('requests.createNew')}
                      </Link>
                    ) : (
                      <Link to="/create-offer" className="btn-primary text-sm">
                        {t('registry.createNew')}
                      </Link>
                    )}
                  </div>
                )}

                {/* Profile Dropdown */}
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">
                        {user.first_name?.[0] || user.email[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden xl:flex items-center space-x-1">
                      <span className="max-w-[100px] truncate">{user.first_name || user.email}</span>
                      <VerifiedBadge verified={user.verified || false} size="sm" />
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[1001]">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.first_name || user.email}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {t(`roles.${user.role}`)}
                        </p>
                      </div>

                      <Link
                        to={
                          user.role === 'admin'
                            ? '/dashboard/admin'
                            : user.role === 'donor'
                            ? '/dashboard/donor'
                            : '/dashboard/beneficiary'
                        }
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        📊 {t('nav.dashboard')}
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        👤 {t('nav.profile')}
                      </Link>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        🚪 {t('common.logout')}
                      </button>
                    </div>
                  )}
                </div>
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
          <div className="flex lg:hidden items-center">
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
          <div className="lg:hidden border-t border-gray-200 py-4">
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

              {/* Mobile Settings Section */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="px-2">
                  <p className="text-xs text-gray-500 mb-2">{t('common.settings')}</p>
                  <div className="flex items-center space-x-2">
                    <CitySelector />
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>

              {/* Mobile Auth Section */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                {isAuthenticated && user ? (
                  <>
                    {/* User Info */}
                    <div className="px-2 py-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-600 font-semibold">
                            {user.first_name?.[0] || user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate flex items-center space-x-1">
                            <span>{user.first_name || user.email}</span>
                            <VerifiedBadge verified={user.verified || false} size="sm" />
                          </p>
                          <p className="text-xs text-gray-500">{t(`roles.${user.role}`)}</p>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={
                        user.role === 'admin'
                          ? '/dashboard/admin'
                          : user.role === 'donor'
                          ? '/dashboard/donor'
                          : '/dashboard/beneficiary'
                      }
                      className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-1 block"
                      onClick={closeMobileMenu}
                    >
                      📊 {t('nav.dashboard')}
                    </Link>
                    <Link
                      to="/profile"
                      className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-1 block"
                      onClick={closeMobileMenu}
                    >
                      👤 {t('nav.profile')}
                    </Link>

                    {canCreateRequests() && (
                      <Link
                        to="/create-request"
                        className="block btn-primary text-center"
                        onClick={closeMobileMenu}
                      >
                        📝 {t('requests.createNew')}
                      </Link>
                    )}
                    {canCreateOffers() && (
                      <Link
                        to="/create-offer"
                        className="block btn-primary text-center"
                        onClick={closeMobileMenu}
                      >
                        🎁 {t('registry.createNew')}
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full btn-secondary text-red-600">
                      🚪 {t('common.logout')}
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
