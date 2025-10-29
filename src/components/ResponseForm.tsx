import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { responsesService } from '../services/supabase'
import { useAuthStore } from '../stores/authStore'

interface ResponseFormProps {
  requestId: string
  onSuccess?: () => void
  onCancel?: () => void
}

interface ResponseFormData {
  message: string
  offered_items: Array<{ name: string; quantity: number; unit: string }>
}

export default function ResponseForm({ requestId, onSuccess, onCancel }: ResponseFormProps) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [showItems, setShowItems] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResponseFormData>({
    defaultValues: {
      message: '',
      offered_items: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'offered_items',
  })

  const createResponseMutation = useMutation({
    mutationFn: async (data: ResponseFormData) => {
      if (!user) throw new Error('User not authenticated')

      return await responsesService.create({
        request_id: requestId,
        donor_id: user.id,
        message: data.message,
        offered_items: data.offered_items.length > 0 ? data.offered_items : undefined,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responses', requestId] })
      queryClient.invalidateQueries({ queryKey: ['helpRequest', requestId] })
      reset()
      onSuccess?.()
    },
  })

  const onSubmit = (data: ResponseFormData) => {
    createResponseMutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">{t('responses.createResponse')}</h3>

      {/* Message */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('responses.message')} *
        </label>
        <textarea
          {...register('message', { required: true, minLength: 10 })}
          rows={4}
          className="input-field"
          placeholder={t('responses.messagePlaceholder')}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">
            {t('responses.messageRequired')}
          </p>
        )}
      </div>

      {/* Offered Items Toggle */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowItems(!showItems)}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          {showItems ? '- ' : '+ '}
          {t('responses.addOfferedItems')} ({t('common.optional')})
        </button>
      </div>

      {/* Offered Items List */}
      {showItems && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3">{t('responses.offeredItems')}</h4>

          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-2 mb-2">
              <div className="col-span-5">
                <input
                  {...register(`offered_items.${index}.name`, { required: true })}
                  className="input-field"
                  placeholder={t('responses.itemName')}
                />
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  {...register(`offered_items.${index}.quantity`, {
                    required: true,
                    min: 1,
                  })}
                  className="input-field"
                  placeholder={t('responses.quantity')}
                />
              </div>
              <div className="col-span-3">
                <input
                  {...register(`offered_items.${index}.unit`, { required: true })}
                  className="input-field"
                  placeholder={t('responses.unit')}
                />
              </div>
              <div className="col-span-1 flex items-center">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-800"
                  title={t('common.delete')}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => append({ name: '', quantity: 1, unit: '' })}
            className="btn-secondary text-sm mt-2"
          >
            + {t('responses.addItem')}
          </button>
        </div>
      )}

      {/* Error Message */}
      {createResponseMutation.isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded text-sm">
          {t('common.error')}: {(createResponseMutation.error as Error).message}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={createResponseMutation.isPending}
          className="flex-1 btn-primary"
        >
          {createResponseMutation.isPending ? t('common.loading') : t('responses.sendResponse')}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 btn-secondary">
            {t('common.cancel')}
          </button>
        )}
      </div>
    </form>
  )
}
