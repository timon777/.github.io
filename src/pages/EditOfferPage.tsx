import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { HelpCategory, OfferType } from '../types'
import { useLocationStore, CITIES } from '../stores/locationStore'
import { useAuthStore } from '../stores/authStore'
import { donorOffersService, locationsService } from '../services/supabase'

interface OfferForm {
  title: string
  description: string
  category: HelpCategory
  type: OfferType
  quantity?: number
  unit?: string
  contact_phone?: string
  contact_email?: string
  address: string
  city: string
  expires_days: number
}

export default function EditOfferPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { selectedCity } = useLocationStore()
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { data: offer, isLoading: isLoadingOffer } = useQuery({
    queryKey: ['donorOffer', id],
    queryFn: async () => {
      if (!id) throw new Error('No offer ID')
      return await donorOffersService.getById(id)
    },
    enabled: !!id,
  })

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<OfferForm>()

  const offerType = watch('type')

  // Проверка прав доступа
  useEffect(() => {
    if (offer && user && offer.donor_id !== user.id) {
      alert('У вас нет прав для редактирования этого предложения')
      navigate(`/offers/${id}`)
    }
  }, [offer, user, id, navigate])

  // Заполнение формы при загрузке данных
  useEffect(() => {
    if (offer) {
      const expiresAt = offer.expires_at ? new Date(offer.expires_at) : null
      const now = new Date()
      const daysUntilExpiry = expiresAt
        ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 30

      reset({
        title: offer.title,
        description: offer.description,
        category: offer.category,
        type: offer.type,
        quantity: offer.quantity || undefined,
        unit: offer.unit || undefined,
        contact_phone: offer.contact_phone || '',
        contact_email: offer.contact_email || '',
        address: offer.location?.address || '',
        city: offer.location?.city || selectedCity?.name || 'Астана',
        expires_days: daysUntilExpiry > 0 ? daysUntilExpiry : 30,
      })
    }
  }, [offer, reset, selectedCity])

  const onSubmit = async (data: OfferForm) => {
    if (!user || !offer) {
      alert('Необходимо войти в систему')
      navigate('/login')
      return
    }

    setIsLoading(true)
    try {
      // Расчёт новой даты истечения
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + data.expires_days)

      // Найти город из CITIES для получения координат
      const selectedCityData = CITIES.find(c => c.name === data.city)

      // Обновляем локацию
      await locationsService.update(offer.location_id, {
        city: data.city,
        address: data.address || '',
        latitude: selectedCityData?.latitude || offer.location.latitude,
        longitude: selectedCityData?.longitude || offer.location.longitude,
        region: selectedCityData?.region || data.city
      })

      // Обновляем предложение
      await donorOffersService.update(offer.id, {
        title: data.title,
        description: data.description,
        category: data.category,
        type: data.type,
        quantity: data.type === 'goods' ? data.quantity : null,
        unit: data.type === 'goods' ? data.unit : null,
        contact_phone: data.contact_phone || user.phone || null,
        contact_email: data.contact_email || user.email || null,
        expires_at: expiresAt.toISOString()
      })

      setSuccess(true)
      setTimeout(() => {
        navigate(`/offers/${offer.id}`)
      }, 1500)
    } catch (error) {
      console.error('Ошибка при обновлении предложения:', error)
      alert(t('common.error') || 'Произошла ошибка при обновлении объявления')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingOffer) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('registry.notFound')}</h1>
          <button onClick={() => navigate('/registry')} className="btn-primary">
            {t('registry.backToRegistry')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">{t('registry.editOffer')}</h1>
        <p className="text-gray-600 mb-8">
          Отредактируйте информацию о вашем предложении
        </p>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
            ✓ Предложение успешно обновлено! Перенаправляем...
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6">
          {/* Тип предложения */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('registry.type')} *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                <input
                  type="radio"
                  value="goods"
                  {...register('type', { required: true })}
                  className="mr-3"
                />
                <div>
                  <div className="font-semibold">{t('registry.goods')}</div>
                  <div className="text-sm text-gray-500">Продукты, одежда, техника...</div>
                </div>
              </label>
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                <input
                  type="radio"
                  value="service"
                  {...register('type', { required: true })}
                  className="mr-3"
                />
                <div>
                  <div className="font-semibold">{t('registry.service')}</div>
                  <div className="text-sm text-gray-500">Помощь, консультации...</div>
                </div>
              </label>
            </div>
          </div>

          {/* Основная информация */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('registry.title')} *
            </label>
            <input
              type="text"
              {...register('title', { required: true, minLength: 5 })}
              className="input-field"
              placeholder="Например: Продукты питания для семьи"
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
              placeholder="Подробно опишите, что вы предлагаете..."
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

          {/* Количество (только для товаров) */}
          {offerType === 'goods' && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('registry.quantity')}
                </label>
                <input
                  type="number"
                  {...register('quantity', { min: 1 })}
                  className="input-field"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('registry.unit')}
                </label>
                <input
                  type="text"
                  {...register('unit')}
                  className="input-field"
                  placeholder="шт, кг, л..."
                />
              </div>
            </div>
          )}

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

          {/* Контакты */}
          <div className="border-t pt-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Контактная информация</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Телефон
                </label>
                <input
                  type="tel"
                  {...register('contact_phone')}
                  className="input-field"
                  placeholder="+7 777 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  {...register('contact_email')}
                  className="input-field"
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>

          {/* Срок действия */}
          <div className="border-t pt-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Срок действия</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Актуально в течение (дней) *
              </label>
              <select
                {...register('expires_days', { required: true })}
                className="input-field"
              >
                <option value="7">7 дней</option>
                <option value="14">14 дней</option>
                <option value="30">30 дней</option>
                <option value="60">60 дней</option>
                <option value="90">90 дней</option>
              </select>
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
              onClick={() => navigate(`/offers/${offer.id}`)}
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
