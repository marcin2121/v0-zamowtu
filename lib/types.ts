export interface RestaurantSettings {
  id: string
  user_id: string
  restaurant_name: string
  slug: string | null
  min_order_value: number
  max_delivery_distance_km: number
  delivery_fee: number
  is_open: boolean
  opening_hours: Record<string, { open: string; close: string }>
  address: string | null
  phone: string | null
  subscription_plan: 'starter' | 'professional'
  // Menu customization fields
  logo_url: string | null
  banner_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  font_family: string
  show_reviews: boolean
  description: string | null
  custom_welcome_text: string | null
  // Advanced features
  orders_paused: boolean
  pause_reason: string | null
  notification_hours_before: number
  created_at: string
  updated_at: string
}

export interface MenuCategory {
  id: string
  user_id: string
  name: string
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface MenuItem {
  id: string
  user_id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  allergens: string[] | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  restaurant_user_id: string
  customer_name: string
  customer_email: string | null
  customer_phone: string
  delivery_address: string
  delivery_notes: string | null
  order_type: 'delivery' | 'pickup'
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  scheduled_for: string | null
  estimated_delivery_at: string | null
  accepted_at: string | null
  notified_at: string | null
  subtotal: number
  delivery_fee: number
  discount_code: string | null
  discount_amount: number
  loyalty_discount: number
  customer_email_for_loyalty: string | null
  total: number
  is_paid: boolean
  payment_method: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string | null
  name: string
  price: number
  quantity: number
  notes: string | null
  created_at: string
}

export interface CartItem extends MenuItem {
  quantity: number
  notes?: string
}

export interface DiscountCode {
  id: string
  user_id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_value: number
  max_uses: number | null
  used_count: number
  valid_from: string
  valid_until: string | null
  schedule: {
    days?: string[]
    hours?: { start: string; end: string }
  } | null
  is_active: boolean
  created_at: string
}

export interface LoyaltyLevel {
  name: string
  min_spent: number
  discount_percent: number
}

export interface LoyaltySettings {
  id: string
  user_id: string
  is_enabled: boolean
  points_per_zloty: number
  levels: LoyaltyLevel[]
  created_at: string
  updated_at: string
}

export interface CustomerLoyalty {
  id: string
  restaurant_user_id: string
  customer_email: string
  total_spent: number
  total_orders: number
  current_level: number
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  order_id: string
  restaurant_user_id: string
  customer_name: string
  customer_email: string | null
  rating: number
  comment: string | null
  is_public: boolean
  restaurant_response: string | null
  created_at: string
}

export interface BlockedDate {
  id: string
  user_id: string
  date: string
  reason: string | null
  created_at: string
}

export interface MenuSuggestion {
  id: string
  user_id: string
  suggestion_type: 'remove' | 'promote' | 'optimize_price'
  menu_item_id: string | null
  title: string
  description: string
  priority: number
  is_dismissed: boolean
  created_at: string
}

// Subscription plan features
export const PLAN_FEATURES = {
  starter: {
    name: 'Starter',
    price: 99,
    features: [
      'Menu i zamówienia',
      'Harmonogram otwarcia',
      'Ustawienia dostawy',
      'Opisy produktów',
    ],
  },
  professional: {
    name: 'Professional',
    price: 199,
    features: [
      'Wszystko w Starter +',
      'Kody rabatowe',
      'Program lojalnościowy',
      'Opinie i oceny',
      'Zaawansowane statystyki',
      'Płatności online (Przelewy24)',
    ],
  },
}
