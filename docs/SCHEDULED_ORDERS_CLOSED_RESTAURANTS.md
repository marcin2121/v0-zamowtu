Scheduled Orders for Closed Restaurants - Implementation Summary
================================================================

## Problem
Previously, if a restaurant was closed (is_open=false), customers couldn't place ANY orders, even if they wanted to schedule them for a future time when the restaurant would be open.

## Solution
Implemented logic to allow scheduled orders when restaurants are closed by:

### 1. Updated Order Validation (`checkout-form.tsx`)
- When submitting an order, check if it's scheduled or immediate:
  - **Scheduled orders**: Validate that the restaurant is open at the SELECTED date/time
  - **Immediate orders**: Keep existing behavior - check current status
- Extract restaurant opening hours and validate against day of week and time
- Provide helpful error messages indicating when restaurant opens

### 2. Improved UI/UX
- Updated "Restaurant Closed" alert to explain customers can still order for future times
- Enhanced scheduled order section with helpful text:
  - "Select day and time when restaurant must be open"
  - "Enable to order for future times even if currently closed"

### 3. How It Works
**Day of week check:**
- Convert scheduled date to day name (Monday, Tuesday, etc.)
- Lookup opening hours for that specific day

**Time validation:**
- Compare scheduled time against opening_hours[day].open and .close
- Ensure scheduled time falls within opening hours

**Fallback:**
- If opening_hours not configured, falls back to is_open flag for immediate orders

## Database Requirements
- `restaurant_settings.opening_hours` - Should contain day-based hours (e.g., `{ monday: {open: "10:00", close: "22:00"} }`)
- `blocked_dates` table - Existing feature to block specific dates

## Testing
1. Set restaurant as closed (is_open = false)
2. Try to order immediately → Should show error
3. Enable "Zaplanuj zamówienie" (Schedule Order)
4. Select a future date/time when restaurant is open → Should accept order
5. Select a future date/time when restaurant is closed → Should show error with opening hours
