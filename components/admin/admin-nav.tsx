'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2, BarChart3, Headset, Shield } from 'lucide-react'

const navItems = [
  { href: '/admin/restaurants', label: 'Restauracje', icon: Building2 },
  { href: '/admin/stats', label: 'Statystyki', icon: BarChart3 },
  { href: '/admin/support', label: 'Pomoc techniczna', icon: Headset },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <div className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link
              href="/admin/restaurants"
              className="flex items-center gap-2 font-bold text-foreground"
            >
              <Shield className="w-5 h-5 text-primary" />
              <span>Admin Panel</span>
            </Link>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}
