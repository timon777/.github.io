import { useTranslation } from 'react-i18next'
import { VulnerableCategory } from '../types'
import { getVulnerableCategoryIcon } from '../utils/priorityCalculator'

interface VulnerableCategoryBadgesProps {
  categories?: VulnerableCategory[]
  hasChildren?: boolean
  hasElderly?: boolean
  hasDisabled?: boolean
}

export default function VulnerableCategoryBadges({
  categories,
  hasChildren,
  hasElderly,
  hasDisabled,
}: VulnerableCategoryBadgesProps) {
  const { t } = useTranslation()

  // Merge new categories array with legacy boolean fields
  const allCategories = new Set<VulnerableCategory>()

  if (categories) {
    categories.forEach(cat => allCategories.add(cat))
  }
  if (hasChildren) allCategories.add('children')
  if (hasElderly) allCategories.add('elderly')
  if (hasDisabled) allCategories.add('disabled')

  if (allCategories.size === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {Array.from(allCategories).map((category) => (
        <span
          key={category}
          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full border border-purple-200"
          title={t(`vulnerable.${category}`)}
        >
          <span>{getVulnerableCategoryIcon(category)}</span>
          <span>{t(`vulnerable.${category}`)}</span>
        </span>
      ))}
    </div>
  )
}
