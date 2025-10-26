import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { requestsService } from '../services/directus'
import { HelpRequest, HelpCategory, RequestStatus } from '../types'

export default function RequestsPage() {
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus | 'all'>('all')

  // Temporary mock data for demonstration
  const mockRequests: HelpRequest[] = [
    {
      id: '1',
      title: 'Нужны продукты питания для многодетной семьи',
      description: 'Семья с 4 детьми нуждается в продуктах: крупы, макароны, консервы',
      category: 'food',
      status: 'pending',
      priority: 'high',
      beneficiary: {
        id: '1',
        email: 'user@example.com',
        first_name: 'Анна',
        last_name: 'Иванова',
        role: 'beneficiary',
        verified: true,
        created_at: '2025-01-01',
      },
      location: {
        id: '1',
        address: 'ул. Абая 150',
        city: 'Алматы',
        region: 'Алматы',
        country: 'Казахстан',
        latitude: 43.2220,
        longitude: 76.8512,
      },
      images: [],
      created_at: '2025-10-20',
      updated_at: '2025-10-20',
    },
    {
      id: '2',
      title: 'Зимняя одежда для детей',
      description: 'Необходима теплая зимняя одежда для детей 5 и 7 лет',
      category: 'clothing',
      status: 'approved',
      priority: 'medium',
      beneficiary: {
        id: '2',
        email: 'user2@example.com',
        first_name: 'Марат',
        last_name: 'Сарсенов',
        role: 'beneficiary',
        verified: true,
        created_at: '2025-01-02',
      },
      location: {
        id: '2',
        address: 'мкр. Аксай-3, д. 25',
        city: 'Алматы',
        region: 'Алматы',
        country: 'Казахстан',
        latitude: 43.2566,
        longitude: 76.9286,
      },
      images: [],
      created_at: '2025-10-21',
      updated_at: '2025-10-21',
    },
  ]

  const { data: requests, isLoading } = useQuery({
    queryKey: ['requests', selectedCategory, selectedStatus],
    queryFn: () => mockRequests, // Replace with: requestsService.getAll()
  })

  const filteredRequests = requests?.filter((req) => {
    const categoryMatch = selectedCategory === 'all' || req.category === selectedCategory
    const statusMatch = selectedStatus === 'all' || req.status === selectedStatus
    return categoryMatch && statusMatch
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Запросы помощи</h1>
          <Link to="/create-request" className="btn-primary">
            Создать запрос
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="input-field"
              >
                <option value="all">Все категории</option>
                <option value="food">Продукты питания</option>
                <option value="clothing">Одежда и обувь</option>
                <option value="medicine">Медикаменты</option>
                <option value="household">Бытовая техника</option>
                <option value="transport">Транспорт</option>
                <option value="animal_care">Помощь животным</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Статус
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="input-field"
              >
                <option value="all">Все статусы</option>
                <option value="pending">Ожидает проверки</option>
                <option value="approved">Одобрено</option>
                <option value="in_progress">В процессе</option>
                <option value="completed">Завершено</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Загрузка...</p>
          </div>
        ) : filteredRequests && filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <div key={request.id} className="card">
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(request.priority)}`}>
                    {request.priority === 'urgent' ? 'Срочно' : request.priority === 'high' ? 'Высокий' : request.priority === 'medium' ? 'Средний' : 'Низкий'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                    {request.status === 'pending' ? 'Ожидает' : request.status === 'approved' ? 'Одобрено' : request.status === 'in_progress' ? 'В процессе' : 'Завершено'}
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-2">{request.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {request.description}
                </p>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {request.location.city}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {request.beneficiary.first_name} {request.beneficiary.last_name}
                  </div>
                </div>

                <button className="w-full btn-primary">
                  Откликнуться
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600">Запросы не найдены</p>
          </div>
        )}
      </div>
    </div>
  )
}
