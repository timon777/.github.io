import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import { messagesService } from '../services/supabase'
import { Chat, Message } from '../types'

interface ChatWindowProps {
  chat: Chat
  onClose: () => void
  onMessagesUpdate?: () => void
}

export default function ChatWindow({ chat, onClose, onMessagesUpdate }: ChatWindowProps) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const otherUser = chat.user1_id === user?.id ? chat.user2 : chat.user1

  useEffect(() => {
    if (!chat || !user) return

    loadMessages()

    // Subscribe to new messages
    const subscription = messagesService.subscribeToMessages(chat.id, (newMsg) => {
      setMessages((prev) => [...prev, newMsg as Message])
      scrollToBottom()

      // Mark as read if not from current user
      if (newMsg.sender_id !== user.id) {
        markMessagesAsRead()
      }

      // Notify parent to update chat list
      onMessagesUpdate?.()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [chat.id, user])

  const loadMessages = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await messagesService.getMessages(chat.id)
      setMessages(data)

      // Mark messages as read
      await markMessagesAsRead()

      // Scroll to bottom after loading
      setTimeout(scrollToBottom, 100)
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const markMessagesAsRead = async () => {
    if (!user) return
    try {
      await messagesService.markMessagesAsRead(chat.id, user.id)
      onMessagesUpdate?.()
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    try {
      setSending(true)
      await messagesService.sendMessage(chat.id, user.id, newMessage.trim())
      setNewMessage('')
      scrollToBottom()
    } catch (error) {
      console.error('Error sending message:', error)
      alert(t('messages.errorSending'))
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return t('messages.today')
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t('messages.yesterday')
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
    }
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {} as Record<string, Message[]>)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label={t('common.back')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
            {otherUser?.first_name?.charAt(0) || '?'}
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              {otherUser?.first_name} {otherUser?.last_name}
            </h2>
            {(chat.request || chat.offer) && (
              <p className="text-xs text-gray-500 truncate max-w-xs">
                {chat.request ? `📝 ${chat.request.title}` : `🎁 ${chat.offer?.title}`}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="hidden lg:block p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label={t('common.close')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
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
              <p className="text-sm">{t('messages.noMessages')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('messages.sendFirstMessage')}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="flex items-center justify-center my-4">
                  <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatDate(dateMessages[0].created_at)}
                  </div>
                </div>

                {/* Messages for this date */}
                {dateMessages.map((message) => {
                  const isOwnMessage = message.sender_id === user?.id

                  return (
                    <div
                      key={message.id}
                      className={`flex items-end space-x-2 mb-3 ${
                        isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      {/* Avatar */}
                      {!isOwnMessage && (
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-sm font-semibold flex-shrink-0">
                          {otherUser?.first_name?.charAt(0) || '?'}
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          isOwnMessage
                            ? 'bg-primary-600 text-white rounded-br-none'
                            : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage(e)
              }
            }}
            placeholder={t('messages.typePlaceholder')}
            rows={1}
            className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <span>{t('messages.send')}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
