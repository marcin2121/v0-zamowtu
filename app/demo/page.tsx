'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  UtensilsCrossed, 
  ShoppingBag,
  Tag,
  Crown,
  BarChart3,
  Star,
  Palette,
  Settings,
  History,
  CreditCard,
  ArrowLeft,
  Sparkles,
  Clock,
  Check,
  X,
  Phone,
  MapPin,
  Truck,
  ChefHat,
  Lock,
  TrendingUp,
  Users,
  ShoppingCart,
  ExternalLink,
  Bell,
  Pause,
  Play,
  Calendar,
  Lightbulb,
  Menu as MenuIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

// ... (navItems, demoOrders, demoMenuItems itd. zostają bez zmian jak w Twoim kodzie)
const navItems = [
  { id: 'orders', label: 'Zamówienia', icon: ShoppingBag, pro: false },
  { id: 'scheduled', label: 'Zaplanowane', icon: Calendar, pro: false },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed, pro: false },
  { id: 'suggestions', label: 'Sugestie', icon: Lightbulb, pro: true },
  { id: 'customize', label: 'Personalizacja', icon: Palette, pro: true },
  { id: 'discounts', label: 'Kody rabatowe', icon: Tag, pro: true },
  { id: 'loyalty', label: 'Lojalność', icon: Crown, pro: true },
  { id: 'reviews', label: 'Opinie', icon: Star, pro: true },
  { id: 'history', label: 'Historia', icon: History, pro: false },
  { id: 'stats', label: 'Statystyki', icon: BarChart3, pro: true },
  { id: 'settings', label: 'Ustawienia', icon: Settings, pro: false },
  { id: 'billing', label: 'Rozliczenia', icon: CreditCard, pro: false },
]

const demoOrders = [
  { id: '1', customer_name: 'Jan Kowalski', customer_phone: '123 456 789', customer_address: 'ul. Warszawska 15/3, 00-001 Warszawa', status: 'pending', total: 89.00, delivery_type: 'delivery', created_at: '12:45', items: [{ name: 'Pizza Margherita', quantity: 2, price: 32.00 }, { name: 'Cola 0.5L', quantity: 2, price: 8.00 }, { name: 'Tiramisu', quantity: 1, price: 17.00 }] },
  { id: '2', customer_name: 'Anna Nowak', customer_phone: '987 654 321', customer_address: null, status: 'preparing', total: 76.00, delivery_type: 'pickup', created_at: '12:30', items: [{ name: 'Pizza Pepperoni', quantity: 1, price: 38.00 }, { name: 'Spaghetti Carbonara', quantity: 1, price: 34.00 }, { name: 'Woda mineralna', quantity: 1, price: 6.00 }] },
  { id: '3', customer_name: 'Piotr Wiśniewski', customer_phone: '555 123 456', customer_address: 'ul. Krakowska 42, 00-025 Warszawa', status: 'ready', total: 122.00, delivery_type: 'delivery', created_at: '12:15', items: [{ name: 'Pizza Quattro Formaggi', quantity: 2, price: 42.00 }, { name: 'Sałatka Cesarska', quantity: 1, price: 32.00 }, { name: 'Tiramisu', quantity: 1, price: 17.00 }] }
]

const demoScheduledOrders = [
  { id: '101', customer_name: 'Michał Lewandowski', date: 'Jutro 18:00', status: 'scheduled', total: 156.00 },
  { id: '102', customer_name: 'Katarzyna Zielińska', date: '15.02 19:30', status: 'scheduled', total: 98.50 },
]

const demoMenuItems = [
  { id: '1', name: 'Pizza Margherita', price: 32.00, category: 'Pizza', available: true, image: '🍕' },
  { id: '2', name: 'Pizza Pepperoni', price: 38.00, category: 'Pizza', available: true, image: '🍕' },
  { id: '3', name: 'Pizza Quattro Formaggi', price: 42.00, category: 'Pizza', available: true, image: '🍕' },
  { id: '4', name: 'Spaghetti Carbonara', price: 34.00, category: 'Makarony', available: true, image: '🍝' },
  { id: '5', name: 'Penne Arrabiata', price: 28.00, category: 'Makarony', available: false, image: '🍝' },
  { id: '6', name: 'Sałatka Cesarska', price: 32.00, category: 'Sałatki', available: true, image: '🥗' },
]

