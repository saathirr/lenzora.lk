import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'
import { HiTemplate, HiShoppingCart } from 'react-icons/hi'
import { useApp } from '../lib/AppContext'

export default function FramesPage() {
  const { frames, settings } = useApp()
  const whatsapp = settings.whatsapp || '94717336756'

  const visibleFrames = useMemo(
    () => frames.filter((f) => f.active !== false && f.frame_size),
    [frames]
  )

  const categories = useMemo(() => {
    const set = new Set(visibleFrames.map((f) => f.category).filter(Boolean))
    return ['All', ...set]
  }, [visibleFrames])

  const [active, setActive] = useState('All')

  const filtered = active === 'All' ? visibleFrames : visibleFrames.filter((f) => f.category === active)

  const orderLink = (f) =>
    `https://wa.me/${whatsapp}?text=${encodeURIComponent(
      `Hello Lenzora! I would like to order a frame.\n\nSize: ${f.frame_size}\nPrice: LKR ${Number(f.price).toLocaleString()}${f.category ? `\nCategory: ${f.category}` : ''}`
    )}`

  return (
    <div className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            <HiTemplate size={14} />
            Frames
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-dark">
            Frame <span className="text-primary">Collection</span>
          </h1>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Choose your perfect frame size — order instantly on WhatsApp.
          </p>
        </motion.div>

        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                  active === c
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#17171d] border border-gray-100 dark:border-[#2b2b35] rounded-2xl shadow-sm">
            <HiTemplate size={40} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
            <p className="text-gray-500 dark:text-slate-400">No frames available right now. Check back soon!</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((f, i) => (
                <motion.div
                  layout
                  key={f.id}
                  initial={{ opacity: 0, y: 22, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 240, damping: 24 }}
                  whileHover={{ y: -6 }}
                  className="group bg-white dark:bg-[#17171d] border border-gray-100 dark:border-[#2b2b35] rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300"
                >
                  <div className="aspect-[4/3] bg-gray-100 dark:bg-white/5 overflow-hidden relative">
                    {f.image_url ? (
                      <img
                        src={f.image_url}
                        alt={f.frame_size}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-slate-600">
                        <HiTemplate size={48} />
                      </div>
                    )}
                    {f.category && (
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/55 text-white text-xs font-semibold backdrop-blur-sm">
                        {f.category}
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold text-dark">{f.frame_size}</h3>
                      <span className="text-xl font-extrabold text-primary">
                        LKR {Number(f.price).toLocaleString()}
                      </span>
                    </div>
                    {f.description && (
                      <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-2 mb-4">{f.description}</p>
                    )}
                    <a
                      href={orderLink(f)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold rounded-xl hover:from-green-600 hover:to-green-700 shadow-md shadow-green-500/25 transition"
                    >
                      <FaWhatsapp size={16} />
                      Order on WhatsApp
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-14 text-center p-8 bg-gradient-to-br from-primary/10 to-accent2/10 border border-primary/20 rounded-3xl"
        >
          <HiShoppingCart size={28} className="mx-auto text-primary mb-3" />
          <h2 className="text-xl font-bold text-dark">Need a custom size?</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 mb-4">
            Tell us your dimensions and we'll make it for you.
          </p>
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hello! I would like to order a custom frame.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary-dark transition shadow-lg shadow-primary/25"
          >
            <FaWhatsapp size={16} />
            Request Custom Frame
          </a>
        </motion.div>
      </div>
    </div>
  )
}