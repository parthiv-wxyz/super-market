export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-3">🛒 SuperMarket</h3>
            <p className="text-sm">Fresh groceries delivered to your doorstep. Quality products at the best prices.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/products" className="hover:text-white transition">Products</a></li>
              <li><a href="/orders" className="hover:text-white transition">My Orders</a></li>
              <li><a href="/profile" className="hover:text-white transition">Profile</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>📞 +1 234 567 890</li>
              <li>📧 support@supermarket.com</li>
              <li>📍 123 Market Street</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm">
          © 2024 SuperMarket. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
