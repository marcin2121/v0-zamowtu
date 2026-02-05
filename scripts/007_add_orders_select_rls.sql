-- Add SELECT policies for orders and order_items
-- This allows anyone to view orders by ID (needed for order status page)

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.orders;

-- Allow anyone to view orders by ID (for order confirmation page)
-- In production, you might want to add additional security like email verification
CREATE POLICY "Anyone can view orders by ID" ON public.orders
  FOR SELECT
  USING (true);

-- Update order_items SELECT policy to be less restrictive
DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;

CREATE POLICY "Anyone can view order items by order_id" ON public.order_items
  FOR SELECT
  USING (true);

-- Allow restaurants to view and update their orders (existing functionality)
-- This policy already exists from previous migration, so we keep it
