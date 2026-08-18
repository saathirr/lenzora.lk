import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { HiShoppingCart, HiX, HiPlus, HiLockClosed } from 'react-icons/hi'
import { useApp } from '../lib/AppContext'
import TiltCard from '../components/ui/TiltCard'
import Reveal from '../components/ui/Reveal'
import AnimatedHeading from '../components/ui/AnimatedHeading'
import CountUp from '../components/ui/CountUp'

export default function Shop() {
  const { products, cart, setCart, user } = useApp()
  const [showCart, setShowCart] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [bump, setBump] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (cart.length === 0) return
    setBump(true)
    const t = setTimeout(() => setBump(false), 350)
    return () => clearTimeout(t)
  }, [cart.length])

  const addToCart = (product) => {
    if (!user) {
      setShowLoginModal(true)
      return
    }
    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id)
      if (existing) {
        return prev.map((c) =>
          c.id === product.id ? { ...c, qty: c.qty + 1 } : c
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
    setShowCart(true)
  }

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((c) => c.id !== id))
  }

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    )
  }

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0)
  const count = cart.reduce((s, c) => s + c.qty, 0)

  return (
    <div className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-6 mb-14">
          <Reveal>
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
              Shop
            </span>
            <AnimatedHeading
              text="Digital Products"
              gradient={['Digital']}
              className="text-4xl sm:text-5xl font-extrabold text-dark tracking-tight"
            />
            <p className="mt-3 text-gray-500">Pre-designed packs and services at your fingertips.</p>
          </Reveal>

          <motion.button
            animate={bump ? { scale: [1, 1.25, 1] } : {}}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowCart(true)}
            className="relative p-3.5 bg-gray-100 rounded-2xl hover:bg-gray-200 transition shrink-0 shadow-sm"
          >
            <HiShoppingCart size={22} />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-gradient-to-r from-primary to-accent2 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Products coming soon.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 perspective-1600">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 34, rotateY: 10 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: (i % 3) * 0.1, type: 'spring', stiffness: 160, damping: 22 }}
                className="h-full"
              >
                <TiltCard max={9} className="h-full">
                  <div className="group relative p-7 h-full rounded-3xl bg-white border border-gray-100 dark:border-[#262626] hover:border-primary/25 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-gradient-to-br from-primary/12 to-accent2/12 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative flex items-start justify-between gap-3 mb-5">
                      <div>
                        <span className="text-[11px] uppercase tracking-[0.2em] text-primary font-bold">Digital Product</span>
                        <h3 className="text-xl font-extrabold text-dark mt-1">{p.name}</h3>
                      </div>
                      <motion.span
                        whileHover={{ rotate: 18 }}
                        className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/15 to-accent2/15 text-primary flex items-center justify-center shrink-0"
                      >
                        <HiPlus size={20} />
                      </motion.span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed min-h-[40px]">
                      {p.description || p.desc || 'Professional digital service'}
                    </p>
                    <div className="relative mt-6 pt-5 border-t border-gray-100 dark:border-[#262626] flex items-center justify-between gap-3">
                      <span className="text-2xl font-extrabold text-primary">
                        <CountUp to={Number(p.price)} prefix="LKR " />
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => addToCart(p)}
                        className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent2 text-white text-sm font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-shadow whitespace-nowrap"
                      >
                        Add to Cart
                      </motion.button>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCart(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 34 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[65] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur">
                <h2 className="text-xl font-bold text-dark">Your Cart</h2>
                <motion.button whileTap={{ scale: 0.88 }} onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <HiX size={20} />
                </motion.button>
              </div>
              <div className="p-6 space-y-3 overflow-y-auto flex-1">
                <AnimatePresence initial={false}>
                  {cart.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-gray-400 pt-12"
                    >
                      <motion.span
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="inline-block text-5xl mb-4"
                      >
                        🛒
                      </motion.span>
                      <p>Your cart is empty.</p>
                      <Link
                        to="/shop"
                        onClick={() => setShowCart(false)}
                        className="inline-block mt-4 px-5 py-2 bg-primary text-white text-sm font-semibold rounded-full"
                      >
                        Browse Shop
                      </Link>
                    </motion.div>
                  ) : (
                    cart.map((c) => (
                      <motion.div
                        key={c.id}
                        layout
                        initial={{ opacity: 0, y: -14, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 30, scale: 0.95 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl gap-3"
                      >
                        <div className="min-w-0">
                          <h4 className="font-semibold text-dark truncate">{c.name}</h4>
                          <p className="text-sm text-gray-500">
                            <AnimatePresence initial={false}>
                              <motion.span key={c.qty} initial={{ scale: 1.3 }} animate={{ scale: 1 }}>
                                Qty: {c.qty}
                              </motion.span>
                            </AnimatePresence>
                            {' '}× LKR {c.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => changeQty(c.id, -1)} className="w-6 h-6 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold">
                              −
                            </button>
                            <button onClick={() => changeQty(c.id, 1)} className="w-6 h-6 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold">
                              +
                            </button>
                          </div>
                          <span className="font-bold text-primary text-sm">LKR {(c.price * c.qty).toLocaleString()}</span>
                          <button onClick={() => removeFromCart(c.id)} className="text-red-500 hover:text-red-700 text-sm px-1">
                            <HiX size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
              {cart.length > 0 && (
                <div className="p-6 border-t border-gray-100 bg-gray-50/60">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-dark">Total</span>
                    <motion.span
                      key={total}
                      initial={{ scale: 1.15, color: '#ea580c' }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-extrabold text-primary"
                    >
                      LKR {total.toLocaleString()}
                    </motion.span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setShowCart(false); navigate('/checkout') }}
                    className="w-full py-3.5 bg-gradient-to-r from-primary to-accent2 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition shadow-md"
                  >
                    Proceed to Checkout
                  </motion.button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoginModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
              onClick={() => setShowLoginModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              className="fixed inset-0 z-[75] flex items-center justify-center p-4"
              onClick={() => setShowLoginModal(false)}
            >
              <div
                className="w-full max-w-md bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-3xl p-8 shadow-2xl text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <HiLockClosed size={28} />
                </div>
                <h3 className="text-2xl font-extrabold text-dark dark:text-white">Login to Shop</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm mt-2">
                  You need an account to add items to your cart and place shop orders. You can still browse freely.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={() => setShowLoginModal(false)}
                    className="w-full py-3 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary-dark transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setShowLoginModal(false)}
                    className="w-full py-3 bg-primary/10 text-primary text-sm font-bold rounded-full hover:bg-primary/20 transition"
                  >
                    Create Account
                  </Link>
                  <button
                    onClick={() => setShowLoginModal(false)}
                    className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-slate-300 transition"
                  >
                    Keep Browsing
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}