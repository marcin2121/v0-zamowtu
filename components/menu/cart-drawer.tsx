'use client'

import { useState } from 'react'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useCartStore } from '@/lib/cart-store'
import type { RestaurantSettings } from '@/lib/types'
import { CheckoutForm } from './checkout-form'

interface CustomStyles {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  textColor: string
}

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  settings: RestaurantSettings
  restaurantId: string
  restaurantSlug?: string | null
  customStyles?: CustomStyles
}

export function CartDrawer({ open, onClose, settings, restaurantId, restaurantSlug, customStyles }: CartDrawerProps) {
  const [showCheckout, setShowCheckout] = useState(false)
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore()
  
  const subtotal = getTotal()
  const deliveryFee = settings.delivery_fee
  const total = subtotal + deliveryFee
  const meetsMinimum = subtotal >= settings.min_order_value
  const missingAmount = settings.min_order_value - subtotal
  const progressPercent = Math.min((subtotal / settings.min_order_value) * 100, 100)

  const primaryColor = customStyles?.primaryColor || '#ea580c'
  const accentColor = customStyles?.accentColor || '#16a34a'
  const secondaryColor = customStyles?.secondaryColor || '#1c1917'
  const textColor = customStyles?.textColor || '#1c1917'

  const drawerStyle = customStyles ? {
    backgroundColor: secondaryColor,
    color: textColor,
  } : {}

  if (showCheckout) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0" style={drawerStyle}>
          <div className="p-6">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-xl" style={{ color: textColor }}>Dane zamówienia</SheetTitle>
            </SheetHeader>
            <CheckoutForm
              items={items}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              total={total}
              restaurantId={restaurantId}
              restaurantSlug={restaurantSlug}
              onBack={() => setShowCheckout(false)}
              onSuccess={() => {
                clearCart()
                onClose()
                setShowCheckout(false)
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0" style={drawerStyle}>
        {/* Header */}
        <div className="p-6 pb-4 border-b" style={{ borderColor: `${textColor}15` }}>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3 text-xl" style={{ color: textColor }}>
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <ShoppingBag className="w-5 h-5" style={{ color: primaryColor }} />
              </div>
              Twój koszyk
              {items.length > 0 && (
                <span 
                  className="ml-auto text-sm font-normal px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  {items.length} {items.length === 1 ? 'produkt' : items.length < 5 ? 'produkty' : 'produktów'}
                </span>
              )}
            </SheetTitle>
          </SheetHeader>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${primaryColor}10` }}
              >
                <Package className="w-10 h-10" style={{ color: `${textColor}50` }} />
              </div>
              <p className="text-lg font-medium mb-1" style={{ color: textColor }}>Koszyk jest pusty</p>
              <p className="text-sm" style={{ color: `${textColor}70` }}>
                Dodaj produkty z menu, aby zlożyć zamówienie
              </p>
              <Button
                variant="outline"
                className="mt-4 bg-transparent"
                onClick={onClose}
                style={{ borderColor: `${textColor}30`, color: textColor }}
              >
                Przeglądaj menu
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-xl border"
                  style={{ 
                    backgroundColor: `${primaryColor}08`,
                    borderColor: `${textColor}10`,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold" style={{ color: textColor }}>
                      {item.name}
                    </h4>
                    <p className="text-sm mt-0.5" style={{ color: `${textColor}70` }}>
                      {item.price.toFixed(2)} zł za szt.
                    </p>
                    {item.notes && (
                      <p 
                        className="text-xs mt-1.5 italic px-2 py-1 rounded"
                        style={{ backgroundColor: `${textColor}10`, color: `${textColor}70` }}
                      >
                        {item.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span 
                      className="font-bold text-lg"
                      style={{ color: accentColor }}
                    >
                      {(item.price * item.quantity).toFixed(2)} zł
                    </span>
                    <div 
                      className="flex items-center gap-1 p-1 rounded-full"
                      style={{ backgroundColor: `${primaryColor}10` }}
                    >
                      <button
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                        style={{ backgroundColor: primaryColor, color: '#ffffff' }}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span 
                        className="w-8 text-center font-bold"
                        style={{ color: primaryColor }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                        style={{ backgroundColor: primaryColor, color: '#ffffff' }}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="w-7 h-7 rounded-full flex items-center justify-center ml-1 text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t p-6 space-y-4" style={{ borderColor: `${textColor}15`, backgroundColor: `${primaryColor}05` }}>
              {/* Minimum order progress */}
              {!meetsMinimum && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: `${textColor}70` }}>Do minimalnego zamówienia</span>
                    <span className="font-medium" style={{ color: '#ef4444' }}>brakuje {missingAmount.toFixed(2)} zł</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${textColor}15` }}>
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${progressPercent}%`,
                        backgroundColor: progressPercent >= 100 ? accentColor : primaryColor,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: `${textColor}70` }}>Suma produktów</span>
                  <span style={{ color: textColor }}>{subtotal.toFixed(2)} zł</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: `${textColor}70` }}>Dostawa</span>
                  <span style={{ color: textColor }}>{deliveryFee.toFixed(2)} zł</span>
                </div>
                <div className="flex justify-between font-bold text-xl pt-3 border-t" style={{ borderColor: `${textColor}15`, color: textColor }}>
                  <span>Razem</span>
                  <span style={{ color: accentColor }}>{total.toFixed(2)} zł</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                className="w-full h-12 text-base font-semibold rounded-xl"
                size="lg"
                disabled={!meetsMinimum}
                onClick={() => setShowCheckout(true)}
                style={{
                  backgroundColor: meetsMinimum ? primaryColor : undefined,
                  color: meetsMinimum ? '#ffffff' : undefined,
                }}
              >
                Przejdź do zamówienia
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
