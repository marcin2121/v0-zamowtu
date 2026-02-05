'use server'

import { createClient } from '@/lib/supabase/server'

export async function getBlockedDates(userId: string, fromDate: string) {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('blocked_dates')
      .select('*')
      .eq('user_id', userId)
      .gte('date', fromDate)
      .order('date', { ascending: true })

    if (error) {
      console.log('[v0] Blocked dates table query error:', error.message)
      return []
    }
    return data || []
  } catch (err) {
    console.log('[v0] Error fetching blocked dates:', err)
    return []
  }
}

export async function addBlockedDate(userId: string, date: string, reason?: string) {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .from('blocked_dates')
      .insert({
        user_id: userId,
        date,
        reason: reason || null,
      })

    if (error) {
      console.log('[v0] Error inserting blocked date:', error.message)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    console.log('[v0] Error in addBlockedDate:', err)
    return { success: false, error: 'Failed to add blocked date' }
  }
}

export async function removeBlockedDate(id: string) {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .from('blocked_dates')
      .delete()
      .eq('id', id)

    if (error) {
      console.log('[v0] Error deleting blocked date:', error.message)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    console.log('[v0] Error in removeBlockedDate:', err)
    return { success: false, error: 'Failed to remove blocked date' }
  }
}
