import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { User } from '../types'

export default function VolunteersPage() {
  const { t } = useTranslation()

  // Mock data for top volunteers
  const mockVolunteers: (User & { helpCount: number; level: string })[] = [
    {
      id: '1',
      email: 'volunteer1@example.com',
      first_name: 'Айдар',
      last_name: 'Нурмуханов',
      role: 'volunteer',
      verified: true,
      rating: 5.0,
      avatar: '',
      created_at: '2024-01-01',
      helpCount: 156,
      level: 'Platinum',
    },
    {
      id: '2',
      email: 'volunteer2@example.com',
      first_name: 'Динара',
      last_name: 'Жумабаева',
      role: 'volunteer',
      verified: true,
      rating: 4.9,
      avatar: '',
      created_at: '2024-01-15',
      helpCount: 98,
      level: 'Gold',
    },
    {
      id: '3',
      email: 'volunteer3@example.com',
      first_name: 'Ерлан',
      last_name: 'Касымов',
      role: 'volunteer',
      verified: true,
      rating: 4.8,
      avatar: '',
      created_at: '2024-02-01',
      helpCount: 67,
      level: 'Silver',
    },
  ]

  const { data: volunteers, isLoading } = useQuery({
    queryKey: ['top-volunteers'],
    queryFn: () => mockVolunteers,
  })

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Platinum':
        return 'from-purple-500 to-pink-500'
      case 'Gold':
        return 'from-yellow-500 to-orange-500'
      case 'Silver':
        return 'from-gray-400 to-gray-600'
      default:
        return 'from-blue-500 to-cyan-500'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Platinum':
        return '💎'
      case 'Gold':
        return '👑'
      case 'Silver':
        return '⭐'
      default:
        return '🏅'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('volunteers.pageTitle')}</h1>
          <p className="text-xl text-gray-600">
            {t('volunteers.pageSubtitle')}
          </p>
        </div>

        {/* Level System Info */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">{t('volunteers.levelSystem')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-3xl`}>
                🏅
              </div>
              <h3 className="font-bold mb-1">{t('volunteers.bronze')}</h3>
              <p className="text-sm text-gray-600">{t('volunteers.bronzeRange')}</p>
            </div>
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-3xl`}>
                ⭐
              </div>
              <h3 className="font-bold mb-1">{t('volunteers.silver')}</h3>
              <p className="text-sm text-gray-600">{t('volunteers.silverRange')}</p>
            </div>
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-3xl`}>
                👑
              </div>
              <h3 className="font-bold mb-1">{t('volunteers.gold')}</h3>
              <p className="text-sm text-gray-600">{t('volunteers.goldRange')}</p>
            </div>
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl`}>
                💎
              </div>
              <h3 className="font-bold mb-1">{t('volunteers.platinum')}</h3>
              <p className="text-sm text-gray-600">{t('volunteers.platinumRange')}</p>
            </div>
          </div>
        </div>

        {/* Top Volunteers */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        ) : volunteers && volunteers.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">{t('volunteers.leadersOfMonth')}</h2>

            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {volunteers.slice(0, 3).map((volunteer, index) => (
                <div
                  key={volunteer.id}
                  className={`card ${index === 0 ? 'md:order-2 md:transform md:scale-110' : index === 1 ? 'md:order-1' : 'md:order-3'}`}
                >
                  <div className="text-center">
                    {index === 0 && (
                      <div className="text-4xl mb-2">🏆</div>
                    )}
                    <div className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br ${getLevelColor(volunteer.level)} flex items-center justify-center text-4xl`}>
                      {getLevelIcon(volunteer.level)}
                    </div>
                    <h3 className="text-xl font-bold mb-1">
                      {volunteer.first_name} {volunteer.last_name}
                    </h3>
                    <div className="flex items-center justify-center mb-3">
                      <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-semibold">{volunteer.rating}</span>
                    </div>
                    <div className="space-y-2">
                      <div className={`inline-block px-4 py-1 rounded-full text-white text-sm font-semibold bg-gradient-to-r ${getLevelColor(volunteer.level)}`}>
                        {volunteer.level}
                      </div>
                      <div className="text-2xl font-bold text-primary-600">
                        {volunteer.helpCount}
                      </div>
                      <div className="text-sm text-gray-600">{t('volunteers.helpProvided')}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* All Volunteers List */}
            <h2 className="text-2xl font-bold mb-6 mt-12">{t('volunteers.allVolunteers')}</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('volunteers.rank')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('volunteers.volunteer')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('volunteers.level')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('volunteers.helpProvided')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('volunteers.rating')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {volunteers.map((volunteer, index) => (
                    <tr key={volunteer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">#{index + 1}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-primary-600 font-semibold">
                              {volunteer.first_name[0]}{volunteer.last_name[0]}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {volunteer.first_name} {volunteer.last_name}
                            </div>
                            {volunteer.verified && (
                              <div className="text-xs text-green-600 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {t('common.verified')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getLevelColor(volunteer.level)}`}>
                          {getLevelIcon(volunteer.level)} {volunteer.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-primary-600">{volunteer.helpCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-semibold">{volunteer.rating}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600">{t('volunteers.noVolunteers')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