const demoDiscounts = [
  { code: 'NOWYKLIENT', type: 'percentage', value: 15, uses: 23, limit: 100, active: true },
  { code: 'PIZZA10', type: 'fixed', value: 10, uses: 45, limit: 50, active: true },
  { code: 'WEEKEND20', type: 'percentage', value: 20, uses: 12, limit: null, active: false },
]

const demoLoyalty = [
  { name: 'Brązowy', min_spent: 0, discount: 0, customers: 156 },
  { name: 'Srebrny', min_spent: 200, discount: 5, customers: 42 },
  { name: 'Złoty', min_spent: 500, discount: 10, customers: 18 },
  { name: 'Platynowy', min_spent: 1000, discount: 15, customers: 7 },
]

const demoReviews = [
  { id: '1', customer: 'Anna K.', rating: 5, comment: 'Najlepsza pizza w mieście! Szybka dostawa.', date: '2 dni temu', reply: null },
  { id: '2', customer: 'Marek W.', rating: 4, comment: 'Bardzo dobra carbonara.', date: '5 dni temu', reply: 'Dziękujemy za opinię!' },
  { id: '3', customer: 'Kasia M.', rating: 5, comment: 'Świeże składniki, polecam!', date: '1 tydzień temu', reply: null },
]

const demoStats = {
  revenue: 12450,
  orders: 156,
  avgOrder: 79.81,
  returningCustomers: 42,
  topProducts: [
    { name: 'Pizza Margherita', orders: 45, revenue: 1440 },
    { name: 'Pizza Pepperoni', orders: 38, revenue: 1444 },
    { name: 'Spaghetti Carbonara', orders: 29, revenue: 986 },
  ]
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Nowe', color: 'bg-yellow-500 text-white' },
  accepted: { label: 'Przyjęte', color: 'bg-blue-500 text-white' },
  preparing: { label: 'W przygotowaniu', color: 'bg-purple-500 text-white' },
  ready: { label: 'Gotowe', color: 'bg-green-500 text-white' },
}

