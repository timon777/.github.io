import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { notificationsService } from '../services/supabase'
import { useAuthStore } from '../stores/authStore'
import type { Notification } from '../types'

export default function NotificationDropdown() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load notifications
  useEffect(() => {
    if (!user) return

    const loadNotifications = async () => {
      try {
        setLoading(true)
        const [allNotifications, count] = await Promise.all([
          notificationsService.getAll(user.id),
          notificationsService.getUnreadCount(user.id),
        ])
        setNotifications(allNotifications.slice(0, 5)) // Show only 5 most recent
        setUnreadCount(count)
      } catch (error) {
        console.error('Error loading notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()

    // Subscribe to real-time notifications
    const subscription = notificationsService.subscribeToNotifications(
      user.id,
      (notification) => {
        setNotifications((prev) => [notification, ...prev.slice(0, 4)])
        setUnreadCount((prev) => prev + 1)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return
    try {
      await notificationsService.markAllAsRead(user.id)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'response_received':
        return '📬'
      case 'response_accepted':
        return '✅'
      case 'response_rejected':
        return '❌'
      case 'new_message':
        return '💬'
      case 'request_matched':
      case 'offer_matched':
        return '🎯'
      case 'verification_approved':
        return '✓'
      case 'verification_rejected':
        return '✗'
      case 'system':
        return '🔔'
      default:
        return '📢'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return t('notifications.justNow')
    if (diffMins < 60) return t('notifications.minutesAgo', { count: diffMins })
    if (diffHours < 24) return t('notifications.hoursAgo', { count: diffHours })
    if (diffDays < 7) return t('notifications.daysAgo', { count: diffDays })
    return date.toLocaleDateString()
  }

  if (!user) return null

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
        aria-label={t('notifications.title')}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-[1001] max-h-[500px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">{t('notifications.title')}</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-sm">{t('notifications.empty')}</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-primary-50' : ''
                  }`}
                >
                  {notification.link ? (
                    <Link
                      to={notification.link}
                      onClick={() => {
                        handleMarkAsRead(notification.id)
                        setIsOpen(false)
                      }}
                      className="block p-4"
                    >
                      <NotificationItem notification={notification} getNotificationIcon={getNotificationIcon} formatTime={formatTime} />
                    </Link>
                  ) : (
                    <div
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="block p-4 cursor-pointer"
                    >
                      <NotificationItem notification={notification} getNotificationIcon={getNotificationIcon} formatTime={formatTime} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {t('notifications.viewAll')}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Separate component for notification item
function NotificationItem({
  notification,
  getNotificationIcon,
  formatTime,
}: {
  notification: Notification
  getNotificationIcon: (type: string) => string
  formatTime: (date: string) => string
}) {
  return (
    <div className="flex space-x-3">
      <div className="flex-shrink-0 text-2xl">{getNotificationIcon(notification.type)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
        <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-1">{formatTime(notification.created_at)}</p>
      </div>
      {!notification.read && (
        <div className="flex-shrink-0">
          <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
        </div>
      )}
    </div>
  )
}
