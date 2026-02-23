'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UtensilsCrossed, ShoppingBag, Tag, Crown, BarChart3, Star, Palette, Settings, 
  History, CreditCard, ArrowLeft, Sparkles, Clock, Check, X, Phone, MapPin, 
  Truck, ChefHat, Lock, TrendingUp, Users, ShoppingCart, ExternalLink, 
  Play, Pause, Calendar, Lightbulb, Menu as MenuIcon 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

// --- DANE DEMO (Wszystkie zakładki) ---
const navItems = [
  { id: 'orders', label: 'Zamówienia', icon: ShoppingBag, pro: false },
  { id: 'scheduled', label: 'Zaplanowane', icon: Calendar, pro: false },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed, pro: false },
  { id: 'suggestions', label: 'Sugestie AI', icon: Lightbulb, pro: true },
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
  { id: '1', customer_name: 'Jan Kowalski', customer_phone: '123 456 789', customer_address: 'ul. Warszawska 15/3', status: 'pending', total: 89.00, delivery_type: 'delivery', created_at: '12:45', items: [{ name: 'Pizza Margherita', quantity: 2, price: 32.00 }, { name: 'Cola 0.5L', quantity: 2, price: 8.00 }, { name: 'Tiramisu', quantity: 1, price: 17.00 }] },
  { id: '2', customer_name: 'Anna Nowak', customer_phone: '987 654 321', customer_address: null, status: 'preparing', total: 76.00, delivery_type: 'pickup', created_at: '12:30', items: [{ name: 'Pizza Pepperoni', quantity: 1, price: 38.00 }, { name: 'Spaghetti Carbonara', quantity: 1, price: 34.00 }] },
  { id: '3', customer_name: 'Piotr Wiśniewski', customer_phone: '555 123 456', customer_address: 'ul. Krakowska 42', status: 'ready', total: 122.00, delivery_type: 'delivery', created_at: '12:15', items: [{ name: 'Pizza Quattro Formaggi', quantity: 2, price: 42.00 }, { name: 'Sałatka Cesarska', quantity: 1, price: 32.00 }] }
]

const demoScheduledOrders = [
  { id: '101', customer_name: 'Michał Lewandowski', date: 'Jutro 18:00', status: 'scheduled', total: 156.00 },
  { id: '102', customer_name: 'Katarzyna Zielińska', date: '15.02 19:30', status: 'scheduled', total: 98.50 },
]

const demoMenuItems = [
  { id: '1', name: 'Pizza Margherita', price: 32.00, category: 'Pizza', available: true, image: '🍕' },
  { id: '2', name: 'Pizza Pepperoni', price: 38.00, category: 'Pizza', available: true, image: '🍕' },
  { id: '4', name: 'Spaghetti Carbonara', price: 34.00, category: 'Makarony', available: true, image: '🍝' },
  { id: '5', name: 'Penne Arrabiata', price: 28.00, category: 'Makarony', available: false, image: '🍝' },
]

const demoDiscounts = [
  { code: 'NOWYKLIENT', type: 'percentage', value: 15, uses: 23, limit: 100, active: true },
  { code: 'PIZZA10', type: 'fixed', value: 10, uses: 45, limit: 50, active: true },
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
]

const demoStats = {
  revenue: 12450, orders: 156, avgOrder: 79.81, returningCustomers: 42,
  topProducts: [
    { name: 'Pizza Margherita', orders: 45, revenue: 1440 },
    { name: 'Pizza Pepperoni', orders: 38, revenue: 1444 },
    { name: 'Spaghetti Carbonara', orders: 29, revenue: 986 },
  ]
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Nowe', color: 'bg-yellow-500' },
  accepted: { label: 'Przyjęte', color: 'bg-blue-500' },
  preparing: { label: 'W kuchni', color: 'bg-purple-500' },
  ready: { label: 'Gotowe', color: 'bg-green-500' },
}

