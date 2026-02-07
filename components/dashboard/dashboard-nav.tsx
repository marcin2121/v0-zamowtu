'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Settings,
  History,
  BarChart3,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Copy,
  Check,
  Tag,
  Crown,
  Star,
  CreditCard,
  Palette,
  Calendar,
  Lightbulb,
  Shield,
  Headset
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/client'
import { canAccessFeature } from '@/lib/subscription-features'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { baseUrl } from '@/lib/config'
import type { User } from '@supabase/supabase-js'
import type { RestaurantSettings } from '@/lib/types'

interface DashboardNavProps {
  user: User | null
  settings: RestaurantSettings | null
}

const navItems = [
  { href: '/dashboard', label: 'Zamówienia', icon: ShoppingBag, feature: 'menu' },
  { href: '/dashboard/scheduled', label: 'Zaplanowane', icon: Calendar, feature: 'menu' },
  { href: '/dashboard/menu', label: 'Menu', icon: UtensilsCrossed, feature: 'menu' },
  { href: '/dashboard/suggestions', label: 'Sugestie', icon: Lightbulb, feature: 'statistics' },
  { href: '/dashboard/customize', label: 'Personalizacja', icon: Palette, feature: 'pro' },
  { href: '/dashboard/discounts', label: 'Kody rabatowe', icon: Tag, feature: 'discount_codes' },
  { href: '/dashboard/loyalty', label: 'Lojalność', icon: Crown, feature: 'loyalty_program' },
  { href: '/dashboard/reviews', label: 'Opinie', icon: Star, feature: 'reviews' },
  { href: '/dashboard/history', label: 'Historia', icon: History, feature: 'menu' },
  { href: '/dashboard/stats', label: 'Statystyki', icon: BarChart3, feature: 'statistics' },
  { href: '/dashboard/support', label: 'Pomoc', icon: Headset, feature: 'menu' },
  { href: '/dashboard/settings', label: 'Ustawienia', icon: Settings, feature: 'menu' },
  { href: '/dashboard/billing', label: 'Rozliczenia', icon: CreditCard, feature: 'menu' },
] as const

export function DashboardNav({ user, settings }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const menuLink = settings?.slug 
    ? `${baseUrl}/${settings.slug}`
    : null

  const copyLink = async () => {
    await navigator.clipboard.writeText(menuLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Image 
            src="/logo.png" 
            alt="Logo" 
            width={40} 
            height={40}
            className="w-10 h-10 rounded-lg"
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground truncate">
              {settings?.restaurant_name || 'Moja Restauracja'}
            </h2>
            <Badge variant={settings?.is_open ? 'default' : 'secondary'} className={`text-xs ${settings?.is_open ? 'bg-accent text-accent-foreground' : ''}`}>
              {settings?.is_open ? 'Otwarte' : 'Zamknięte'}
            </Badge>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {/* Admin link - only show if user is admin */}
        {user?.email === 'kontakt@zamowtu.pl' && (
          <Link
            href="/admin/restaurants"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-3 border border-primary/30 ${
              pathname === '/admin/restaurants'
                ? 'bg-primary text-primary-foreground'
                : 'text-primary hover:bg-primary/10'
            }`}
          >
            <Shield className="w-5 h-5" />
            Panel Admina
          </Link>
        )}

        {navItems.map((item) => {
          const isActive = pathname === item.href
          const hasAccess = canAccessFeature(settings, item.feature)
          
          if (!hasAccess) return null
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border dark:border-slate-800 space-y-3">
        {/* Plan info */}
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg dark:bg-primary/5 dark:border-primary/10">
          <p className="text-xs text-muted-foreground mb-1">Aktualny plan:</p>
          <p className="font-semibold text-foreground mb-2">
            {settings?.subscription_plan === 'professional' ? 'Pro (199 zl/mies.)' : 'Starter (99 zl/mies.)'}
          </p>
          {settings?.subscription_plan === 'starter' && (
            <Button 
              asChild
              size="sm"
              className="w-full text-xs"
            >
              <Link href="/dashboard/billing">
                Upgrade do Pro
              </Link>
            </Button>
          )}
        </div>

        {menuLink ? (
          <div className="p-3 bg-muted rounded-lg dark:bg-slate-800">
            <p className="text-xs text-muted-foreground mb-2">Link do menu dla klientow:</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs bg-transparent"
                onClick={copyLink}
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Skopiowano
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Kopiuj link
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a href={menuLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-muted rounded-lg dark:bg-slate-800">
            <p className="text-xs text-muted-foreground">
              Ustaw adres URL w Ustawieniach, aby udostepnic menu klientom
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground truncate">
            {user?.email || 'Konto'}
          </span>
          <div className="flex items-center gap-1">
            <ThemeSwitcher />
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Wyloguj się">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-card border-r border-border dark:bg-slate-900 dark:border-slate-800">
        <NavContent />
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between p-4 bg-card border-b border-border dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold">{settings?.restaurant_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <NavContent />
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  )
}
