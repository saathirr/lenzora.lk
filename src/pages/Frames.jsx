import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'
import {
  HiTemplate, HiSearch, HiArrowLeft, HiArrowRight,
  HiPhotograph, HiCursorClick, HiCheckCircle, HiFolderOpen,
} from 'react-icons/hi'
import { useApp } from '../lib/AppContext'
import TiltCard from '../components/ui/TiltCard'
import FloatingOrbs from '../components/ui/FloatingOrbs'
import AnimatedHeading from '../components/ui/AnimatedHeading'
import MagneticButton from '../components/ui/MagneticButton'

const steps = [
  { icon: HiFolderOpen, title: 'Pick a Folder', desc: 'Choose your size — A4, A3, 6x6 and more.' },
  { icon: HiCursorClick, title: 'Order on WhatsApp', desc: 'One tap opens chat with details pre-filled.' },
  { icon: HiCheckCircle, title: 'Confirmed & Delivered', desc: 'We confirm your order and get it to you.' },
]

const formatPrice = (n) => (Number.isFinite(Number(n)) ? `LKR ${Number(n).toLocaleString()}/=` : 'Custom Size')

export default function FramesPage() {
  const { frames, settings, frameCategories } = useApp()
  const whatsapp = settings.whatsapp || '94717336756'

  const visibleFrames = useMemo(
    () => frames.filter((f) => f.active !== false && f.frame_size),
    [frames]
  )

  const folders = useMemo(() => {
    const configured = (frameCategories || [])
      .filter((c) => c.active !== false)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

    if (configured.length) {
      return configured.map((c) => {
        const key = (c.name || '').trim().toUpperCase()
        const list = visibleFrames.filter((f) => (f.category || '').trim().toUpperCase() === key)
        return { key, name: c.name, price: c.price, photo: c.image_url || '', frames: list }
      })
    }

    const map = new Map()
    visibleFrames.forEach((f) => {
      const raw = (f.category || '').trim()
      const key = raw ? raw.toUpperCase() : 'OTHER'
      if (!map.has(key)) map.set(key, { key, name: raw || 'Other Frames', price: null, photo: '', frames: [] })
      map.get(key).frames.push(f)
    })
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [visibleFrames, frameCategories])

  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')

  const selectedFolder = selected ? folders.find((f) => f.key === selected) : null

  const folderCover = (folder) => {
    if (folder.photo) return folder.photo
    const sample = folder.frames.find((f) => f.image_url)?.image_url || folder.frames[0]?.image_url
    return sample || ''
  }

  const detailFrames = useMemo(() => {
    if (!selectedFolder) return []
    let list = selectedFolder.frames
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((f) =>
        [f.frame_size, f.description, f.category].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
      )
    }
    return list
  }, [selectedFolder, query])

  const orderLink = (f) =>
    `https://wa.me/${whatsapp}?text=${encodeURIComponent(
      `Hello Lenzora! I would like to order a frame.\n\nSize: ${f.frame_size}\nPrice: ${formatPrice(f.price)}${f.category ? `\nFolder: ${f.category}` : ''}${f.description ? `\nDesign: ${f.description}` : ''}`
    )}`

  const customLink = (folder) =>
    `https://wa.me/${whatsapp}?text=${encodeURIComponent(
      `Hello Lenzora! I would like to order a ${folder.name}. Can you help me with a custom size?`
    )}`

  const allCount = visibleFrames.length

  return (
    <div className="relative py-20 sm:py-28 overflow-hidden">
      <FloatingOrbs count={2} intensity={0.3} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/10 text-primary text-sm font-semibold rounded-full mb-4 glass">
            <HiFolderOpen size={14} />
            Frames
          </span>
          <AnimatedHeading
            text="Pick Your Frame Folder"
            gradient={['Frame']}
            className="text-4xl sm:text-5xl font-extrabold text-dark dark:text-white tracking-tight"
          />
          <p className="mt-4 text-gray-500 dark:text-slate-400 max-w-xl mx-auto">
            Browse our frame folders, choose a design you love and order instantly on WhatsApp.{' '}
            <span className="font-semibold text-primary">
              {allCount} {allCount === 1 ? 'frame' : 'frames'} available
            </span>
          </p>
        </motion.div>

        {folders.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm">
            <HiTemplate size={40} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
            <p className="text-gray-500 dark:text-slate-400">No frame folders available right now. Check back soon!</p>
          </div>
        ) : !selectedFolder ? (
          <>
            {/* Folder grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 perspective-1600">
              {folders.map((folder, i) => {
                const cover = folderCover(folder)
                return (
                  <motion.div
                    key={folder.key}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + i * 0.08 }}
                    className="h-full"
                  >
                    <TiltCard max={11} className="h-full">
                      <button
                        onClick={() => setSelected(folder.key)}
                        className="group relative w-full h-full min-h-[300px] rounded-3xl overflow-hidden text-left"
                      >
                        {cover ? (
                          <>
                            <img src={cover} alt={folder.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/20" />
                          </>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-[#150f22] to-accent2/40" />
                        )}

                        <span className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/95 text-dark text-sm font-extrabold shadow-lg backdrop-blur-sm">
                          {formatPrice(folder.price)}
                        </span>

                        <div className="absolute inset-x-0 bottom-0 p-6">
                          <div className="flex items-center gap-2 mb-2">
                            <HiFolderOpen size={18} className="text-secondary" />
                            <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
                              {folder.frames.length} {folder.frames.length === 1 ? 'design' : 'designs'}
                            </span>
                          </div>
                          <h3 className="text-2xl font-extrabold text-white tracking-tight">{folder.name}</h3>
                          <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white bg-white/15 hover:bg-white/25 px-4 py-2 rounded-full backdrop-blur transition-all">
                            Open Folder
                            <HiArrowRight className="group-hover:translate-x-1 transition-transform" size={15} />
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
            {/* Folder detail view */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <motion.button
                  whileHover={{ x: -4 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { setSelected(null); setQuery('') }}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition"
                >
                  <HiArrowLeft size={16} />
                  All Folders
                </motion.button>
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={selectedFolder.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-2 text-3xl sm:text-4xl font-extrabold text-dark dark:text-white tracking-tight"
                  >
                    {selectedFolder.name}
                  </motion.h2>
                </AnimatePresence>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  {selectedFolder.price ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="font-bold text-primary">{formatPrice(selectedFolder.price)}</span> · Starting price
                    </span>
                  ) : 'Custom sizes — tell us your dimensions'}
                  <span className="mx-2">·</span>
                  {selectedFolder.frames.length} {selectedFolder.frames.length === 1 ? 'design' : 'designs'}
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
                <HiPhotograph size={40} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
                <p className="text-gray-500 dark:text-slate-400">
                  {query.trim()
                    ? 'No frames match your search.'
                    : 'No designs in this folder yet. Check back soon!'}
                </p>
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
                            <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-primary/95 text-white text-sm font-extrabold shadow-lg backdrop-blur-sm">
                              {formatPrice(f.price)}
                            </span>
                          </div>

                          <div className="p-5">
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <h3 className="text-lg font-extrabold text-dark">{f.frame_size}</h3>
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

            {/* Custom size request (shown for custom folders or always as an option) */}
            {!selectedFolder.price && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-5 p-8 bg-gradient-to-r from-primary/10 to-accent2/10 border border-primary/15 rounded-3xl"
              >
                <div>
                  <h2 className="text-xl font-extrabold text-dark dark:text-white">Need a custom size?</h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Tell us your dimensions and we'll make it for you.</p>
                </div>
                <MagneticButton>
                  <a
                    href={customLink(selectedFolder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <FaWhatsapp size={16} />
                    Request Custom Size
                  </a>
                </MagneticButton>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
