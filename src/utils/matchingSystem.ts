import type { HelpRequest, DonorOffer, HelpCategory } from '../types'

/**
 * Matching score breakdown:
 * - Category match: +100 points (required)
 * - Same city: +50 points
 * - Same region: +20 points
 * - Priority urgent: +40 points
 * - Priority high: +30 points
 * - Priority medium: +20 points
 * - Priority low: +10 points
 * - Each vulnerable category: +10 points
 * - Active/available status: required
 */

export interface MatchScore {
  score: number
  reasons: string[]
}

export interface RequestMatch {
  request: HelpRequest
  score: number
  reasons: string[]
}

export interface OfferMatch {
  offer: DonorOffer
  score: number
  reasons: string[]
}

/**
 * Calculate match score between a request and an offer
 */
export function calculateMatchScore(
  request: HelpRequest,
  offer: DonorOffer
): MatchScore {
  let score = 0
  const reasons: string[] = []

  // Category match (required)
  if (request.category !== offer.category) {
    return { score: 0, reasons: ['Category mismatch'] }
  }
  score += 100
  reasons.push('Категория совпадает')

  // City match
  if (request.location.city === offer.location.city) {
    score += 50
    reasons.push(`Тот же город: ${request.location.city}`)
  } else if (request.location.region === offer.location.region) {
    // Region match (if not same city)
    score += 20
    reasons.push(`Тот же регион: ${request.location.region}`)
  }

  // Priority boost
  switch (request.priority) {
    case 'urgent':
      score += 40
      reasons.push('Срочный приоритет')
      break
    case 'high':
      score += 30
      reasons.push('Высокий приоритет')
      break
    case 'medium':
      score += 20
      reasons.push('Средний приоритет')
      break
    case 'low':
      score += 10
      break
  }

  // Vulnerable categories boost
  if (request.vulnerable_categories && request.vulnerable_categories.length > 0) {
    const vulnerableBonus = request.vulnerable_categories.length * 10
    score += vulnerableBonus
    reasons.push(`Уязвимые категории: ${request.vulnerable_categories.length}`)
  }

  // Offer type preference (goods might be more valuable)
  if (offer.type === 'goods' && offer.quantity && offer.quantity > 0) {
    score += 5
    reasons.push('Материальная помощь доступна')
  }

  return { score, reasons }
}

/**
 * Find matching offers for a request
 */
export function findMatchingOffers(
  request: HelpRequest,
  allOffers: DonorOffer[],
  limit: number = 5
): OfferMatch[] {
  // Filter only active offers
  const activeOffers = allOffers.filter((offer) => offer.status === 'active')

  // Calculate scores
  const matches: OfferMatch[] = activeOffers
    .map((offer) => {
      const { score, reasons } = calculateMatchScore(request, offer)
      return { offer, score, reasons }
    })
    .filter((match) => match.score > 0) // Remove non-matches

  // Sort by score (descending)
  matches.sort((a, b) => b.score - a.score)

  // Return top N
  return matches.slice(0, limit)
}

/**
 * Find matching requests for an offer
 */
export function findMatchingRequests(
  offer: DonorOffer,
  allRequests: HelpRequest[],
  limit: number = 5
): RequestMatch[] {
  // Filter only pending and approved requests
  const availableRequests = allRequests.filter(
    (request) => request.status === 'pending' || request.status === 'approved'
  )

  // Calculate scores
  const matches: RequestMatch[] = availableRequests
    .map((request) => {
      const { score, reasons } = calculateMatchScore(request, offer)
      return { request, score, reasons }
    })
    .filter((match) => match.score > 0) // Remove non-matches

  // Sort by score (descending)
  matches.sort((a, b) => b.score - a.score)

  // Return top N
  return matches.slice(0, limit)
}

/**
 * Get category-based suggestions
 */
export function getCategorySuggestions(category: HelpCategory): string[] {
  const suggestions: Record<HelpCategory, string[]> = {
    food: ['Продукты питания', 'Консервы', 'Крупы', 'Молочные продукты'],
    clothing: ['Одежда', 'Обувь', 'Детская одежда', 'Зимняя одежда'],
    medicine: ['Медикаменты', 'Первая помощь', 'Витамины', 'Перевязочные материалы'],
    household: ['Бытовая техника', 'Посуда', 'Мебель', 'Постельное белье'],
    construction: ['Стройматериалы', 'Инструменты', 'Ремонтные материалы'],
    transport: ['Транспортные услуги', 'Доставка', 'Перевозка грузов'],
    medical_service: ['Медицинские услуги', 'Консультации врачей', 'Анализы'],
    legal_service: ['Юридические услуги', 'Консультации', 'Помощь с документами'],
    psychological_service: ['Психологическая помощь', 'Консультации психолога', 'Поддержка'],
    animal_care: ['Корм для животных', 'Ветеринарные услуги', 'Уход за животными'],
  }

  return suggestions[category] || []
}

/**
 * Format match reasons for display
 */
export function formatMatchReasons(reasons: string[], locale: string = 'ru'): string {
  if (reasons.length === 0) return ''
  if (reasons.length === 1) return reasons[0]

  const formatted = reasons.slice(0, 3).join(', ')
  if (reasons.length > 3) {
    return `${formatted}...`
  }
  return formatted
}

/**
 * Get match quality label based on score
 */
export function getMatchQuality(score: number): {
  label: string
  color: string
  bgColor: string
} {
  if (score >= 180) {
    return {
      label: 'Отличное совпадение',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
    }
  } else if (score >= 150) {
    return {
      label: 'Хорошее совпадение',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
    }
  } else if (score >= 120) {
    return {
      label: 'Подходит',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
    }
  } else {
    return {
      label: 'Возможно подходит',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100',
    }
  }
}
