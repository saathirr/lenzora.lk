import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { useApp } from '../lib/AppContext'
import TiltCard from '../components/ui/TiltCard'
import Reveal from '../components/ui/Reveal'
import AnimatedHeading from '../components/ui/AnimatedHeading'

export default function Gallery() {
  const { portfolio } = useApp()
  const categories = useMemo(() => {
    const set = new Set(portfolio.map((i) => i.category).filter(Boolean))
    return ['All', ...set]
  }, [portfolio])

  const [active, setActive] = useState('All')
  const [selected, setSelected] = useState(null)

  const filtered = active === 'All' ? portfolio : portfolio.filter((i) => i.category === active)

  const close = useCallback(() => setSelected(null), [])
  const step = useCallback(
    (dir) => {
      setSelected((prev) => {
        if (!prev) return prev
        const idx = filtered.findIndex((i) => i.id === prev.id)
        const next = (idx + dir + filtered.length) % filtered.length
        return filtered[next] || null
      })
    },
    [filtered]
  )

  useEffect(() => {
    if (!selected) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, close, step])

  return (
    <div className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Portfolio
          </span>
          <AnimatedHeading
            text="Our Work Gallery"
            gradient={['Gallery']}
            className="text-4xl sm:text-5xl font-extrabold text-dark tracking-tight"
          />
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            A curated selection of projects we love.
          </p>
        </Reveal>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`relative px-5 py-2 rounded-full text-sm font-medium transition ${
                active === c ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {active === c && (
                <motion.span
                  layoutId="gallery-filter-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent2 shadow-lg shadow-primary/25"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{c}</span>
            </button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 perspective-1600">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.86, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.86 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 220, damping: 24 }}
                className="h-full"
              >
                <TiltCard max={12} className="h-full">
                  <motion.button
                    onClick={() => setSelected(item)}
                    whileTap={{ scale: 0.96 }}
                    className="relative group overflow-hidden rounded-2xl aspect-square w-full block"
                  >
                    <div className="w-full h-full animate-ken-burns">
                      <img
                        src={item.image || item.src}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <div className="text-left translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                        <span className="text-white font-semibold text-sm block">{item.title}</span>
                        {item.category && (
                          <span className="text-white/60 text-xs">{item.category}</span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                </TiltCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              key={selected.id}
              initial={{ scale: 0.88, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="w-full aspect-[4/3] sm:aspect-auto">
                <img src={selected.image || selected.src} alt={selected.title} className="w-full h-full object-cover" />
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={close}
                className="absolute top-4 right-4 p-2.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
              >
                <HiX size={20} />
              </motion.button>
              <button
                onClick={(e) => { e.stopPropagation(); step(-1) }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
              >
                <HiChevronLeft size={22} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); step(1) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
              >
                <HiChevronRight size={22} />
              </button>
              <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-lg font-bold">{selected.title}</p>
                <p className="text-white/70 text-sm">{selected.category}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}