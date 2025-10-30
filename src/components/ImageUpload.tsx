import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { storageService } from '../services/supabase'

interface ImageUploadProps {
  folder: 'users' | 'requests' | 'offers' | 'messages'
  maxFiles?: number
  maxSizeMB?: number
  onUpload: (urls: string[]) => void
  existingImages?: string[]
  disabled?: boolean
}

export default function ImageUpload({
  folder,
  maxFiles = 5,
  maxSizeMB = 5,
  onUpload,
  existingImages = [],
  disabled = false,
}: ImageUploadProps) {
  const { t } = useTranslation()
  const [previews, setPreviews] = useState<string[]>(existingImages)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return t('imageUpload.errorNotImage')
    }

    // Check file size
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > maxSizeMB) {
      return t('imageUpload.errorTooLarge', { max: maxSizeMB })
    }

    return null
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Check max files limit
    if (previews.length + files.length > maxFiles) {
      setError(t('imageUpload.errorMaxFiles', { max: maxFiles }))
      return
    }

    setError(null)
    setUploading(true)
    setUploadProgress(0)

    const uploadedUrls: string[] = []
    const newPreviews: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validate file
        const validationError = validateFile(file)
        if (validationError) {
          setError(validationError)
          continue
        }

        // Create preview
        const previewUrl = URL.createObjectURL(file)
        newPreviews.push(previewUrl)

        // Upload file
        const { url } = await storageService.uploadImage(file, folder)
        uploadedUrls.push(url)

        // Update progress
        setUploadProgress(((i + 1) / files.length) * 100)
      }

      // Update state
      const allPreviews = [...previews, ...newPreviews]
      setPreviews(allPreviews)
      onUpload([...existingImages, ...uploadedUrls])
    } catch (err) {
      console.error('Upload error:', err)
      setError(t('imageUpload.errorUpload'))
    } finally {
      setUploading(false)
      setUploadProgress(0)
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index)
    setPreviews(newPreviews)

    // Notify parent
    const newUrls = existingImages.filter((_, i) => i !== index)
    onUpload(newUrls)
  }

  const triggerFileInput = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={disabled || uploading || previews.length >= maxFiles}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>{uploading ? t('imageUpload.uploading') : t('imageUpload.addImages')}</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />

        <p className="text-sm text-gray-500">
          {t('imageUpload.hint', { current: previews.length, max: maxFiles, size: maxSizeMB })}
        </p>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Remove Button */}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700"
                  aria-label={t('common.delete')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}

              {/* Image Number */}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        {t('imageUpload.helpText')}
      </p>
    </div>
  )
}
