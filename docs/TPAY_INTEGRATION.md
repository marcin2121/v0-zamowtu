# TPay Integration - Instrukcja Testowania

## 1. Ustawienie zmiennych środowiskowych (Sandbox)

Dodaj do sekcji **Vars** w v0 (lub do `.env.local`):

```
TPAY_CLIENT_ID=your_test_client_id
TPAY_CLIENT_SECRET=your_test_client_secret
TPAY_MERCHANT_ID=your_test_merchant_id
TPAY_SANDBOX=true
```

## 2. Pozyskanie testowych danych z TPay

1. Zarejestruj się na https://sandbox.tpay.com
2. Przejdź do **Settings → Integration → API**
3. Skopiuj:
   - **Client ID**
   - **Client Secret**
   - **Merchant ID**

## 3. Testowanie Płatności

### Przepływ:
1. Otwórz zamówienie w statusie "Zaakceptowane" i "Nieopłacone"
2. Kliknij "Dokonaj płatności online"
3. Wybierz **TPay**
4. Kliknij "Zapłać TPay"
5. Zostaniesz przekierowany na bramkę TPay

### Testowe Karty Kredytowe:
- **Numer**: 4111111111111111
- **Ważna do**: 12/25
- **CVV**: 123

## 4. Weryfikacja Integracji

Po pomyślnej płatności:
- Status zamówienia powinien zmienić się na "Opłacone"
- Pole `is_paid` w bazie powinno być `true`
- `payment_method` powinno być `tpay`

## 5. Przywracanie do P24 (jeśli potrzeba)

Usunięcie TPay jest proste - wystarczy nie ustawiać zmiennych `TPAY_*`. System wciąż będzie obsługiwać P24.

## 6. Produktywne Wdrażanie

Gdy będziesz gotowy do produkcji:
1. Zmień `TPAY_SANDBOX=false`
2. Zamiast testowych danych, wprowadź produkcyjne z https://tpay.com
3. Skonfiguruj webhooky w panelu TPay
