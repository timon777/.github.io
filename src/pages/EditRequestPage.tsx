import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { HelpCategory, Priority } from '../types'
import { useLocationStore, CITIES } from '../stores/locationStore'
import { useAuthStore } from '../stores/authStore'
import { requestsService, locationsService } from '../services/supabase'

interface RequestForm {
  title: string
  description: string
  category: HelpCategory
  priority: Priority
  address: string
  city: string
}

export default function EditRequestPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { selectedCity } = useLocationStore()
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { data: request, isLoading: isLoadingRequest } = useQuery({
    queryKey: ['helpRequest', id],
    queryFn: async () => {
      if (!id) throw new Error('No request ID')
      return await requestsService.getById(id)
    },
    enabled: !!id,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequestForm>()

  // Проверка прав доступа
  useEffect(() => {
    if (request && user && request.beneficiary_id !== user.id) {
      alert('У вас нет прав для редактирования этой заявки')
      navigate(`/requests/${id}`)
    }
  }, [request, user, id, navigate])

  // Заполнение формы при загрузке данных
  useEffect(() => {
    if (request) {
      reset({
        title: request.title,
        description: request.description,
        category: request.category,
        priority: request.priority,
        address: request.location?.address || '',
        city: request.location?.city || selectedCity?.name || 'Астана',
      })
    }
  }, [request, reset, selectedCity])

  const onSubmit = async (data: RequestForm) => {
    if (!user || !request) {
      alert('Необходимо войти в систему')
      navigate('/login')
      return
    }

    setIsLoading(true)
    try {
      // Найти город из CITIES для получения координат
      const selectedCityData = CITIES.find(c => c.name === data.city)

      // Обновляем локацию
      await locationsService.update(request.location_id, {
        city: data.city,
        address: data.address || '',
        latitude: selectedCityData?.latitude || request.location.latitude,
        longitude: selectedCityData?.longitude || request.location.longitude,
        region: selectedCityData?.region || data.city
      })

      // Обновляем заявку
      await requestsService.update(request.id, {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
      })

      setSuccess(true)
      setTimeout(() => {
        navigate(`/requests/${request.id}`)
      }, 1500)
    } catch (error) {
      console.error('Ошибка при обновлении заявки:', error)
      alert(t('common.error') || 'Произошла ошибка при обновлении заявки')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingRequest) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('requests.notFound')}</h1>
          <button onClick={() => navigate('/requests')} className="btn-primary">
            {t('requests.backToRequests')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">{t('requests.editRequest')}</h1>
        <p className="text-gray-600 mb-8">
          Отредактируйте информацию о вашей заявке
        </p>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
            ✓ Заявка успешно обновлена! Перенаправляем...
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6">
          {/* Основная информация */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('registry.title')} *
            </label>
            <input
              type="text"
              {...register('title', { required: true, minLength: 5 })}
              className="input-field"
              placeholder="Например: Нужны продукты питания"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">Минимум 5 символов</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('registry.description')} *
            </label>
            <textarea
              {...register('description', { required: true, minLength: 20 })}
              rows={5}
              className="input-field"
              placeholder="Подробно опишите, какая помощь вам нужна..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">Минимум 20 символов</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('registry.category')} *
            </label>
            <select
              {...register('category', { required: true })}
              className="input-field"
            >
              <option value="">{t('categories.all')}</option>
              <option value="food">{t('categories.food')}</option>
              <option value="clothing">{t('categories.clothing')}</option>
              <option value="medicine">{t('categories.medicine')}</option>
              <option value="household">{t('categories.household')}</option>
              <option value="transport">{t('categories.transport')}</option>
              <option value="animal_care">{t('categories.animal_care')}</option>
              <option value="medical_service">{t('categories.medical_service')}</option>
              <option value="legal_service">{t('categories.legal_service')}</option>
              <option value="psychological_service">{t('categories.psychological_service')}</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('requests.priority')} *
            </label>
            <select
              {...register('priority', { required: true })}
              className="input-field"
            >
              <option value="low">{t('requests.low')}</option>
              <option value="medium">{t('requests.medium')}</option>
              <option value="high">{t('requests.high')}</option>
              <option value="urgent">{t('requests.urgent')}</option>
            </select>
          </div>

          {/* Местоположение */}
          <div className="border-t pt-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Местоположение</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Город *
              </label>
              <select
                {...register('city', { required: true })}
                className="input-field"
              >
                {CITIES.map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Адрес
              </label>
              <input
                type="text"
                {...register('address')}
                className="input-field"
                placeholder="Улица, дом..."
              />
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn-primary"
            >
              {isLoading ? 'Сохранение...' : t('common.save')}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/requests/${request.id}`)}
              className="flex-1 btn-secondary"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
