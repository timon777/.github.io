import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import { messagesService } from '../services/supabase'
import { Chat } from '../types'
import ChatWindow from '../components/ChatWindow'

export default function MessagesPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [loading, setLoading] = useState(true)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!user) return

    loadChats()

    // Subscribe to chat updates
    const subscription = messagesService.subscribeToChats(user.id, () => {
      loadChats()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const loadChats = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await messagesService.getChats(user.id)
      setChats(data)

      // Calculate unread counts for each chat
      const counts: Record<string, number> = {}
      for (const chat of data) {
        const messages = await messagesService.getMessages(chat.id)
        const unreadCount = messages.filter(
          (m) => m.sender_id !== user.id && !m.read
        ).length
        counts[chat.id] = unreadCount
      }
      setUnreadCounts(counts)
    } catch (error) {
      console.error('Error loading chats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getOtherUser = (chat: Chat) => {
    if (!user) return null
    return chat.user1_id === user.id ? chat.user2 : chat.user1
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('messages.loginRequired')}
          </h2>
          <p className="text-gray-600">{t('messages.loginRequiredDesc')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6 h-[calc(100vh-120px)]">
          {/* Chat List Sidebar */}
          <div className="w-full lg:w-96 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">{t('messages.title')}</h1>
            </div>

            {/* Chats List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : chats.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-sm">{t('messages.noChats')}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {chats.map((chat) => {
                    const otherUser = getOtherUser(chat)
                    const unreadCount = unreadCounts[chat.id] || 0
                    const isSelected = selectedChat?.id === chat.id

                    return (
                      <button
                        key={chat.id}
                        onClick={() => setSelectedChat(chat)}
                        className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-primary-50' : ''
                        }`}
                      >
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                            {otherUser?.first_name?.charAt(0) || '?'}
                          </div>
                        </div>

                        {/* Chat Info */}
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {otherUser?.first_name} {otherUser?.last_name}
                            </h3>
                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                              {formatTime(chat.last_message_at)}
                            </span>
                          </div>

                          {/* Context (request or offer) */}
                          {(chat.request || chat.offer) && (
                            <p className="text-xs text-gray-600 truncate mb-1">
                              {chat.request
                                ? `📝 ${chat.request.title}`
                                : `🎁 ${chat.offer?.title}`}
                            </p>
                          )}

                          {/* Unread Badge */}
                          {unreadCount > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">{t('messages.newMessages')}</span>
                              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-primary-600 rounded-full">
                                {unreadCount}
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="hidden lg:flex flex-1 bg-white rounded-lg shadow-md overflow-hidden">
            {selectedChat ? (
              <ChatWindow
                chat={selectedChat}
                onClose={() => setSelectedChat(null)}
                onMessagesUpdate={loadChats}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <svg
                    className="w-24 h-24 mx-auto mb-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p>{t('messages.selectChat')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Chat Window (Full Screen Overlay) */}
        {selectedChat && (
          <div className="lg:hidden fixed inset-0 bg-white z-50">
            <ChatWindow
              chat={selectedChat}
              onClose={() => setSelectedChat(null)}
              onMessagesUpdate={loadChats}
            />
          </div>
        )}
      </div>
    </div>
  )
}
