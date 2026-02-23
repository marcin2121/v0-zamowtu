'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UtensilsCrossed, ShoppingBag, Tag, Crown, BarChart3, Star, Palette, Settings, 
  History, CreditCard, ArrowLeft, Sparkles, Clock, Check, X, Phone, MapPin, 
  Truck, ChefHat, Lock, TrendingUp, Users, ShoppingCart, ExternalLink, 
  Play, Calendar, Lightbulb, Menu as MenuIcon 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Konfiguracja nawigacji
const navItems = [
  { id: 'orders', label: 'Zamówienia', icon: ShoppingBag, pro: false },
  { id: 'stats', label: 'Statystyki', icon: BarChart3, pro: true },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed, pro: false },
  { id: 'scheduled', label: 'Zaplanowane', icon: Calendar, pro: false },
  { id: 'loyalty', label: 'Lojalność', icon: Crown, pro: true },
  { id: 'reviews', label: 'Opinie', icon: Star, pro: true },
  { id: 'billing', label: 'Rozliczenia', icon: CreditCard, pro: false },
  { id: 'settings', label: 'Ustawienia', icon: Settings, pro: false },
]

// Dane Demo
const demoOrders = [
  { id: '1', customer_name: 'Jan Kowalski', customer_phone: '123 456 789', status: 'pending', total: 89.00, created_at: '12:45', items: [{ name: 'Pizza Margherita', quantity: 2, price: 32.00 }] },
  { id: '2', customer_name: 'Anna Nowak', customer_phone: '987 654 321', status: 'preparing', total: 76.00, created_at: '12:30', items: [{ name: 'Spaghetti Carbonara', quantity: 1, price: 34.00 }] }
]

const demoStats = { revenue: '12 450', orders: 156, avgOrder: 79, returning: 42 }

