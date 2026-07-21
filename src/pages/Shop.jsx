import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { HiShoppingCart, HiX } from 'react-icons/hi'
import { useApp } from '../lib/AppContext'

export default function Shop() {
  const { products, cart, setCart } = useApp()
  const [showCart, setShowCart] = useState(false)
  const navigate = useNavigate()

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id)
      if (existing) {
        return prev.map((c) =>
          c.id === product.id ? { ...c, qty: c.qty + 1 } : c
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((c) => c.id !== id))
  }

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0)

  return (
    <div className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
              Shop
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-dark">Digital Products</h1>
            <p className="mt-2 text-gray-500">Pre-designed packs and services at your fingertips.</p>
          </motion.div>

          <button
            onClick={() => setShowCart(true)}
            className="relative p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition shrink-0"
          >
            <HiShoppingCart size={22} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cart.reduce((s, c) => s + c.qty, 0)}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-primary/20 hover:shadow-xl transition-all"
            >
              <h3 className="text-lg font-bold text-dark">{p.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{p.desc || 'Professional digital service'}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-xl sm:text-2xl font-bold text-primary">LKR {p.price.toLocaleString()}</span>
                <button
                  onClick={() => addToCart(p)}
                  className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition whitespace-nowrap"
                >
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {showCart && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowCart(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-dark">Your Cart</h2>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <HiX size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {cart.length === 0 ? (
                <p className="text-gray-400 text-center py-10">Your cart is empty.</p>
              ) : (
                cart.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl gap-3">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-dark truncate">{c.name}</h4>
                      <p className="text-sm text-gray-500">Qty: {c.qty} x LKR {c.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-primary">LKR {(c.price * c.qty).toLocaleString()}</span>
                      <button onClick={() => removeFromCart(c.id)} className="text-red-500 hover:text-red-700 text-sm">
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-dark">Total</span>
                  <span className="text-2xl font-bold text-primary">LKR {total.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => { setShowCart(false); navigate('/checkout') }}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition shadow-lg"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
