/**
 * Tpay Payment Integration
 * 
 * INSTRUKCJA KONFIGURACJI:
 * 1. Załóż konto na tpay.com
 * 2. W panelu Tpay przejdź do: Ustawienia -> Integracja -> API
 * 3. Skopiuj dane i uzupełnij zmienne środowiskowe:
 *    - TPAY_CLIENT_ID - ID klienta
 *    - TPAY_CLIENT_SECRET - Secret klucz
 *    - TPAY_MERCHANT_ID - ID sprzedawcy
 * 
 * 4. W panelu Tpay ustaw URL powrotny: https://twojadomena.pl/api/payments/tpay/callback
 * 5. W panelu Tpay ustaw URL statusu: https://twojadomena.pl/api/payments/tpay/status
 */

// Konfiguracja - uzupełnij w zmiennych środowiskowych
const TPAY_CLIENT_ID = process.env.TPAY_CLIENT_ID || ''
const TPAY_CLIENT_SECRET = process.env.TPAY_CLIENT_SECRET || ''
const TPAY_MERCHANT_ID = process.env.TPAY_MERCHANT_ID || ''

// Sandbox dla testów, produkcja dla prawdziwych płatności
const TPAY_SANDBOX = process.env.TPAY_SANDBOX === 'true'
const TPAY_BASE_URL = TPAY_SANDBOX 
  ? 'https://sandbox.tpay.com' 
  : 'https://api.tpay.com'

interface TpayTransactionParams {
  orderId: string
  amount: number // w groszach (100 = 1 PLN)
  currency: string
  description: string
  email: string
  phone?: string
  urlReturn: string
  urlStatus: string
}

interface TpayTransactionResponse {
  transactionId: string
  redirectUrl: string
  token: string
}

interface TpayVerifyParams {
  transactionId: string
  amount: number
  orderId: string
}

/**
 * Pobiera token dostępu do API Tpay
 */
async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${TPAY_CLIENT_ID}:${TPAY_CLIENT_SECRET}`).toString('base64')
  
  const response = await fetch(`${TPAY_BASE_URL}/oauth/auth/login`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  })

  const data = await response.json()
  
  if (!data.access_token) {
    throw new Error(`Tpay Auth Error: ${data.error || 'Unknown error'}`)
  }

  return data.access_token
}

/**
 * Tworzy nową transakcję w Tpay
 */
export async function createTransaction(params: TpayTransactionParams): Promise<TpayTransactionResponse> {
  const accessToken = await getAccessToken()

  const requestBody = {
    merchantId: TPAY_MERCHANT_ID,
    transactionId: params.orderId,
    amount: params.amount,
    currency: params.currency,
    description: params.description,
    email: params.email,
    phone: params.phone,
    callbackUrl: params.urlStatus,
    returnUrl: params.urlReturn,
    successUrl: params.urlReturn,
    successMethod: 'POST',
  }

  const response = await fetch(`${TPAY_BASE_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(requestBody),
  })

  const data = await response.json()

  if (data.error || !data.transactionId) {
    throw new Error(`Tpay Error: ${data.error || 'Failed to create transaction'}`)
  }

  return {
    transactionId: data.transactionId,
    token: data.token,
    redirectUrl: `${TPAY_BASE_URL}/transactions/pay/${data.token}`,
  }
}

/**
 * Weryfikuje transakcję po zakończeniu płatności
 */
export async function verifyTransaction(params: TpayVerifyParams): Promise<boolean> {
  const accessToken = await getAccessToken()

  const response = await fetch(`${TPAY_BASE_URL}/transactions/${params.transactionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  const data = await response.json()

  return data.status === 'COMPLETED' || data.status === 'VERIFIED'
}

/**
 * Sprawdza czy integracja Tpay jest skonfigurowana
 */
export function isTpayConfigured(): boolean {
  return Boolean(TPAY_CLIENT_ID && TPAY_CLIENT_SECRET && TPAY_MERCHANT_ID)
}

/**
 * Pobiera URL testowy/produkcyjny
 */
export function getTpayMode(): 'sandbox' | 'production' {
  return TPAY_SANDBOX ? 'sandbox' : 'production'
}
