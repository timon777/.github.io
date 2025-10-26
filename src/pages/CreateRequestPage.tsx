import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { HelpCategory, Priority } from '../types'

interface RequestForm {
  title: string
  description: string
  category: HelpCategory
  priority: Priority
  address: string
  city: string
  region: string
}

export default function CreateRequestPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestForm>()

  const onSubmit = async (data: RequestForm) => {
    setIsLoading(true)
    try {
      // TODO: Submit to Directus
      console.log('Creating request:', data)
      // await requestsService.create(data)
      setSuccess(true)
      setTimeout(() => {
        navigate('/requests')
      }, 2000)
    } catch (error) {
      console.error('Error creating request:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Создать запрос на помощь</h1>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
            Запрос успешно создан! Перенаправление...
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
                  Категория *
                </label>
                <select
                  {...register('category', { required: 'Выберите категорию' })}
                  className="input-field"
                >
                  <option value="">Выберите категорию</option>
                  <option value="food">Продукты питания</option>
                  <option value="clothing">Одежда и обувь</option>
                  <option value="medicine">Медикаменты</option>
                  <option value="household">Бытовая техника</option>
                  <option value="construction">Стройматериалы</option>
                  <option value="transport">Транспорт</option>
                  <option value="medical_service">Медицинская помощь</option>
                  <option value="legal_service">Юридическая помощь</option>
                  <option value="psychological_service">Психологическая помощь</option>
                  <option value="animal_care">Помощь животным</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
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

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Адрес *
                  </label>
                  <input
                    {...register('address', { required: 'Адрес обязателен' })}
                    type="text"
                    className="input-field"
                    placeholder="Улица, дом, квартира"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Город *
                    </label>
                    <input
                      {...register('city', { required: 'Город обязателен' })}
                      type="text"
                      className="input-field"
                      placeholder="Алматы"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Регион *
                    </label>
                    <input
                      {...register('region', { required: 'Регион обязателен' })}
                      type="text"
                      className="input-field"
                      placeholder="Алматы"
                    />
                    {errors.region && (
                      <p className="mt-1 text-sm text-red-600">{errors.region.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Фотографии (опционально)</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-1 text-sm text-gray-600">
                  Нажмите или перетащите изображения
                </p>
              </div>
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
