'use client'

// Utility for playing notification sounds for new orders
export class OrderNotificationSound {
  private audioContext: AudioContext | null = null
  private isEnabled = true

  constructor() {
    if (typeof window !== 'undefined') {
      // Initialize audio context on user interaction
      this.initAudioContext()
    }
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (e) {
      console.error('[v0] Failed to initialize audio context:', e)
    }
  }

  // Play notification sound using Web Audio API
  playNewOrderSound() {
    if (!this.isEnabled || !this.audioContext) return

    try {
      const context = this.audioContext
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(context.destination)

      // Create a pleasant notification sound
      oscillator.frequency.setValueAtTime(800, context.currentTime)
      oscillator.frequency.setValueAtTime(600, context.currentTime + 0.1)
      oscillator.frequency.setValueAtTime(800, context.currentTime + 0.2)

      gainNode.gain.setValueAtTime(0.3, context.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3)

      oscillator.start(context.currentTime)
      oscillator.stop(context.currentTime + 0.3)
    } catch (e) {
      console.error('[v0] Failed to play notification sound:', e)
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  isAudioEnabled() {
    return this.isEnabled
  }
}

export const notificationSound = new OrderNotificationSound()
