export interface Profile {
  id: string
  phone: string
  full_name: string | null
  address: string | null
  role: 'customer' | 'admin'
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  image_url: string | null
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category_id: string
  in_stock: boolean
  unit: string
  created_at: string
  updated_at: string
  category?: Category
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  user_id: string
  status: 'placed' | 'confirmed' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled'
  total_amount: number
  delivery_address: string
  delivery_phone: string
  notes: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
  profile?: Profile
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  created_at: string
  product?: Product
}
