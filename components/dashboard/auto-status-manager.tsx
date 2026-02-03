'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AutoStatusManagerProps {
  userId: string
  openingHours: Record<string, { open: string; close: string }>
}

export function AutoStatusManager({ userId, openingHours }: AutoStatusManagerProps) {
  useEffect(() => {
    const checkAndUpdateStatus = async () => {
      const now = new Date()
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      const currentDay = dayNames[now.getDay()]
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      
      const todayHours = openingHours[currentDay]
      
      // Determine if restaurant should be open based on schedule
      let shouldBeOpen = false
      if (todayHours && typeof todayHours === 'object') {
        // Check if restaurant is set to open for today
        const isOpenToday = (todayHours as any).isOpen !== false
        const openTime = todayHours.open || (todayHours as any).openTime
        const closeTime = todayHours.close || (todayHours as any).closeTime
        
        if (isOpenToday && openTime && closeTime) {
          // Handle overnight hours (e.g., 22:00 - 02:00)
          if (closeTime < openTime) {
            shouldBeOpen = currentTime >= openTime || currentTime < closeTime
          } else {
            shouldBeOpen = currentTime >= openTime && currentTime < closeTime
          }
        }
      }
      
      console.log('[v0] Auto status check:', {
        currentDay,
        currentTime,
        todayHours,
        shouldBeOpen
      })
      
      // Update restaurant status if needed
      const supabase = createClient()
      const { data: settings } = await supabase
        .from('restaurant_settings')
        .select('is_open')
        .eq('user_id', userId)
        .single()
      
      if (settings && settings.is_open !== shouldBeOpen) {
        console.log('[v0] Updating restaurant status to:', shouldBeOpen)
        await supabase
          .from('restaurant_settings')
          .update({ is_open: shouldBeOpen })
          .eq('user_id', userId)
      }
    }
    
    // Check immediately on mount
    checkAndUpdateStatus()
    
    // Check every minute
    const interval = setInterval(checkAndUpdateStatus, 60000)
    
    return () => clearInterval(interval)
  }, [userId, openingHours])
  
  // This component doesn't render anything
  return null
}
