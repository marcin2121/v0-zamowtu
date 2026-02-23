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
  Pause,
  Play,
  Calendar,
  Lightbulb,
  Menu as MenuIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

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

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Nowe', color: 'bg-yellow-500 text-white' },
  accepted: { label: 'Przyjęte', color: 'bg-blue-500 text-white' },
  preparing: { label: 'W przygotowaniu', color: 'bg-purple-500 text-white' },
  ready: { label: 'Gotowe', color: 'bg-green-500 text-white' },
}

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
                ? 'bg-orange-600 text-white'
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
          <h2 className="text-2xl font-bold mb-2 text-white">Funkcja Pro</h2>
          <p className="text-muted-foreground mb-6 max-w-xs text-sm">
            {navItem.label} to funkcja dostępna tylko w planie Pro.
          </p>
          <Button onClick={() => setSelectedPlan('professional')} className="bg-orange-600 hover:bg-orange-700">
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
              <h1 className="text-2xl font-bold text-white">Aktywne zamówienia</h1>
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
                <Card key={order.id} className="overflow-hidden border-white/5 bg-zinc-900/50">
                  <CardContent className="p-0">
                    <div className="p-4 border-b border-white/5 bg-white/5">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-base leading-none text-white">{order.customer_name}</span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> {order.customer_phone}
                                </span>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Badge className={`${statusLabels[order.status].color} border-none font-bold text-[10px] uppercase tracking-wider`}>
                                    {statusLabels[order.status].label}
                                </Badge>
                                <span className="text-lg font-black text-orange-500">{order.total.toFixed(2)} zł</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 space-y-2 text-zinc-300">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span><span className="text-white font-bold">{item.quantity}x</span> {item.name}</span>
                          <span className="font-medium text-white">{(item.quantity * item.price).toFixed(2)} zł</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 pt-0 flex gap-2">
                      <Button size="sm" className="flex-1 bg-orange-600 hover:bg-orange-700 font-bold">PRZYJMIJ</Button>
                      <Button size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/5"><X className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center opacity-50">
            <Settings className="w-12 h-12 mb-4 text-zinc-500" />
            <p className="font-bold text-white uppercase tracking-widest text-xs">Sekcja w przygotowaniu</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-[100] bg-zinc-900/80 border-b border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 lg:gap-4">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-white">
              <MenuIcon className="w-6 h-6" />
            </Button>
            <Link href="/" className="shrink-0">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white gap-2">
                    <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Powrót</span>
                </Button>
            </Link>
            <div className="flex items-center gap-2 border-l border-white/10 pl-2 lg:pl-4">
              <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="font-black text-[10px] sm:text-xs uppercase text-white tracking-tighter truncate">Demo Panelu</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
              <button onClick={() => setSelectedPlan('starter')} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${selectedPlan === 'starter' ? 'bg-orange-600 text-white shadow-lg' : 'text-zinc-500'}`}>Starter</button>
              <button onClick={() => setSelectedPlan('professional')} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${selectedPlan === 'professional' ? 'bg-orange-600 text-white shadow-lg' : 'text-zinc-500'}`}>Pro</button>
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700 text-[10px] font-black uppercase tracking-widest px-4 h-9">Zapisz się</Button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] lg:hidden" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed left-0 top-0 bottom-0 w-[280px] bg-zinc-900 z-[200] lg:hidden flex flex-col border-r border-white/5 shadow-2xl p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white"><UtensilsCrossed size={18}/></div>
                  <span className="font-black text-sm uppercase text-white">Menu Demo</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="text-white"><X/></Button>
              </div>
              <NavContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex max-w-7xl mx-auto">
        {/* Desktop Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-64px)] border-r border-white/5 sticky top-16 hidden lg:flex flex-col p-4">
          <div className="p-4 mb-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20"><UtensilsCrossed className="w-5 h-5 text-white" /></div>
              <div>
                <h2 className="font-black text-xs uppercase text-white leading-none mb-1">Pizzeria Demo</h2>
                <Badge className="bg-green-500/20 text-green-500 text-[8px] font-black uppercase h-4 border-none px-1.5">Online</Badge>
              </div>
            </div>
          </div>
          <NavContent />
        </aside>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-10">
          <div className="max-w-4xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
