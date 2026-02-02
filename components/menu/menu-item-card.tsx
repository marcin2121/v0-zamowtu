'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Minus, AlertTriangle, Check } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'
import type { MenuItem } from '@/lib/types'

interface CustomStyles {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  textColor: string
}

interface MenuItemCardProps {
  item: MenuItem
  restaurantId: string
  customStyles?: CustomStyles
}

export function MenuItemCard({ item, restaurantId, customStyles }: MenuItemCardProps) {
  const { addItem, items, updateQuantity, removeItem } = useCartStore()
  const [justAdded, setJustAdded] = useState(false)
  
  const cartItem = items.find(i => i.id === item.id)
  const quantity = cartItem?.quantity || 0

  const handleAdd = () => {
    addItem(item, restaurantId)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
  }

  const handleIncrease = () => {
    if (cartItem) {
      updateQuantity(item.id, quantity + 1)
    } else {
      handleAdd()
    }
  }

  const handleDecrease = () => {
    if (quantity === 1) {
      removeItem(item.id)
    } else if (quantity > 1) {
      updateQuantity(item.id, quantity - 1)
    }
  }

  const primaryColor = customStyles?.primaryColor || '#ea580c'
  const accentColor = customStyles?.accentColor || '#16a34a'
  const textColor = customStyles?.textColor || '#1c1917'

  const hasDescription = item.description?.trim().length ?? 0 > 0
  const hasAllergens = (item.allergens?.length ?? 0) > 0

  return (
    <div 
      className="group rounded-xl border p-3 hover:shadow-lg transition-all duration-200"
      style={{
        backgroundColor: `${primaryColor}06`,
        borderColor: quantity > 0 ? primaryColor : `${primaryColor}15`,
        boxShadow: quantity > 0 ? `0 0 0 2px ${primaryColor}30` : 'none',
      }}
    >
      <div className="flex gap-3 items-center">
        {item.image_url ? (
          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-black/5 relative">
            <Image
              src={item.image_url || "/placeholder.svg"}
              alt={item.name}
              fill
              sizes="64px"
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              quality={75}
            />
          </div>
        ) : (
          <div 
            className="w-16 h-16 rounded-lg shrink-0 flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}10` }}
          >
            <span className="text-2xl opacity-40">🍽</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold leading-tight" style={{ color: textColor }}>{item.name}</h3>
            <span 
              className="font-bold shrink-0"
              style={{ color: accentColor }}
            >
              {item.price.toFixed(2)} zł
            </span>
          </div>
          {hasDescription && (
            <p className="text-sm mt-0.5 line-clamp-1" style={{ color: `${textColor}99` }}>
              {item.description}
            </p>
          )}
          {hasAllergens && (
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: `${textColor}70` }}>
              <AlertTriangle className="w-3 h-3" />
              {item.allergens?.join(', ')}
            </p>
          )}
        </div>
        <div className="shrink-0">
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: justAdded ? accentColor : primaryColor,
                color: '#ffffff',
              }}
              aria-label={`Dodaj ${item.name} do koszyka`}
            >
              {justAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          ) : (
            <div 
              className="flex items-center gap-0.5 rounded-full p-0.5"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <button
                onClick={handleDecrease}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                style={{ backgroundColor: primaryColor, color: '#ffffff' }}
                aria-label="Zmniejsz ilość"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span 
                className="w-7 text-center font-bold text-sm"
                style={{ color: primaryColor }}
                role="status"
                aria-label={`Ilość: ${quantity}`}
              >
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                style={{ backgroundColor: primaryColor, color: '#ffffff' }}
                aria-label="Zwiększ ilość"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
