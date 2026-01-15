interface UserRatingProps {
  rating?: number | null
  reviewCount?: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
}

export default function UserRating({
  rating,
  reviewCount = 0,
  size = 'sm',
  showCount = true
}: UserRatingProps) {
  if (!rating || rating === 0) {
    return null
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  return (
    <div className="flex items-center gap-1">
      <svg
        className={`${sizeClasses[size]} text-yellow-400`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className={`${textSizeClasses[size]} font-semibold text-gray-700`}>
        {rating.toFixed(1)}
      </span>
      {showCount && reviewCount > 0 && (
        <span className={`${textSizeClasses[size]} text-gray-500`}>
          ({reviewCount})
        </span>
      )}
    </div>
  )
}
