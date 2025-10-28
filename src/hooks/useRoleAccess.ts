import { useAuthStore } from '../stores/authStore'
import { UserRole } from '../types'

type Action = 'create' | 'read' | 'update' | 'delete' | 'manage'
type Resource =
  | 'help_request'
  | 'donor_offer'
  | 'shelter'
  | 'response'
  | 'volunteer_task'
  | 'user'
  | 'all'

// Матрица разрешений по ролям
const permissions: Record<UserRole, Record<Resource, Action[]>> = {
  // Бенефициары: могут создавать запросы помощи
  beneficiary: {
    help_request: ['create', 'read', 'update', 'delete'],
    donor_offer: ['read'],
    shelter: ['read'],
    response: ['read'],
    volunteer_task: ['read'],
    user: ['read', 'update'], // только свой профиль
    all: []
  },

  // Доноры: могут создавать предложения и откликаться
  donor: {
    help_request: ['read'],
    donor_offer: ['create', 'read', 'update', 'delete'],
    shelter: ['read'],
    response: ['create', 'read', 'update', 'delete'],
    volunteer_task: ['read'],
    user: ['read', 'update'], // только свой профиль
    all: []
  },

  // Волонтёры: могут откликаться на запросы
  volunteer: {
    help_request: ['read'],
    donor_offer: ['read'],
    shelter: ['read'],
    response: ['create', 'read'],
    volunteer_task: ['create', 'read', 'update'],
    user: ['read', 'update'], // только свой профиль
    all: []
  },

  // Приюты: управляют своими страницами
  shelter: {
    help_request: ['create', 'read'],
    donor_offer: ['read'],
    shelter: ['create', 'read', 'update', 'delete'], // только свой приют
    response: ['read'],
    volunteer_task: ['read'],
    user: ['read', 'update'],
    all: []
  },

  // НКО: модерация и верификация
  ngo: {
    help_request: ['create', 'read', 'update'],
    donor_offer: ['create', 'read', 'update'],
    shelter: ['read', 'update'], // могут верифицировать
    response: ['read'],
    volunteer_task: ['read', 'update'],
    user: ['read', 'update'], // могут верифицировать пользователей
    all: []
  },

  // Админы: полный доступ
  admin: {
    help_request: ['create', 'read', 'update', 'delete', 'manage'],
    donor_offer: ['create', 'read', 'update', 'delete', 'manage'],
    shelter: ['create', 'read', 'update', 'delete', 'manage'],
    response: ['create', 'read', 'update', 'delete', 'manage'],
    volunteer_task: ['create', 'read', 'update', 'delete', 'manage'],
    user: ['create', 'read', 'update', 'delete', 'manage'],
    all: ['create', 'read', 'update', 'delete', 'manage']
  }
}

export function useRoleAccess() {
  const { user, isAuthenticated } = useAuthStore()

  /**
   * Проверка доступа к ресурсу
   * @param action - действие (create, read, update, delete, manage)
   * @param resource - ресурс (help_request, donor_offer, и т.д.)
   * @returns boolean - есть ли доступ
   */
  const can = (action: Action, resource: Resource): boolean => {
    if (!isAuthenticated || !user) return false

    const userRole = user.role
    const rolePermissions = permissions[userRole]

    // Админы имеют доступ ко всему
    if (userRole === 'admin') return true

    // Проверяем конкретный ресурс
    const resourcePermissions = rolePermissions[resource] || []
    return resourcePermissions.includes(action)
  }

  /**
   * Проверка множественных разрешений (любое из)
   */
  const canAny = (actions: Action[], resource: Resource): boolean => {
    return actions.some(action => can(action, resource))
  }

  /**
   * Проверка множественных разрешений (все)
   */
  const canAll = (actions: Action[], resource: Resource): boolean => {
    return actions.every(action => can(action, resource))
  }

  /**
   * Получить текущую роль
   */
  const getRole = (): UserRole | null => {
    return user?.role || null
  }

  /**
   * Проверка конкретной роли
   */
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role
  }

  /**
   * Проверка любой из ролей
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false
  }

  /**
   * Является ли пользователь донором или НКО (может создавать предложения)
   */
  const canCreateOffers = (): boolean => {
    return hasAnyRole(['donor', 'ngo', 'shelter', 'admin'])
  }

  /**
   * Является ли пользователь бенефициаром (может создавать запросы)
   */
  const canCreateRequests = (): boolean => {
    return hasAnyRole(['beneficiary', 'ngo', 'shelter', 'admin'])
  }

  /**
   * Может ли пользователь модерировать контент
   */
  const canModerate = (): boolean => {
    return hasAnyRole(['ngo', 'admin'])
  }

  /**
   * Может ли пользователь верифицировать других
   */
  const canVerify = (): boolean => {
    return hasAnyRole(['ngo', 'admin'])
  }

  return {
    can,
    canAny,
    canAll,
    getRole,
    hasRole,
    hasAnyRole,
    canCreateOffers,
    canCreateRequests,
    canModerate,
    canVerify,
    isAuthenticated
  }
}
