import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
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

export default function CreateOfferPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { selectedCity } = useLocationStore()
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OfferForm>({
    defaultValues: {
      type: 'goods',
      city: selectedCity?.name || 'Астана',
      contact_phone: user?.phone || '',
      contact_email: user?.email || '',
      expires_days: 30
    }
  })

  const offerType = watch('type')

  const onSubmit = async (data: OfferForm) => {
    if (!user) {
      alert('Необходимо войти в систему')
      navigate('/login')
      return
    }

    setIsLoading(true)
    try {
      // Расчёт даты истечения
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + data.expires_days)

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

      // Создаём предложение
      await donorOffersService.create({
        title: data.title,
        description: data.description,
        category: data.category,
        type: data.type,
        quantity: data.type === 'goods' ? data.quantity : null,
        unit: data.type === 'goods' ? data.unit : null,
        contact_phone: data.contact_phone || user.phone || null,
        contact_email: data.contact_email || user.email || null,
        donor_id: user.id,
        location_id: location.id,
        status: 'active',
        expires_at: expiresAt.toISOString()
      })

      setSuccess(true)
      setTimeout(() => {
        navigate('/registry')
      }, 2000)
    } catch (error) {
      console.error('Ошибка при создании предложения:', error)
      alert(t('common.error') || 'Произошла ошибка при создании объявления')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">{t('registry.createNew')}</h1>
        <p className="text-gray-600 mb-8">
          Создайте объявление о товаре или услуге, которую готовы предоставить
        </p>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
            ✓ Объявление успешно создано! Перенаправляем в реестр...
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
                  <div className="text-sm text-gray-500">Физический товар</div>
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
                  <div className="text-sm text-gray-500">Услуга или помощь</div>
                </div>
              </label>
            </div>
          </div>

          {/* Название */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название *
            </label>
            <input
              type="text"
              {...register('title', { required: 'Обязательное поле', minLength: 5 })}
              className="input-field"
              placeholder="Кратко опишите что предлагаете"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Описание */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание *
            </label>
            <textarea
              {...register('description', { required: 'Обязательное поле', minLength: 20 })}
              rows={5}
              className="input-field"
              placeholder="Подробно опишите что предлагаете, условия передачи..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Категория */}
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
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Единица измерения
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
              placeholder="Улица, дом..."
            />
          </div>

          {/* Контакты */}
          <div className="grid grid-cols-2 gap-4 mb-6">
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

          {/* Срок действия */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Актуально в течение (дней)
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

          {/* Кнопки */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/registry')}
              className="btn-secondary"
              disabled={isLoading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Создание...' : 'Создать объявление'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
