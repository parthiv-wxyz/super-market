-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  full_name TEXT,
  address TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  in_stock BOOLEAN DEFAULT true,
  unit TEXT DEFAULT 'piece',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'placed' CHECK (status IN ('placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_phone TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update own profile, admins can read all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Categories: everyone can read
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Products: everyone can read
CREATE POLICY "Anyone can view products" ON products FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Orders: users can read own orders, admins can read all
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Order items: users can read own order items, admins can read all
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can create order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone)
  VALUES (NEW.id, NEW.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed data: Categories
INSERT INTO categories (name, image_url) VALUES
  ('Fruits & Vegetables', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300'),
  ('Dairy & Eggs', 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300'),
  ('Bakery', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300'),
  ('Beverages', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300'),
  ('Snacks', 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=300'),
  ('Meat & Seafood', 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300'),
  ('Pantry Staples', 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=300'),
  ('Frozen Foods', 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=300');

-- Seed data: Products
INSERT INTO products (name, description, price, category_id, in_stock, unit, image_url) VALUES
  ('Fresh Apples', 'Crisp and juicy red apples', 3.99, (SELECT id FROM categories WHERE name='Fruits & Vegetables'), true, 'kg', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300'),
  ('Bananas', 'Ripe yellow bananas', 1.49, (SELECT id FROM categories WHERE name='Fruits & Vegetables'), true, 'dozen', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300'),
  ('Tomatoes', 'Fresh vine-ripened tomatoes', 2.99, (SELECT id FROM categories WHERE name='Fruits & Vegetables'), true, 'kg', 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=300'),
  ('Spinach', 'Organic baby spinach', 3.49, (SELECT id FROM categories WHERE name='Fruits & Vegetables'), false, 'bunch', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300'),
  ('Whole Milk', 'Farm fresh whole milk', 4.29, (SELECT id FROM categories WHERE name='Dairy & Eggs'), true, 'liter', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300'),
  ('Free Range Eggs', 'Pack of 12 free range eggs', 5.99, (SELECT id FROM categories WHERE name='Dairy & Eggs'), true, 'dozen', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300'),
  ('Cheddar Cheese', 'Aged cheddar cheese block', 6.49, (SELECT id FROM categories WHERE name='Dairy & Eggs'), true, '250g', 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=300'),
  ('Greek Yogurt', 'Creamy plain Greek yogurt', 3.79, (SELECT id FROM categories WHERE name='Dairy & Eggs'), false, '500g', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300'),
  ('Sourdough Bread', 'Freshly baked sourdough loaf', 4.99, (SELECT id FROM categories WHERE name='Bakery'), true, 'loaf', 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=300'),
  ('Croissants', 'Buttery French croissants', 3.99, (SELECT id FROM categories WHERE name='Bakery'), true, '4 pack', 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=300'),
  ('Chocolate Muffins', 'Rich chocolate chip muffins', 5.49, (SELECT id FROM categories WHERE name='Bakery'), true, '4 pack', 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=300'),
  ('Orange Juice', '100% pure orange juice', 4.99, (SELECT id FROM categories WHERE name='Beverages'), true, 'liter', 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300'),
  ('Green Tea', 'Japanese green tea bags', 3.49, (SELECT id FROM categories WHERE name='Beverages'), true, '20 bags', 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=300'),
  ('Cola', 'Classic cola soft drink', 1.99, (SELECT id FROM categories WHERE name='Beverages'), false, '500ml', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300'),
  ('Potato Chips', 'Classic salted potato chips', 2.99, (SELECT id FROM categories WHERE name='Snacks'), true, '200g', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300'),
  ('Mixed Nuts', 'Premium roasted mixed nuts', 7.99, (SELECT id FROM categories WHERE name='Snacks'), true, '300g', 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=300'),
  ('Chicken Breast', 'Fresh boneless chicken breast', 9.99, (SELECT id FROM categories WHERE name='Meat & Seafood'), true, 'kg', 'https://images.unsplash.com/photo-1604503468506-a8da13d82571?w=300'),
  ('Salmon Fillet', 'Fresh Atlantic salmon fillet', 14.99, (SELECT id FROM categories WHERE name='Meat & Seafood'), true, 'kg', 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=300'),
  ('Basmati Rice', 'Premium aged basmati rice', 8.99, (SELECT id FROM categories WHERE name='Pantry Staples'), true, '5kg', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300'),
  ('Olive Oil', 'Extra virgin olive oil', 11.99, (SELECT id FROM categories WHERE name='Pantry Staples'), true, '750ml', 'https://images.unsplash.com/photo-1474979266404-7eaacdc948b6?w=300'),
  ('Frozen Pizza', 'Margherita frozen pizza', 6.99, (SELECT id FROM categories WHERE name='Frozen Foods'), true, 'each', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300'),
  ('Ice Cream', 'Vanilla bean ice cream', 5.99, (SELECT id FROM categories WHERE name='Frozen Foods'), false, '500ml', 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=300');
