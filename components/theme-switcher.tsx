'use client'

import { Moon, Sun } from 'lucide-react'
import { useThemeContext } from '@/lib/theme-context'

export function ThemeSwitcher() {
  const { theme, toggleTheme, mounted } = useThemeContext()

  if (!mounted) {
    return (
      <button
        className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground"
        disabled
        aria-label="Ładowanie motywu"
      >
        <Moon className="w-4 h-4" />
      </button>
    )
  }

  return (
    <button
      className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Przełącz na jasny motyw' : 'Przełącz na ciemny motyw'}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  )
}