export default function DemoPage() {
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional'>('professional')
  const [activeSection, setActiveSection] = useState('orders')
  const [isPaused, setIsPaused] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isPro = selectedPlan === 'professional'

  // WSPÓLNA NAWIGACJA (Dla paska bocznego na Desktopie i Drawera na Mobile)
  const NavContent = () => (
    <nav className="space-y-1 flex-1 py-4">
      {navItems.map((item) => {
        const isActive = activeSection === item.id
        const isLocked = item.pro && !isPro
        return (
          <button
            key={item.id}
            onClick={() => { if(!isLocked) { setActiveSection(item.id); setIsMobileMenuOpen(false); } }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left text-sm font-bold ${
              isActive 
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' 
                : isLocked 
                  ? 'opacity-40 cursor-not-allowed text-zinc-500' 
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
            disabled={isLocked}
          >
            <item.icon size={18} className={isActive ? 'text-white' : 'text-zinc-500'} />
            <span className="flex-1">{item.label}</span>
            {isLocked && <Lock size={14} />}
          </button>
        )
      })}
    </nav>
  )

  // GŁÓWNY SILNIK RENDERUJĄCY WIDOKI
  const renderContent = () => {
    const navItem = navItems.find(item => item.id === activeSection)
    if (navItem?.pro && !isPro) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-orange-600/10 rounded-full flex items-center justify-center mb-6"><Lock className="text-orange-500" size={32} /></div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase italic">Funkcja Professional</h2>
          <p className="text-zinc-500 mb-8 max-w-sm text-sm leading-relaxed">Zakładka <strong>{navItem.label}</strong> jest dostępna w planie Pro. Przełącz tryb, aby przetestować jej możliwości.</p>
          <Button onClick={() => setSelectedPlan('professional')} className="bg-orange-600 hover:bg-orange-700 font-black uppercase text-[10px] tracking-widest px-8 h-12 rounded-full shadow-xl shadow-orange-900/30">Przełącz na PRO</Button>
        </div>
      )
    }

    switch (activeSection) {
      case 'orders':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-2">
                <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Zamówienia</h1>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Bieżąca obsługa klientów</p>
            </div>
            
            {/* Statystyki dzisiejsze */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Oczekujące', val: 2, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20' },
                { label: 'W kuchni', val: 1, icon: ChefHat, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/20' },
                { label: 'Gotowe', val: 1, icon: Check, color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' }
              ].map(s => (
                <div key={s.label} className={`flex items-center justify-between p-4 rounded-2xl border ${s.bg}`}>
                  <div className={`flex items-center gap-3 ${s.color}`}>
                    <s.icon className="w-5 h-5" />
                    <span className="font-bold text-sm">{s.label}</span>
                  </div>
                  <span className={`text-2xl font-black ${s.color}`}>{s.val}</span>
                </div>
              ))}
            </div>

            <div className="grid gap-4">
              {demoOrders.map((order) => (
                <Card key={order.id} className="border-white/5 bg-zinc-900/50 rounded-3xl overflow-hidden backdrop-blur-md">
                  <CardContent className="p-0">
                    <div className="p-5 border-b border-white/5 bg-white/5 flex flex-wrap gap-4 justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <p className="text-white font-black text-lg leading-none">{order.customer_name}</p>
                          <Badge className={`${statusLabels[order.status].color} text-white font-black text-[9px] uppercase tracking-widest border-none h-5 px-2`}>{statusLabels[order.status].label}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs font-bold text-zinc-500">
                          <span className="flex items-center gap-1"><Phone size={12} className="text-orange-500"/> {order.customer_phone}</span>
                          <span className="flex items-center gap-1"><Clock size={12} className="text-orange-500"/> {order.created_at}</span>
                          <span className="flex items-center gap-1 uppercase">
                            {order.delivery_type === 'delivery' ? <Truck size={12} className="text-orange-500"/> : <MapPin size={12} className="text-orange-500"/>}
                            {order.delivery_type === 'delivery' ? 'Dostawa' : 'Odbiór'}
                          </span>
                        </div>
                        {order.customer_address && (
                          <div className="flex items-center gap-2 text-zinc-400 text-xs mt-1 bg-white/5 px-2 py-1 rounded-md w-fit">
                            <MapPin size={12} /> {order.customer_address}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-orange-500 tracking-tighter">{order.total.toFixed(2)} <span className="text-sm">zł</span></p>
                      </div>
                    </div>
                    
                    <div className="p-5 space-y-3">
                        <div className="bg-black/20 rounded-xl p-3 space-y-2">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                  <span className="text-zinc-400 font-medium"><span className="text-white font-black">{item.quantity}x</span> {item.name}</span>
                                  <span className="text-white font-bold">{(item.quantity * item.price).toFixed(2)} zł</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 pt-2">
                            {order.status === 'pending' && (
                                <>
                                  <Button className="flex-1 bg-orange-600 hover:bg-orange-700 font-black uppercase text-[10px] tracking-widest h-12 rounded-xl shadow-lg shadow-orange-900/20">Przyjmij Zamówienie</Button>
                                  <Button variant="outline" className="border-white/10 text-white hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/50 h-12 px-5 rounded-xl transition-all"><X size={18}/></Button>
                                </>
                            )}
                            {order.status === 'preparing' && <Button className="flex-1 bg-purple-600 hover:bg-purple-700 font-black uppercase text-[10px] tracking-widest h-12 rounded-xl text-white">Gotowe do wydania</Button>}
                            {order.status === 'ready' && <Button className="flex-1 bg-green-600 hover:bg-green-700 font-black uppercase text-[10px] tracking-widest h-12 rounded-xl text-white">Zakończ / Wydane</Button>}
                        </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 'scheduled':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-2">
              <h1 className="text-3xl font-bold text-white italic uppercase tracking-tighter">Zaplanowane</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Zamówienia na przyszłe godziny</p>
            </div>
            <div className="grid gap-4">
              {demoScheduledOrders.map((order) => (
                <Card key={order.id} className="border-white/5 bg-zinc-900/50 rounded-2xl">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-black text-white text-lg">{order.customer_name}</p>
                      <p className="text-xs font-bold text-orange-500 flex items-center gap-1 mt-1"><Calendar size={12}/> {order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-white">{order.total.toFixed(2)} zł</p>
                      <Badge className="bg-blue-500/20 text-blue-400 border-none text-[9px] uppercase tracking-widest mt-1">Oczekuje</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 'menu':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-end justify-between">
                <div>
                  <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Menu</h1>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Zarządzaj kartą dań</p>
                </div>
                <Button className="bg-white text-black font-black text-[10px] uppercase h-10 px-6 rounded-xl hover:bg-zinc-200 shadow-xl shadow-white/10">Dodaj produkt</Button>
            </div>
            <div className="grid gap-3">
              {demoMenuItems.map((item) => (
                <Card key={item.id} className={`border-white/5 rounded-2xl transition-all ${item.available ? 'bg-zinc-900/50' : 'bg-zinc-950 opacity-60'}`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center text-2xl">{item.image}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-white">{item.name}</span>
                          {!item.available && <Badge className="bg-red-500/20 text-red-500 border-none text-[8px] uppercase">Niedostępne</Badge>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-orange-500 font-bold text-sm">{item.price.toFixed(2)} zł</span>
                          <span className="text-zinc-500 text-xs px-2 py-0.5 bg-white/5 rounded-md">{item.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="border-white/10 text-white bg-transparent h-9 px-4 rounded-lg hidden sm:flex">Edytuj</Button>
                      <Button variant="outline" size="sm" className={`border-white/10 h-9 px-4 rounded-lg font-bold text-[10px] uppercase tracking-widest ${item.available ? 'text-zinc-400 hover:text-red-500' : 'text-green-500 border-green-500/30'}`}>
                        {item.available ? 'Wyłącz' : 'Włącz'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 'suggestions':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-2">
              <h1 className="text-3xl font-bold text-white italic uppercase tracking-tighter">Sugestie AI</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Rekomendacje do poprawy sprzedaży</p>
            </div>
            <div className="grid gap-4">
              <Card className="border-orange-500/20 bg-orange-500/5 rounded-2xl">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="p-3 bg-orange-500/20 rounded-xl shrink-0"><Lightbulb className="text-orange-500" size={24} /></div>
                  <div>
                    <h3 className="font-black text-white text-lg mb-1">Pizza Margherita to Hit!</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">Ten produkt sprzedaje się 3x lepiej niż średnia. Rozważ ustawienie zestawu promocyjnego "Margherita + Napój", aby podnieść wartość koszyka.</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-blue-500/20 bg-blue-500/5 rounded-2xl">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl shrink-0"><TrendingUp className="text-blue-500" size={24} /></div>
                  <div>
                    <h3 className="font-black text-white text-lg mb-1">Powiększ strefę dostawy</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">Konkurencja w Twojej okolicy dowozi na dystansie 7km. Zwiększenie Twojego zasięgu o 2km może przynieść 15% więcej zamówień.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'discounts':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white italic uppercase tracking-tighter">Kody Rabatowe</h1>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Twórz kampanie promocyjne</p>
              </div>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white font-black text-[10px] uppercase h-10 px-6 rounded-xl shadow-lg shadow-orange-900/20">Nowy Kod</Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {demoDiscounts.map((discount) => (
                <Card key={discount.code} className="border-white/5 bg-zinc-900/50 rounded-2xl">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <code className="px-3 py-1 bg-black rounded-lg text-orange-500 font-mono font-black text-lg border border-orange-500/20">{discount.code}</code>
                      <Badge className="bg-green-500/20 text-green-500 border-none font-black text-[8px] uppercase px-2 h-5">Aktywny</Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-white font-bold">{discount.type === 'percentage' ? `Zniżka ${discount.value}%` : `Zniżka ${discount.value} zł`}</p>
                      <p className="text-zinc-500 text-xs">Użyto: {discount.uses} {discount.limit ? `/ ${discount.limit} razy` : 'razy'}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 'loyalty':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-2">
              <h1 className="text-3xl font-bold text-white italic uppercase tracking-tighter">Lojalność</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Zarządzanie stałymi klientami</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {demoLoyalty.map((level, i) => (
                <Card key={level.name} className="border-white/5 bg-zinc-900/50 rounded-2xl overflow-hidden relative">
                  <div className={`absolute top-0 left-0 w-1 h-full ${i===0?'bg-amber-700':i===1?'bg-zinc-400':i===2?'bg-yellow-500':'bg-cyan-300'}`} />
                  <CardContent className="p-5 pl-6">
                    <h3 className="font-black text-white text-xl mb-3 flex items-center gap-2">
                      <Crown size={18} className={i===0?'text-amber-700':i===1?'text-zinc-400':i===2?'text-yellow-500':'text-cyan-300'} /> 
                      {level.name}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-zinc-500">Wymagane wydatki:</span><span className="text-white font-bold">{level.min_spent} zł</span></div>
                      <div className="flex justify-between"><span className="text-zinc-500">Stała zniżka:</span><span className="text-orange-500 font-black">{level.discount}%</span></div>
                      <div className="flex justify-between"><span className="text-zinc-500">Klientów w grupie:</span><span className="text-white font-bold">{level.customers}</span></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 'reviews':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-2">
              <h1 className="text-3xl font-bold text-white italic uppercase tracking-tighter">Opinie</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Średnia ocena: 4.8 / 5.0</p>
            </div>
            <div className="grid gap-4">
              {demoReviews.map((review) => (
                <Card key={review.id} className="border-white/5 bg-zinc-900/50 rounded-2xl">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-black text-white">{review.customer}</p>
                        <p className="text-xs text-zinc-500 mt-1">{review.date}</p>
                      </div>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= review.rating ? 'fill-orange-500 text-orange-500' : 'text-zinc-700'} />)}
                      </div>
                    </div>
                    <p className="text-zinc-300 text-sm leading-relaxed mb-4">"{review.comment}"</p>
                    {review.reply ? (
                      <div className="bg-white/5 rounded-xl p-3 border-l-2 border-orange-500 text-sm">
                        <span className="font-bold text-orange-500 block mb-1 text-xs uppercase tracking-widest">Odpowiedź lokalu:</span>
                        <span className="text-zinc-400">{review.reply}</span>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5 rounded-lg text-xs">Odpowiedz klientowi</Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 'stats':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-2">
              <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">Statystyki</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Podsumowanie biznesowe</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Przychód (7 dni)', val: `${demoStats.revenue} zł`, icon: TrendingUp },
                { label: 'Zamówienia', val: demoStats.orders, icon: ShoppingBag },
                { label: 'Śr. Koszyk', val: `${demoStats.avgOrder} zł`, icon: ShoppingCart },
                { label: 'Powracający klienci', val: `${demoStats.returningCustomers}%`, icon: Users },
              ].map((s, i) => (
                <div key={i} className="p-5 rounded-3xl bg-zinc-900/50 border border-white/5 flex flex-col items-center text-center backdrop-blur-md">
                  <s.icon className="text-orange-500 mb-3" size={24} />
                  <span className="text-xl font-black text-white tracking-tighter mb-1">{s.val}</span>
                  <span className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">{s.label}</span>
                </div>
              ))}
            </div>
            <Card className="border-white/5 bg-zinc-900/50 rounded-3xl mt-6">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-white font-black uppercase italic tracking-tight">Bestsellery</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                  {demoStats.topProducts.map((p, i) => (
                    <div key={p.name} className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center font-black text-xs">#{i+1}</span>
                        <span className="text-white font-bold text-sm">{p.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-black text-sm">{p.revenue} zł</p>
                        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">{p.orders} szt.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'settings':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-2">
              <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">Ustawienia</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Zarządzaj lokalem</p>
            </div>
            <Card className="border-white/5 bg-zinc-900/50 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Status Restauracji</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                    <div className="flex items-center gap-3">
                      {isPaused ? <Pause className="text-red-500" size={24}/> : <Play className="text-green-500" size={24}/>}
                      <div>
                        <p className="text-white font-black">{isPaused ? 'Lokal Wstrzymany' : 'Lokal Otwarty'}</p>
                        <p className="text-zinc-500 text-xs">{isPaused ? 'Nie przyjmujesz zamówień' : 'Można zamawiać online'}</p>
                      </div>
                    </div>
                    <Button onClick={() => setIsPaused(!isPaused)} variant="outline" className={`border-white/10 text-white hover:bg-white/5 rounded-xl ${isPaused ? 'border-green-500/50 text-green-500' : 'border-red-500/50 text-red-500'}`}>
                      {isPaused ? 'Wznów sprzedaż' : 'Zatrzymaj'}
                    </Button>
                  </div>
                </CardContent>
            </Card>
            <Card className="border-white/5 bg-zinc-900/50 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Parametry dostaw</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center text-sm"><span className="text-zinc-400">Minimalne zamówienie</span><span className="text-white font-bold">40.00 zł</span></div>
                  <div className="flex justify-between items-center text-sm"><span className="text-zinc-400">Koszt dostawy (bazowy)</span><span className="text-white font-bold">8.00 zł</span></div>
                  <div className="flex justify-between items-center text-sm"><span className="text-zinc-400">Darmowa dostawa od</span><span className="text-white font-bold">120.00 zł</span></div>
                  <Button className="w-full mt-2 bg-white/5 text-white hover:bg-white/10 rounded-xl">Edytuj parametry</Button>
                </CardContent>
            </Card>
          </div>
        )
      
      case 'billing':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-2">
              <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">Rozliczenia</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Zarządzaj subskrypcją</p>
            </div>
            <Card className="border-white/5 bg-zinc-900/50 rounded-3xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-6 opacity-10"><CreditCard size={100} className="text-orange-500"/></div>
                <CardContent className="p-6 relative z-10">
                  <p className="text-zinc-400 text-sm mb-1">Twój aktualny plan to:</p>
                  <h2 className="text-3xl font-black text-white italic tracking-tighter mb-6 uppercase">{isPro ? 'Professional' : 'Starter'}</h2>
                  <div className="space-y-3 mb-6 bg-black/40 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between text-sm"><span className="text-zinc-400">Opłata miesięczna:</span><span className="text-white font-bold">{isPro ? '199.00 zł' : '99.00 zł'}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-zinc-400">Prowizja od zamówień:</span><span className="text-green-500 font-black">0% (Brak)</span></div>
                    <div className="flex justify-between text-sm"><span className="text-zinc-400">Status płatności:</span><Badge className="bg-green-500/20 text-green-500 border-none text-[8px] uppercase">Opłacono</Badge></div>
                  </div>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl">Zarządzaj kartą</Button>
                </CardContent>
            </Card>
          </div>
        )

      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[40vh] opacity-20">
            <Settings className="animate-spin-slow mb-4 text-white" size={40} />
            <p className="font-black text-white uppercase tracking-widest text-[10px]">Wczytywanie sekcji...</p>
          </div>
        )
    }
  }

  // --- STRUKTURA GŁÓWNA STRONY ---
  return (
    <div className="min-h-screen bg-zinc-950 font-sans selection:bg-orange-500 selection:text-white">
      {/* HEADER W STYLU APLIKACJI */}
      <header className="sticky top-0 z-[100] bg-zinc-900/90 border-b border-white/5 backdrop-blur-xl h-16 sm:h-20 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-white hover:bg-white/5 rounded-xl shrink-0">
              <MenuIcon size={24} />
            </Button>
            <div className="flex items-center gap-3 border-l border-white/10 pl-3 lg:border-none lg:pl-0">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-600/20 shrink-0"><UtensilsCrossed size={20}/></div>
              <div className="flex flex-col -space-y-1">
                <span className="font-black text-white uppercase tracking-tighter italic text-sm sm:text-base leading-tight">Pizzeria Demo</span>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/><span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Live System</span></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex bg-black/40 p-1 rounded-full border border-white/5">
              {['starter', 'professional'].map(p => (
                <button key={p} onClick={() => setSelectedPlan(p as any)} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${selectedPlan === p ? 'bg-orange-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>{p}</button>
              ))}
            </div>
            <Link href="/auth/sign-up">
              <Button className="bg-white hover:bg-zinc-200 text-black font-black uppercase text-[10px] tracking-[0.1em] px-4 sm:px-6 h-9 sm:h-10 rounded-xl shadow-xl">Załóż system</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* MOBILNY PASEK ZMIANY PLANU */}
      <div className="md:hidden flex px-4 py-3 gap-2 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md sticky top-16 z-50">
        {['starter', 'professional'].map(p => (
            <button key={p} onClick={() => setSelectedPlan(p as any)} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${selectedPlan === p ? 'bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-900/20' : 'bg-black/40 border-white/5 text-zinc-500'}`}>{p}</button>
        ))}
      </div>

      <div className="flex max-w-7xl mx-auto md:px-6">
        {/* SIDEBAR DESKTOP */}
        <aside className="w-[280px] min-h-[calc(100vh-80px)] border-r border-white/5 sticky top-20 hidden lg:flex flex-col py-8 pr-8">
          <NavContent />
          <div className="mt-auto p-5 rounded-3xl bg-gradient-to-br from-orange-600/10 to-red-600/5 border border-orange-600/20 text-center relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-24 h-24 bg-orange-500/20 blur-2xl rounded-full pointer-events-none" />
             <Sparkles className="mx-auto text-orange-500 mb-2 relative z-10" size={24} />
             <p className="text-[9px] text-zinc-400 font-black uppercase tracking-[0.2em] mb-1 relative z-10">Brak prowizji</p>
             <p className="text-sm font-black text-white italic uppercase tracking-tighter relative z-10">100% zysku dla Ciebie</p>
          </div>
        </aside>

        {/* GŁÓWNY KONTENER TREŚCI */}
        <main className="flex-1 py-6 px-4 sm:px-6 lg:py-10 lg:pl-10 w-full overflow-x-hidden">
          <div className="max-w-4xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* MENU MOBILNE (DRAWER) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] lg:hidden" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed left-0 top-0 bottom-0 w-[300px] sm:w-[340px] bg-zinc-950 z-[200] lg:hidden flex flex-col border-r border-white/5 shadow-2xl p-6" >
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white"><UtensilsCrossed size={20}/></div>
                  <div className="flex flex-col">
                    <span className="font-black text-white italic uppercase tracking-tighter leading-none mb-1">Nawigacja</span>
                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">zamówtu.pl</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-500 hover:text-white rounded-xl bg-white/5"><X/></Button>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <NavContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* BEZPIECZNE STYLE CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .animate-spin-slow { animation: spin-slow 12s linear infinite; }
        `
      }} />
    </div>
  )
}