export default function DemoPage() {
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional'>('professional')
  const [activeSection, setActiveSection] = useState('orders')
  const [isPaused, setIsPaused] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isPro = selectedPlan === 'professional'

  const NavContent = () => (
    <nav className="space-y-1 flex-1">
      {navItems.map((item) => {
        const isActive = activeSection === item.id
        const isLocked = item.pro && !isPro
        
        return (
          <button
            key={item.id}
            onClick={() => {
                if(!isLocked) {
                    setActiveSection(item.id)
                    setIsMobileMenuOpen(false)
                }
            }}
            className={`w-full flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-lg transition-colors text-left text-sm ${
              isActive
                ? 'bg-accent text-white'
                : isLocked
                  ? 'text-muted-foreground/40 cursor-not-allowed'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            disabled={isLocked}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="flex-1 font-medium">{item.label}</span>
            {isLocked && <Lock className="w-4 h-4" />}
          </button>
        )
      })}
      
      <div className="pt-4 border-t mt-auto">
        <Link 
          href="/r/demo" 
          target="_blank"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm"
        >
          <ExternalLink className="w-5 h-5" />
          <span className="flex-1">Strona klienta</span>
        </Link>
      </div>
    </nav>
  )

  const renderContent = () => {
    const navItem = navItems.find(item => item.id === activeSection)
    if (navItem?.pro && !isPro) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <Lock className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
          <h2 className="text-2xl font-bold mb-2">Funkcja Pro</h2>
          <p className="text-muted-foreground mb-6 max-w-xs text-sm">
            {navItem.label} to funkcja dostępna tylko w planie Pro.
          </p>
          <Button onClick={() => setSelectedPlan('professional')} variant="cta">
            Przełącz na Pro
          </Button>
        </div>
      )
    }

    switch (activeSection) {
      case 'orders':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Aktywne zamówienia</h1>
              <p className="text-muted-foreground text-sm">Zarządzaj bieżącymi zamówieniami klientów</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-3 text-yellow-600 dark:text-yellow-500">
                  <Clock className="w-5 h-5" />
                  <span className="font-bold text-sm">Nowe</span>
                </div>
                <span className="text-2xl font-black text-yellow-600">2</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-500">
                  <ChefHat className="w-5 h-5" />
                  <span className="font-bold text-sm">W kuchni</span>
                </div>
                <span className="text-2xl font-black text-purple-600">1</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3 text-green-600 dark:text-green-500">
                  <Check className="w-5 h-5" />
                  <span className="font-bold text-sm">Gotowe</span>
                </div>
                <span className="text-2xl font-black text-green-600">1</span>
              </div>
            </div>

            <div className="grid gap-4">
              {demoOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden border-border/50">
                  <CardContent className="p-0">
                    <div className="p-4 border-b border-border/50 bg-muted/30">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-base leading-none">{order.customer_name}</span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> {order.customer_phone}
                                </span>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Badge className={`${statusLabels[order.status].color} border-none font-bold text-[10px] uppercase tracking-wider`}>
                                    {statusLabels[order.status].label}
                                </Badge>
                                <span className="text-lg font-black text-accent">{order.total.toFixed(2)} zł</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground font-medium">
                            <span className="bg-background px-2 py-1 rounded-md border flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {order.created_at}
                            </span>
                            <span className="bg-background px-2 py-1 rounded-md border flex items-center gap-1 uppercase tracking-tighter">
                                {order.delivery_type === 'delivery' ? <Truck className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                {order.delivery_type === 'delivery' ? 'Dostawa' : 'Odbiór'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="p-4 space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-muted-foreground"><span className="text-foreground font-bold">{item.quantity}x</span> {item.name}</span>
                          <span className="font-medium">{(item.quantity * item.price).toFixed(2)} zł</span>
                        </div>
                      ))}
                    </div>

                    {order.customer_address && (
                        <div className="px-4 pb-2">
                            <div className="bg-orange-500/5 border border-orange-500/10 rounded-lg p-3 text-xs flex gap-2">
                                <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                                <span className="text-muted-foreground leading-relaxed">{order.customer_address}</span>
                            </div>
                        </div>
                    )}

                    <div className="p-4 pt-2 flex gap-2">
                      {order.status === 'pending' && (
                        <>
                          <Button size="sm" variant="cta" className="flex-1 font-bold">PRZYJMIJ</Button>
                          <Button size="sm" variant="outline" className="px-3 border-red-500/20 hover:bg-red-500 hover:text-white transition-all"><X className="w-4 h-4" /></Button>
                        </>
                      )}
                      {order.status === 'preparing' && (
                        <Button size="sm" variant="cta" className="flex-1 font-bold">GOTOWE DO WYDANIA</Button>
                      )}
                      {order.status === 'ready' && (
                        <Button size="sm" variant="confirm" className="flex-1 font-bold">WYDAJ ZAMÓWIENIE</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 'stats':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Statystyki</h1>
              <p className="text-muted-foreground text-sm">Podsumowanie ostatnich 7 dni</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Przychód', val: `${demoStats.revenue} zł`, icon: TrendingUp },
                { label: 'Zamówienia', val: demoStats.orders, icon: ShoppingCart },
                { label: 'Śr. koszyk', val: `${demoStats.avgOrder.toFixed(0)} zł`, icon: ShoppingBag },
                { label: 'Lojalność', val: `${demoStats.returningCustomers}%`, icon: Users },
              ].map((s, i) => (
                <Card key={i} className="border-none shadow-none bg-muted/40">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <s.icon className="w-5 h-5 mb-2 text-accent" />
                    <p className="text-lg font-black leading-none mb-1">{s.val}</p>
                    <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Bestsellery</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {demoStats.topProducts.map((product, i) => (
                    <div key={product.name} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-accent/10 text-accent text-xs flex items-center justify-center font-black">#{i + 1}</span>
                        <span className="font-bold text-sm">{product.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm">{product.revenue} zł</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{product.orders} szt.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      // ... reszta sekcji renderuje się podobnie
      default:
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center opacity-50">
                <Settings className="w-12 h-12 mb-4 animate-spin-slow" />
                <p className="font-bold">Sekcja {navItem?.label} w przygotowaniu</p>
                <p className="text-sm">To jest wersja demonstracyjna.</p>
            </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 font-sans selection:bg-orange-500">
      {/* Demo Header */}
      <header className="sticky top-0 z-[100] bg-card border-b border-border/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 lg:gap-4 overflow-hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden shrink-0">
              <MenuIcon className="w-6 h-6" />
            </Button>
            <Link href="/" className="shrink-0">
              <Button variant="ghost"
