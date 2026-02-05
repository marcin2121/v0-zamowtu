-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Restaurants can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Restaurants can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;

-- RLS Policies for Orders Table

-- Allow authenticated users to INSERT new orders (anyone can place an order)
CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT
  WITH CHECK (true);

-- Allow restaurants to view their own orders
CREATE POLICY "Restaurants can view their own orders" ON public.orders
  FOR SELECT
  USING (auth.uid() = restaurant_user_id OR auth.uid() IS NULL);

-- Allow restaurant owners to update their own orders
CREATE POLICY "Restaurants can update their own orders" ON public.orders
  FOR UPDATE
  USING (auth.uid() = restaurant_user_id)
  WITH CHECK (auth.uid() = restaurant_user_id);

-- RLS Policies for Order Items

-- Anyone can insert order items (for new orders)
CREATE POLICY "Anyone can insert order items" ON public.order_items
  FOR INSERT
  WITH CHECK (true);

-- Allow viewing order items 
CREATE POLICY "Anyone can view order items" ON public.order_items
  FOR SELECT
  USING (true);
