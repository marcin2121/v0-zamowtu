/**
 * Przelewy24 Payment Integration
 * 
 * INSTRUKCJA KONFIGURACJI:
 * 1. Zaloz konto na przelewy24.pl (uzyj linku polecajacego)
 * 2. W panelu P24 przejdz do: Moje dane -> Dane do API
 * 3. Skopiuj dane i uzupelnij zmienne srodowiskowe:
 *    - P24_MERCHANT_ID - ID sprzedawcy
 *    - P24_POS_ID - ID punktu sprzedazy (zazwyczaj to samo co MERCHANT_ID)
 *    - P24_CRC - Klucz CRC do podpisywania transakcji
 *    - P24_API_KEY - Klucz API
 * 
 * 4. W panelu P24 ustaw URL powrotny: https://twojadomena.pl/api/payments/p24/callback
 * 5. W panelu P24 ustaw URL statusu: https://twojadomena.pl/api/payments/p24/status
 */

import crypto from 'crypto'

// Konfiguracja - uzupelnij w zmiennych srodowiskowych
const P24_MERCHANT_ID = process.env.P24_MERCHANT_ID || ''
const P24_POS_ID = process.env.P24_POS_ID || P24_MERCHANT_ID
const P24_CRC = process.env.P24_CRC || ''
const P24_API_KEY = process.env.P24_API_KEY || ''

// Sandbox dla testow, produkcja dla prawdziwych platnosci
const P24_SANDBOX = process.env.P24_SANDBOX === 'true'
const P24_BASE_URL = P24_SANDBOX 
  ? 'https://sandbox.przelewy24.pl' 
  : 'https://secure.przelewy24.pl'

interface P24TransactionParams {
  sessionId: string
  amount: number // w groszach (100 = 1 PLN)
  currency: string
  description: string
  email: string
  country: string
  language: string
  urlReturn: string
  urlStatus: string
  orderId?: string
}

interface P24VerifyParams {
  sessionId: string
  amount: number
  currency: string
  orderId: number
}

/**
 * Generuje podpis CRC dla transakcji
 */
function generateSign(data: Record<string, string | number>): string {
  const jsonString = JSON.stringify(data)
  return crypto.createHash('sha384').update(jsonString).digest('hex')
}

/**
 * Tworzy nowa transakcje w Przelewy24
 */
export async function createTransaction(params: P24TransactionParams): Promise<{ token: string; redirectUrl: string }> {
  const signData = {
    sessionId: params.sessionId,
    merchantId: Number.parseInt(P24_MERCHANT_ID),
    amount: params.amount,
    currency: params.currency,
    crc: P24_CRC,
  }

  const sign = generateSign(signData)

  const requestBody = {
    merchantId: Number.parseInt(P24_MERCHANT_ID),
    posId: Number.parseInt(P24_POS_ID),
    sessionId: params.sessionId,
    amount: params.amount,
    currency: params.currency,
    description: params.description,
    email: params.email,
    country: params.country,
    language: params.language,
    urlReturn: params.urlReturn,
    urlStatus: params.urlStatus,
    sign,
  }

  const response = await fetch(`${P24_BASE_URL}/api/v1/transaction/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${P24_POS_ID}:${P24_API_KEY}`).toString('base64')}`,
    },
    body: JSON.stringify(requestBody),
  })

  const data = await response.json()

  if (data.error) {
    throw new Error(`P24 Error: ${data.error}`)
  }

  return {
    token: data.data.token,
    redirectUrl: `${P24_BASE_URL}/trnRequest/${data.data.token}`,
  }
}

/**
 * Weryfikuje transakcje po zakonczeniu platnosci
 */
export async function verifyTransaction(params: P24VerifyParams): Promise<boolean> {
  const signData = {
    sessionId: params.sessionId,
    orderId: params.orderId,
    amount: params.amount,
    currency: params.currency,
    crc: P24_CRC,
  }

  const sign = generateSign(signData)

  const requestBody = {
    merchantId: Number.parseInt(P24_MERCHANT_ID),
    posId: Number.parseInt(P24_POS_ID),
    sessionId: params.sessionId,
    amount: params.amount,
    currency: params.currency,
    orderId: params.orderId,
    sign,
  }

  const response = await fetch(`${P24_BASE_URL}/api/v1/transaction/verify`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${P24_POS_ID}:${P24_API_KEY}`).toString('base64')}`,
    },
    body: JSON.stringify(requestBody),
  })

  const data = await response.json()

  return data.data?.status === 'success'
}

/**
 * Sprawdza czy integracja P24 jest skonfigurowana
 */
export function isP24Configured(): boolean {
  return Boolean(P24_MERCHANT_ID && P24_CRC && P24_API_KEY)
}

/**
 * Pobiera URL testowy/produkcyjny
 */
export function getP24Mode(): 'sandbox' | 'production' {
  return P24_SANDBOX ? 'sandbox' : 'production'
}
