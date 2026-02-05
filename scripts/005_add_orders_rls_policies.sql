-- RLS Policies for Orders Table

-- Allow service role to do everything
CREATE POLICY "Service role can do everything on orders" ON public.orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to INSERT new orders (anyone can place an order)
CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT
  WITH CHECK (true);

-- Allow restaurants to view their own orders
CREATE POLICY "Restaurants can view their own orders" ON public.orders
  FOR SELECT
  USING (auth.uid() = restaurant_user_id);

-- Allow restaurant owners to update their own orders
CREATE POLICY "Restaurants can update their own orders" ON public.orders
  FOR UPDATE
  USING (auth.uid() = restaurant_user_id)
  WITH CHECK (auth.uid() = restaurant_user_id);

-- RLS Policies for Order Items
CREATE POLICY "Service role can do everything on order_items" ON public.order_items
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can view order items" ON public.order_items
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert order items" ON public.order_items
  FOR INSERT
  WITH CHECK (true);
