import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Wysłanie e-maila do support
    const supportEmailResponse = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'support@rltpolska.pl',
      subject: `ZamówTu - Nowa wiadomość: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Nowa wiadomość z formularza kontaktowego</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Imię i nazwisko:</strong> ${escapeHtml(name)}</p>
            <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
            <p><strong>Temat:</strong> ${escapeHtml(subject)}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p><strong>Wiadomość:</strong></p>
            <p style="white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(message)}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Ta wiadomość została wysłana z formularza kontaktowego na stronie ZamówTu
          </p>
        </div>
      `,
      replyTo: email,
    })

    if (supportEmailResponse.error) {
      console.error('[v0] Błąd wysyłania e-maila do support:', supportEmailResponse.error)
      return NextResponse.json(
        { error: 'Nie udało się wysłać wiadomości. Spróbuj ponownie.' },
        { status: 500 }
      )
    }

    // Wysłanie potwierdzenia do użytkownika
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'ZamówTu - Potwierdzenie otrzymania wiadomości',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Dziękujemy za wiadomość!</h2>
          <p>Cześć ${escapeHtml(name)},</p>
          <p>Potwierdzamy, że otrzymaliśmy Twoją wiadomość o temacie: <strong>"${escapeHtml(subject)}"</strong></p>
          <p>Nasz zespół skontaktuje się z Tobą wkrótce.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            Jeśli nie wysłałeś tej wiadomości, zignoruj ten e-mail.
          </p>
        </div>
      `,
    })

    return NextResponse.json(
      { success: true, message: 'Wiadomość została wysłana' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Błąd wysyłania e-maila:', error)
    return NextResponse.json(
      { error: 'Nie udało się wysłać wiadomości. Spróbuj ponownie.' },
      { status: 500 }
    )
  }
}

// Funkcja do escapowania HTML
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}
