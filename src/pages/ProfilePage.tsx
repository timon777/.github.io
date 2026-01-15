import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import ReviewsList from '../components/ReviewsList'

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return <div>Loading...</div>
  }

  // Mock stats
  const stats = {
    requestsCreated: 5,
    requestsCompleted: 3,
    donationsMade: 12,
    volunteersHelped: 8,
    rating: 4.7,
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">Профиль</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-3xl font-bold">
                    {user.first_name?.[0] || user.email[0].toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-bold mb-1">
                  {user.first_name} {user.last_name}
                </h2>
                <p className="text-gray-600 text-sm mb-3">{user.email}</p>
                {user.verified && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Верифицирован
                  </span>
                )}

                {user.rating && (
                  <div className="mt-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-lg font-bold">{user.rating}</span>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t space-y-2 text-left">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Роль: <span className="font-semibold ml-1">
                      {user.role === 'beneficiary' ? 'Нуждающийся' :
                       user.role === 'donor' ? 'Благотворитель' :
                       user.role === 'volunteer' ? 'Волонтёр' :
                       user.role === 'shelter' ? 'Приют' :
                       user.role === 'ngo' ? 'НКО' : 'Другое'}
                    </span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {user.phone}
                    </div>
                  )}
                </div>

                <Link to="/profile/edit" className="mt-6 w-full btn-outline block text-center">
                  Редактировать профиль
                </Link>

                {!user.verified && (
                  <Link to="/verification/request" className="mt-3 w-full btn-primary block text-center">
                    🔒 Пройти верификацию
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Stats and Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Статистика</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary-50 rounded-lg">
                  <div className="text-3xl font-bold text-primary-600">{stats.requestsCreated}</div>
                  <div className="text-sm text-gray-600 mt-1">Запросов создано</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{stats.requestsCompleted}</div>
                  <div className="text-sm text-gray-600 mt-1">Запросов выполнено</div>
                </div>
                <div className="text-center p-4 bg-secondary-50 rounded-lg">
                  <div className="text-3xl font-bold text-secondary-600">{stats.donationsMade}</div>
                  <div className="text-sm text-gray-600 mt-1">Помощь оказана</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">{stats.volunteersHelped}</div>
                  <div className="text-sm text-gray-600 mt-1">Волонтёров помогло</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600">{stats.rating}</div>
                  <div className="text-sm text-gray-600 mt-1">Рейтинг</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Последняя активность</h3>
              <div className="space-y-4">
                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">Запрос выполнен</div>
                    <div className="text-sm text-gray-600">Получена помощь: Продукты питания</div>
                    <div className="text-xs text-gray-500 mt-1">2 дня назад</div>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">Создан новый запрос</div>
                    <div className="text-sm text-gray-600">Нужны продукты питания</div>
                    <div className="text-xs text-gray-500 mt-1">5 дней назад</div>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">Новый отклик</div>
                    <div className="text-sm text-gray-600">Волонтёр откликнулся на ваш запрос</div>
                    <div className="text-xs text-gray-500 mt-1">1 неделю назад</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Достижения</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg">
                  <div className="text-4xl mb-2">🏅</div>
                  <div className="font-semibold text-sm">Первый запрос</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                  <div className="text-4xl mb-2">✅</div>
                  <div className="font-semibold text-sm">Верифицирован</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                  <div className="text-4xl mb-2">🤝</div>
                  <div className="font-semibold text-sm">Помог другим</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg opacity-50">
                  <div className="text-4xl mb-2">🔒</div>
                  <div className="font-semibold text-sm">Заблокировано</div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="card">
              <ReviewsList userId={user.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
