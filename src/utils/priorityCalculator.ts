import { HelpRequest, Priority, VulnerableCategory } from '../types'

// Base priority weights
const PRIORITY_WEIGHTS: Record<Priority, number> = {
  urgent: 100,
  high: 70,
  medium: 40,
  low: 10,
}

// Vulnerable category multipliers
const VULNERABLE_MULTIPLIERS: Record<VulnerableCategory, number> = {
  children: 1.5,
  elderly: 1.4,
  disabled: 1.5,
  pregnant: 1.6,
  large_family: 1.3,
}

// Emergency mode boost
const EMERGENCY_MODE_BOOST = 1.5

// Time decay factor (older requests get slight boost)
const TIME_DECAY_HOURS = 24
const TIME_DECAY_BOOST = 0.1

/**
 * Calculate priority score for a help request
 * Higher score = higher priority
 */
export function calculatePriorityScore(
  request: HelpRequest,
  isEmergencyMode: boolean = false
): number {
  // Base score from priority level
  let score = PRIORITY_WEIGHTS[request.priority] || 10

  // Apply vulnerable category multipliers
  if (request.vulnerable_categories && request.vulnerable_categories.length > 0) {
    let maxMultiplier = 1.0
    request.vulnerable_categories.forEach((category) => {
      const multiplier = VULNERABLE_MULTIPLIERS[category] || 1.0
      if (multiplier > maxMultiplier) {
        maxMultiplier = multiplier
      }
    })
    score *= maxMultiplier
  }

  // Legacy boolean fields support (backward compatibility)
  if (request.has_children) {
    score *= VULNERABLE_MULTIPLIERS.children
  }
  if (request.has_elderly) {
    score *= VULNERABLE_MULTIPLIERS.elderly
  }
  if (request.has_disabled) {
    score *= VULNERABLE_MULTIPLIERS.disabled
  }

  // Apply emergency mode boost
  if (isEmergencyMode) {
    score *= EMERGENCY_MODE_BOOST
  }

  // Time-based boost (older requests get priority)
  const createdAt = new Date(request.created_at)
  const now = new Date()
  const hoursOld = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
  if (hoursOld > TIME_DECAY_HOURS) {
    const daysOld = Math.floor(hoursOld / 24)
    score += daysOld * TIME_DECAY_BOOST * score
  }

  return Math.round(score)
}

/**
 * Sort help requests by priority score (descending)
 */
export function sortByPriority(
  requests: HelpRequest[],
  isEmergencyMode: boolean = false
): HelpRequest[] {
  return [...requests].sort((a, b) => {
    const scoreA = calculatePriorityScore(a, isEmergencyMode)
    const scoreB = calculatePriorityScore(b, isEmergencyMode)
    return scoreB - scoreA // Descending order (highest priority first)
  })
}

/**
 * Get priority level name based on score
 */
export function getPriorityLevelByScore(score: number): Priority {
  if (score >= 150) return 'urgent'
  if (score >= 100) return 'high'
  if (score >= 50) return 'medium'
  return 'low'
}

/**
 * Get color class for priority score
 */
export function getPriorityColor(priority: Priority | string): string {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * Get icon for vulnerable category
 */
export function getVulnerableCategoryIcon(category: VulnerableCategory): string {
  switch (category) {
    case 'children':
      return '👶'
    case 'elderly':
      return '👴'
    case 'disabled':
      return '♿'
    case 'pregnant':
      return '🤰'
    case 'large_family':
      return '👨‍👩‍👧‍👦'
    default:
      return '👤'
  }
}