export default function DemoPage() {
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional'>('professional')
  const [activeSection, setActiveSection] = useState('orders')
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
            onClick={() => { if(!isLocked) { setActiveSection(item.id); setIsMobileMenuOpen(false); } }}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left text-sm ${isActive ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : isLocked ? 'opacity-30 cursor-not-allowed text-zinc-500' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
            disabled={isLocked}
          >
            <item.icon size={18} />
            <span className="flex-1 font-bold">{item.label}</span>
            {isLocked && <Lock size={14} />}
          </button>
        )
      })}
    </nav>
  )

  const renderContent = () => {
    const navItem = navItems.find(item => item.id === activeSection)
    if (navItem?.pro && !isPro) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
          <div className="w-20 h-20 bg-orange-600/10 rounded-full flex items-center justify-center mb-6"><Lock className="text-orange-500" size={32} /></div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase italic">Funkcja Professional</h2>
          <p className="text-zinc-500 mb-8 max-w-xs text-sm">Sekcja {navItem.label} jest dostępna dla restauracji z aktywnym planem Pro.</p>
          <Button onClick={() => setSelectedPlan('professional')} className="bg-orange-600 hover:bg-orange-700 font-black uppercase text-[10px] tracking-widest px-8 h-12 rounded-full">Przełącz na PRO</Button>
        </div>
      )
    }

    switch (activeSection) {
      case 'orders':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Zamówienia</h1>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Bieżąca obsługa kuchni</p>
            </div>
            <div className="grid gap-4">
              {demoOrders.map((order) => (
                <Card key={order.id} className="border-white/5 bg-zinc-900/50 rounded-3xl overflow-hidden backdrop-blur-md">
                  <CardContent className="p-0">
                    <div className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-white font-black text-lg leading-none">{order.customer_name}</p>
                        <p className="text-zinc-500 text-xs flex items-center gap-1 font-bold"><Phone size={12} className="text-orange-500"/> {order.customer_phone}</p>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge className={`${order.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'} text-white font-black text-[9px] uppercase tracking-widest border-none`}>{order.status === 'pending' ? 'Nowe' : 'W kuchni'}</Badge>
                        <p className="text-xl font-black text-orange-500 tracking-tighter">{order.total.toFixed(2)} zł</p>
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm"><span className="text-zinc-400 font-medium"><span className="text-white font-black">{item.quantity}x</span> {item.name}</span><span className="text-white font-bold">{item.price.toFixed(2)} zł</span></div>
                        ))}
                        <div className="flex gap-2 pt-2">
                            <Button className="flex-1 bg-orange-600 hover:bg-orange-700 font-black uppercase text-[10px] tracking-widest h-12 rounded-2xl">Przyjmij</Button>
                            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 h-12 px-5 rounded-2xl"><X size={18}/></Button>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      case 'stats':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-white">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Statystyki</h1>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Przychód', val: `${demoStats.revenue} zł`, icon: TrendingUp },
                { label: 'Zamówienia', val: demoStats.orders, icon: ShoppingBag },
                { label: 'Śr. Koszyk', val: `${demoStats.avgOrder} zł`, icon: ShoppingCart },
                { label: 'Powracający', val: `${demoStats.returning}%`, icon: Users },
              ].map((s, i) => (
                <div key={i} className="p-5 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center text-center">
                  <s.icon className="text-orange-500 mb-2" size={20} />
                  <span className="text-lg font-black tracking-tighter">{s.val}</span>
                  <span className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )
      case 'menu':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-end justify-between">
                <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Menu</h1>
                <Button className="bg-white text-black font-black text-[10px] uppercase h-8 px-4 rounded-full">Dodaj +</Button>
            </div>
            <div className="grid gap-3">
                {['Pizza Margherita', 'Pizza Pepperoni', 'Carbonara'].map((item, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-xl">🍕</div>
                            <div>
                                <p className="text-white font-black text-sm">{item}</p>
                                <p className="text-orange-500 font-bold text-xs">32.00 zł</p>
                            </div>
                        </div>
                        <Badge className="bg-green-500/10 text-green-500 border-none text-[8px] font-black uppercase">Aktywny</Badge>
                    </div>
                ))}
            </div>
          </div>
        )
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[40vh] opacity-20">
            <Settings className="animate-spin-slow mb-4 text-white" size={40} />
            <p className="font-black text-white uppercase tracking-widest text-[10px]">Synchronizacja danych...</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans selection:bg-orange-500">
      {/* NAGŁÓWEK - USUNIĘTO POWRÓT */}
      <header className="sticky top-0 z-[100] bg-zinc-900/90 border-b border-white/5 backdrop-blur-xl h-16 sm:h-20 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-white hover:bg-white/5 rounded-xl">
              <MenuIcon size={24} />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-600/20"><UtensilsCrossed size={20}/></div>
              <div className="flex flex-col -space-y-1">
                <span className="font-black text-white uppercase tracking-tighter italic text-sm sm:text-base">Pizzeria Demo</span>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/><span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Live Preview</span></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex bg-white/5 p-1 rounded-full border border-white/5">
              {['starter', 'professional'].map(p => (
                <button key={p} onClick={() => setSelectedPlan(p as any)} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${selectedPlan === p ? 'bg-orange-600 text-white shadow-lg' : 'text-zinc-500'}`}>{p}</button>
              ))}
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700 text-[10px] font-black uppercase tracking-[0.2em] px-6 h-10 sm:h-12 rounded-2xl shadow-xl shadow-orange-600/10">Zapisz się</button>
          </div>
        </div>
      </header>

      {/* PASEK PLANU NA MOBILE */}
      <div className="lg:hidden flex px-6 py-3 gap-2 border-b border-white/5 bg-zinc-950">
        {['starter', 'professional'].map(p => (
            <button key={p} onClick={() => setSelectedPlan(p as any)} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${selectedPlan === p ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-900/20' : 'bg-white/5 border-white/5 text-zinc-500'}`}>{p === 'starter' ? 'Starter (99zł)' : 'Pro (199zł)'}</button>
        ))}
      </div>

      <div className="flex max-w-7xl mx-auto px-6">
        {/* SIDEBAR DESKTOP */}
        <aside className="w-64 min-h-[calc(100vh-80px)] border-r border-white/5 sticky top-20 hidden lg:flex flex-col py-8 pr-6">
          <NavContent />
          <div className="mt-auto p-5 rounded-3xl bg-orange-600/5 border border-orange-600/10 text-center">
             <Sparkles className="mx-auto text-orange-500 mb-2" size={20} />
             <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1">Twoja Restauracja</p>
             <p className="text-sm font-black text-white italic uppercase tracking-tighter">Już od 99 zł / mc</p>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 py-8 lg:py-12 lg:pl-12">
          <div className="max-w-3xl">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* DRAWER MOBILE */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150]" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed left-0 top-0 bottom-0 w-[300px] bg-zinc-900 z-[200] flex flex-col border-r border-white/5 shadow-2xl p-8" >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3"><div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white"><UtensilsCrossed size={20}/></div><span className="font-black text-lg text-white italic uppercase tracking-tighter">Panel Demo</span></div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-500 hover:text-white rounded-full bg-white/5"><X/></Button>
              </div>
              <NavContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
      `}</style>
    </div>
  )
}
