import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    // Walidacja
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Wszystkie pola są wymagane' },
        { status: 400 }
      )
    }

    // Sprawdzenie e-maila
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Nieprawidłowy adres e-mail' },
        { status: 400 }
      )
    }

    console.log('[v0] Wysyłanie e-maila przez Formspree...')
    console.log('[v0] Dane:', { name, email, subject, message })

    // Wysyłanie przez Formspree
    const formspreeResponse = await fetch('https://formspree.io/f/mkgwawvn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        subject,
        message,
        _replyto: email,
      })
    })

    console.log('[v0] Formspree odpowiedź status:', formspreeResponse.status)

    if (!formspreeResponse.ok) {
      const errorData = await formspreeResponse.text()
      console.error('[v0] Błąd Formspree:', errorData)
      return NextResponse.json(
        { error: 'Nie udało się wysłać wiadomości' },
        { status: 500 }
      )
    }

    const result = await formspreeResponse.json()
    console.log('[v0] Formspree wynik:', result)

    return NextResponse.json(
      { success: true, message: 'Wiadomość została wysłana' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Błąd wysyłania e-maila:', error)
    const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd'
    return NextResponse.json(
      { error: `Nie udało się wysłać wiadomości: ${errorMessage}` },
      { status: 500 }
    )
  }
}
