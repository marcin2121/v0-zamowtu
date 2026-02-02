import type { RestaurantSettings } from './types'

export const STARTER_FEATURES = [
  'menu',
  'settings',
  'history',
]

export const PROFESSIONAL_FEATURES = [
  ...STARTER_FEATURES,
  'discount_codes',
  'loyalty_program',
  'reviews',
  'statistics',
  'payments',
  'professional',
]

export function hasFeature(plan: string, feature: string): boolean {
  if (plan === 'professional') {
    return PROFESSIONAL_FEATURES.includes(feature)
  }
  return STARTER_FEATURES.includes(feature)
}

export function canAccessFeature(settings: RestaurantSettings | null, feature: string): boolean {
  if (!settings) return false
  return hasFeature(settings.subscription_plan, feature)
}
