import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { HelpCategory, Priority } from '../types'
import { useLocationStore, CITIES } from '../stores/locationStore'
import { useAuthStore } from '../stores/authStore'
import { requestsService, locationsService } from '../services/supabase'
import ImageUpload from '../components/ImageUpload'

interface RequestForm {
  title: string
  description: string
  category: HelpCategory
  priority: Priority
  address: string
  city: string
}

export default function CreateRequestPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { selectedCity } = useLocationStore()
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [images, setImages] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestForm>({
    defaultValues: {
      city: selectedCity?.name || 'Астана',
    }
  })

  const onSubmit = async (data: RequestForm) => {
    if (!user) {
      alert('Необходимо войти в систему')
      navigate('/login')
      return
    }

    setIsLoading(true)
    try {
      // Найти город из CITIES для получения координат
      const selectedCityData = CITIES.find(c => c.name === data.city)

      // Создаём локацию
      const location = await locationsService.create({
        city: data.city,
        address: data.address || '',
        latitude: selectedCityData?.latitude || 0,
        longitude: selectedCityData?.longitude || 0,
        region: selectedCityData?.region || data.city
      })

      // Создаём заявку на помощь
      await requestsService.create({
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        beneficiary_id: user.id,
        location_id: location.id,
        images: images.length > 0 ? images : null,
        status: 'open'
      })

      setSuccess(true)
      setTimeout(() => {
        navigate('/requests')
      }, 2000)
    } catch (error) {
      console.error('Ошибка при создании заявки:', error)
      alert(t('common.error') || 'Произошла ошибка при создании заявки')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">{t('requests.createNew')}</h1>
        <p className="text-gray-600 mb-8">
          Создайте запрос на помощь и получите поддержку от сообщества
        </p>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
            ✓ Запрос успешно создан! Перенаправляем в список запросов...
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Заголовок запроса *
              </label>
              <input
                {...register('title', { required: 'Заголовок обязателен' })}
                type="text"
                className="input-field"
                placeholder="Например: Нужны продукты питания"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание *
              </label>
              <textarea
                {...register('description', { required: 'Описание обязательно' })}
                rows={5}
                className="input-field"
                placeholder="Подробно опишите, какая помощь вам нужна"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">Обязательное поле</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Приоритет *
                </label>
                <select
                  {...register('priority', { required: 'Выберите приоритет' })}
                  className="input-field"
                >
                  <option value="">Выберите приоритет</option>
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                  <option value="urgent">Срочно</option>
                </select>
                {errors.priority && (
                  <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Местоположение</h3>

              <div className="mb-6">
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

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Адрес
                </label>
                <input
                  type="text"
                  {...register('address')}
                  className="input-field"
                  placeholder="Улица, дом, квартира..."
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Фотографии ({t('common.optional')})
              </h3>
              <ImageUpload
                folder="requests"
                maxFiles={5}
                maxSizeMB={5}
                onUpload={setImages}
                existingImages={images}
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 btn-primary"
              >
                {isLoading ? 'Создание...' : 'Создать запрос'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/requests')}
                className="flex-1 btn-secondary"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
