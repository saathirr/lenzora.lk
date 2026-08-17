import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'
import { HiTemplate, HiSearch, HiAdjustments, HiPhotograph, HiCursorClick, HiCheckCircle } from 'react-icons/hi'
import { useApp } from '../lib/AppContext'
import TiltCard from '../components/ui/TiltCard'
import FloatingOrbs from '../components/ui/FloatingOrbs'
import AnimatedHeading from '../components/ui/AnimatedHeading'
import MagneticButton from '../components/ui/MagneticButton'

const sorts = [
  { key: 'newest', label: 'Newest' },
  { key: 'price-asc', label: 'Price: Low → High' },
  { key: 'price-desc', label: 'Price: High → Low' },
  { key: 'size', label: 'Size: A → Z' },
]

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
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')

  const filtered = useMemo(() => {
    let list = active === 'All' ? visibleFrames : visibleFrames.filter((f) => f.category === active)

    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((f) =>
        [f.frame_size, f.category, f.description]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      )
    }

    switch (sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => Number(a.price) - Number(b.price))
        break
      case 'price-desc':
        list = [...list].sort((a, b) => Number(b.price) - Number(a.price))
        break
      case 'size':
        list = [...list].sort((a, b) => String(a.frame_size).localeCompare(String(b.frame_size)))
        break
      default:
        list = [...list]
    }
    return list
  }, [visibleFrames, active, query, sort])

  const orderLink = (f) =>
    `https://wa.me/${whatsapp}?text=${encodeURIComponent(
      `Hello Lenzora! I would like to order a frame.\n\nSize: ${f.frame_size}\nPrice: LKR ${Number(f.price).toLocaleString()}${f.category ? `\nCategory: ${f.category}` : ''}${f.description ? `\nDesign: ${f.description}` : ''}`
    )}`

  const steps = [
    { icon: HiPhotograph, title: 'Pick Your Frame', desc: 'Browse sizes, designs & prices.' },
    { icon: HiCursorClick, title: 'Order on WhatsApp', desc: 'One tap opens chat with details pre-filled.' },
    { icon: HiCheckCircle, title: 'Confirmed & Delivered', desc: 'We confirm your order and get it to you.' },
  ]

  return (
    <div className="relative py-20 sm:py-28 overflow-hidden">
      <FloatingOrbs count={2} intensity={0.3} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4 glass">
            <HiTemplate size={14} />
            Frames
          </span>
          <AnimatedHeading
            text="Frame Collection"
            gradient={['Frame']}
            className="text-4xl sm:text-5xl font-extrabold text-dark tracking-tight"
          />
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Choose your perfect frame size & design — order instantly on WhatsApp.{' '}
            <span className="font-semibold text-primary">
              {visibleFrames.length} {visibleFrames.length === 1 ? 'size' : 'sizes'} available
            </span>
          </p>
        </motion.div>

        {/* Sticky filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="sticky top-20 z-30 mb-12 glass rounded-2xl shadow-lg shadow-black/5 p-4"
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sizes, designs, categories..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#33333e] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-white/70 dark:bg-white/5 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActive(c)}
                  className={`relative shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                    active === c ? 'text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-400 hover:bg-gray-200'
                  }`}
                >
                  {active === c && (
                    <motion.span
                      layoutId="frame-filter-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent2 shadow-md shadow-primary/25"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{c}</span>
                </button>
              ))}
            </div>
            <div className="relative shrink-0">
              <HiAdjustments className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#33333e] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-white/70 dark:bg-white/5 dark:text-white text-sm cursor-pointer appearance-none min-w-[170px]"
              >
                {sorts.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#17171d] border border-gray-100 dark:border-[#2b2b35] rounded-2xl shadow-sm">
            <HiTemplate size={40} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
            <p className="text-gray-500 dark:text-slate-400">
              {frames.length === 0
                ? 'No frames available right now. Check back soon!'
                : 'No frames match your search. Try a different filter.'}
            </p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 perspective-1600">
            <AnimatePresence mode="popLayout">
              {filtered.map((f, i) => (
                <motion.div
                  layout
                  key={f.id}
                  initial={{ opacity: 0, y: 26, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 26, delay: i * 0.04 }}
                  className="h-full"
                >
                  <TiltCard max={9} className="h-full">
                    <div className="group relative h-full bg-white dark:bg-[#17171d] border border-gray-100 dark:border-[#2b2b35] rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300">
                      <div className="aspect-[4/3] bg-gray-100 dark:bg-white/5 overflow-hidden relative">
                        {f.image_url ? (
                          <div className="w-full h-full animate-ken-burns">
                            <img
                              src={f.image_url}
                              alt={f.frame_size}
                              className="w-full h-full object-cover"
                            />
                          </div>
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
                        {Number(f.profit) > 0 && (
                          <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-green-500/90 text-white text-xs font-semibold backdrop-blur-sm">
                            In Stock
                          </span>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <h3 className="text-lg font-extrabold text-dark">{f.frame_size}</h3>
                          <span className="text-xl font-extrabold text-primary">
                            LKR {Number(f.price).toLocaleString()}
                          </span>
                        </div>
                        {f.description && (
                          <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-2 mb-4">{f.description}</p>
                        )}
                        <motion.a
                          href={orderLink(f)}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-shadow"
                        >
                          <FaWhatsapp size={16} className="animate-pulse-soft" />
                          Order on WhatsApp
                        </motion.a>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* How it works */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.1 }}
              className="relative p-6 rounded-2xl bg-white dark:bg-[#17171d] border border-gray-100 dark:border-[#2b2b35] text-center"
            >
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-primary to-accent2 text-white text-xs font-bold">
                Step {i + 1}
              </span>
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                className="mx-auto mb-3 mt-3 w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"
              >
                <s.icon size={22} />
              </motion.div>
              <h3 className="font-bold text-dark">{s.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Custom size request */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-5 p-8 bg-gradient-to-r from-primary/10 to-accent2/10 border border-primary/15 rounded-3xl"
        >
          <div>
            <h2 className="text-xl font-extrabold text-dark">Need a custom size?</h2>
            <p className="text-sm text-gray-500 mt-1">Tell us your dimensions and we'll make it for you.</p>
          </div>
          <MagneticButton>
            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hello! I would like to order a custom frame.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              <FaWhatsapp size={16} />
              Request Custom Frame
            </a>
          </MagneticButton>
        </motion.div>
      </div>
    </div>
  )
}