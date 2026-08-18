import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'
import {
  HiTemplate, HiSearch, HiViewGrid, HiArrowLeft, HiArrowRight,
  HiPhotograph, HiCursorClick, HiCheckCircle, HiChevronDown,
} from 'react-icons/hi'
import { useApp } from '../lib/AppContext'
import TiltCard from '../components/ui/TiltCard'
import FloatingOrbs from '../components/ui/FloatingOrbs'
import AnimatedHeading from '../components/ui/AnimatedHeading'
import MagneticButton from '../components/ui/MagneticButton'

const steps = [
  { icon: HiPhotograph, title: 'Pick a Category', desc: 'Choose your size — A4, A5, 6x6 and more.' },
  { icon: HiCursorClick, title: 'Order on WhatsApp', desc: 'One tap opens chat with details pre-filled.' },
  { icon: HiCheckCircle, title: 'Confirmed & Delivered', desc: 'We confirm your order and get it to you.' },
]

export default function FramesPage() {
  const { frames, settings, frameCategories } = useApp()
  const whatsapp = settings.whatsapp || '94717336756'

  const visibleFrames = useMemo(
    () => frames.filter((f) => f.active !== false && f.frame_size),
    [frames]
  )

  const categories = useMemo(() => {
    const configured = (frameCategories || [])
      .filter((c) => c.active !== false)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

    if (configured.length) {
      return configured.map((c) => {
        const key = (c.name || '').trim().toUpperCase()
        const list = visibleFrames.filter((f) => (f.category || '').trim().toUpperCase() === key)
        return { key, name: c.name, frames: list, photo: c.image_url || '' }
      })
    }

    const map = new Map()
    visibleFrames.forEach((f) => {
      const raw = (f.category || '').trim()
      const key = raw ? raw.toUpperCase() : 'OTHER'
      if (!map.has(key)) map.set(key, { key, name: raw || 'Other Frames', frames: [], photo: '' })
      map.get(key).frames.push(f)
    })
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [visibleFrames, frameCategories])

  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')

  const selectedCat = selected ? categories.find((c) => c.key === selected) : null

  const catStats = (framesList) => {
    const prices = framesList.map((f) => Number(f.price)).filter((n) => !Number.isNaN(n))
    const min = prices.length ? Math.min(...prices) : 0
    return {
      count: framesList.length,
      min,
      sample: framesList.find((f) => f.image_url)?.image_url || framesList[0]?.image_url || '',
    }
  }

  const detailFrames = useMemo(() => {
    if (!selectedCat) return []
    let list = selectedCat.frames
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((f) =>
        [f.frame_size, f.description, f.category].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
      )
    }
    return list
  }, [selectedCat, query])

  const orderLink = (f) =>
    `https://wa.me/${whatsapp}?text=${encodeURIComponent(
      `Hello Lenzora! I would like to order a frame.\n\nSize: ${f.frame_size}\nPrice: LKR ${Number(f.price).toLocaleString()}${f.category ? `\nCategory: ${f.category}` : ''}${f.description ? `\nDesign: ${f.description}` : ''}`
    )}`

  const allStats = catStats(visibleFrames)

  return (
    <div className="relative py-20 sm:py-28 overflow-hidden">
      <FloatingOrbs count={2} intensity={0.3} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/10 text-primary text-sm font-semibold rounded-full mb-4 glass">
            <HiTemplate size={14} />
            Frames
          </span>
          <AnimatedHeading
            text="Pick Your Frame Size"
            gradient={['Frame']}
            className="text-4xl sm:text-5xl font-extrabold text-dark dark:text-white tracking-tight"
          />
          <p className="mt-4 text-gray-500 dark:text-slate-400 max-w-xl mx-auto">
            Choose a category to browse frames — sizes, designs &amp; prices.{' '}
            <span className="font-semibold text-primary">
              {visibleFrames.length} {visibleFrames.length === 1 ? 'frame' : 'frames'} available
            </span>
          </p>
        </motion.div>

        {visibleFrames.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm">
            <HiTemplate size={40} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
            <p className="text-gray-500 dark:text-slate-400">No frames available right now. Check back soon!</p>
          </div>
        ) : !selectedCat ? (
          <>
            {/* Category grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 perspective-1600">
              {/* All frames card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="h-full"
              >
                <TiltCard max={10} className="h-full">
                  <button
                    onClick={() => setSelected('ALL')}
                    className="group relative w-full h-full min-h-[220px] p-7 rounded-3xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-colors text-left overflow-hidden"
                  >
                    <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/15 blur-2xl group-hover:opacity-100 opacity-0 transition-opacity duration-500" />
                    <span className="relative z-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-accent2 text-white text-xs font-bold">
                      <HiViewGrid size={13} />
                      All Frames
                    </span>
                    <div className="relative z-10 mt-5">
                      <h3 className="text-2xl font-extrabold text-dark dark:text-white">View Everything</h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{allStats.count} frames · From LKR {allStats.min.toLocaleString()}</p>
                    </div>
                    <span className="relative z-10 absolute bottom-5 right-5 w-10 h-10 rounded-full bg-gray-900/5 dark:bg-white/10 text-gray-700 dark:text-white flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent2 group-hover:rotate-45 group-hover:text-white transition-all duration-300">
                      <HiArrowRight size={18} />
                    </span>
                  </button>
                </TiltCard>
              </motion.div>

              {categories.map((c, i) => {
                const stats = catStats(c.frames)
                return (
                  <motion.div
                    key={c.key}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    className="h-full"
                  >
                    <TiltCard max={11} className="h-full">
                      <button
                        onClick={() => setSelected(c.key)}
                        className="group relative w-full h-full min-h-[220px] rounded-3xl overflow-hidden text-left"
                      >
                        {(c.photo || stats.sample) ? (
                          <>
                            <img src={c.photo || stats.sample} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                          </>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-[#150f22] to-accent2/30" />
                        )}
                        <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-black/50 text-white text-xs font-bold backdrop-blur-sm">
                          {stats.count} {stats.count === 1 ? 'size' : 'sizes'}
                        </span>
                        <div className="absolute inset-x-0 bottom-0 p-5">
                          <h3 className="text-2xl font-extrabold text-white uppercase tracking-tight">{c.name}</h3>
                          <p className="text-sm text-slate-300 mt-1">From LKR {stats.min.toLocaleString()}</p>
                          <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-full backdrop-blur transition-all">
                            View Frames
                            <HiChevronDown className="group-hover:translate-y-0.5 transition-transform" size={14} />
                          </span>
                        </div>
                      </button>
                    </TiltCard>
                  </motion.div>
                )
              })}
            </div>

            {/* How it works */}
            <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {steps.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.1 }}
                  className="relative p-6 rounded-2xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] text-center"
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
          </>
        ) : (
          <>
            {/* Category detail view */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <motion.button
                  whileHover={{ x: -4 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { setSelected(null); setQuery('') }}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition"
                >
                  <HiArrowLeft size={16} />
                  All Categories
                </motion.button>
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={selectedCat.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-2 text-3xl sm:text-4xl font-extrabold text-dark dark:text-white uppercase tracking-tight"
                  >
                    {selectedCat.name}
                  </motion.h2>
                </AnimatePresence>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  {selectedCat.frames.length} {selectedCat.frames.length === 1 ? 'size' : 'sizes'} available
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search sizes or designs..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2f2f2f] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-white/70 dark:bg-white/5 text-sm text-dark dark:text-white"
                />
              </div>
            </div>

            {detailFrames.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm">
                <HiTemplate size={40} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
                <p className="text-gray-500 dark:text-slate-400">No frames match your search.</p>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 perspective-1600">
                <AnimatePresence mode="popLayout">
                  {detailFrames.map((f, i) => (
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
                        <div className="group relative h-full bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300">
                          <div className="aspect-[4/3] bg-gray-100 dark:bg-white/5 overflow-hidden relative">
                            {f.image_url ? (
                              <div className="w-full h-full animate-ken-burns">
                                <img src={f.image_url} alt={f.frame_size} className="w-full h-full object-cover" />
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
          </>
        )}

        {/* Custom size request */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-5 p-8 bg-gradient-to-r from-primary/10 to-accent2/10 border border-primary/15 rounded-3xl"
        >
          <div>
            <h2 className="text-xl font-extrabold text-dark dark:text-white">Need a custom size?</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Tell us your dimensions and we'll make it for you.</p>
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