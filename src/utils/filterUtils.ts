import type { HelpRequest, DonorOffer, Priority } from '../types'

export interface FilterOptions {
  category?: string
  status?: string
  priority?: string
  type?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: string
}

/**
 * Filter and search help requests
 */
export function filterRequests(
  requests: HelpRequest[],
  searchQuery: string,
  filters: FilterOptions
): HelpRequest[] {
  let filtered = [...requests]

  // Search by title and description
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filtered = filtered.filter(
      (request) =>
        request.title.toLowerCase().includes(query) ||
        request.description.toLowerCase().includes(query)
    )
  }

  // Filter by category
  if (filters.category) {
    filtered = filtered.filter((request) => request.category === filters.category)
  }

  // Filter by status
  if (filters.status) {
    filtered = filtered.filter((request) => request.status === filters.status)
  }

  // Filter by priority
  if (filters.priority) {
    filtered = filtered.filter((request) => request.priority === filters.priority)
  }

  // Filter by date range
  if (filters.dateFrom) {
    const dateFrom = new Date(filters.dateFrom)
    filtered = filtered.filter((request) => new Date(request.created_at) >= dateFrom)
  }

  if (filters.dateTo) {
    const dateTo = new Date(filters.dateTo)
    dateTo.setHours(23, 59, 59, 999) // Include the entire day
    filtered = filtered.filter((request) => new Date(request.created_at) <= dateTo)
  }

  return filtered
}

/**
 * Sort help requests
 */
export function sortRequests(requests: HelpRequest[], sortBy: string): HelpRequest[] {
  const sorted = [...requests]

  switch (sortBy) {
    case 'date_desc':
      return sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    case 'date_asc':
      return sorted.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    case 'priority_desc':
      return sorted.sort((a, b) => {
        const priorityOrder: Record<Priority, number> = {
          urgent: 4,
          high: 3,
          medium: 2,
          low: 1,
        }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
    case 'priority_asc':
      return sorted.sort((a, b) => {
        const priorityOrder: Record<Priority, number> = {
          urgent: 4,
          high: 3,
          medium: 2,
          low: 1,
        }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
    default:
      return sorted
  }
}

/**
 * Filter and search donor offers
 */
export function filterOffers(
  offers: DonorOffer[],
  searchQuery: string,
  filters: FilterOptions
): DonorOffer[] {
  let filtered = [...offers]

  // Search by title and description
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filtered = filtered.filter(
      (offer) =>
        offer.title.toLowerCase().includes(query) ||
        offer.description.toLowerCase().includes(query)
    )
  }

  // Filter by category
  if (filters.category) {
    filtered = filtered.filter((offer) => offer.category === filters.category)
  }

  // Filter by status
  if (filters.status) {
    filtered = filtered.filter((offer) => offer.status === filters.status)
  }

  // Filter by type (goods/service)
  if (filters.type) {
    filtered = filtered.filter((offer) => offer.type === filters.type)
  }

  // Filter by date range
  if (filters.dateFrom) {
    const dateFrom = new Date(filters.dateFrom)
    filtered = filtered.filter((offer) => new Date(offer.created_at) >= dateFrom)
  }

  if (filters.dateTo) {
    const dateTo = new Date(filters.dateTo)
    dateTo.setHours(23, 59, 59, 999)
    filtered = filtered.filter((offer) => new Date(offer.created_at) <= dateTo)
  }

  return filtered
}

/**
 * Sort donor offers
 */
export function sortOffers(offers: DonorOffer[], sortBy: string): DonorOffer[] {
  const sorted = [...offers]

  switch (sortBy) {
    case 'date_desc':
      return sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    case 'date_asc':
      return sorted.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    default:
      return sorted
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Sort by distance (requires user location)
 */
export function sortByDistance<T extends { location: { latitude: number; longitude: number } }>(
  items: T[],
  userLat: number,
  userLon: number
): T[] {
  return [...items].sort((a, b) => {
    const distA = calculateDistance(userLat, userLon, a.location.latitude, a.location.longitude)
    const distB = calculateDistance(userLat, userLon, b.location.latitude, b.location.longitude)
    return distA - distB
  })
}
