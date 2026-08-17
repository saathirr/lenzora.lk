import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion'
import { HiArrowRight, HiChevronDown, HiSparkles, HiLightningBolt, HiShieldCheck, HiCube } from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import FloatingOrbs from '../ui/FloatingOrbs'
import MagneticButton from '../ui/MagneticButton'
import AnimatedHeading from '../ui/AnimatedHeading'
import { useApp } from '../../lib/AppContext'

const highlights = [
  { icon: HiSparkles, label: 'Premium Quality' },
  { icon: HiLightningBolt, label: 'Lightning Fast' },
  { icon: HiCube, label: 'Frames & More' },
  { icon: HiShieldCheck, label: 'Secure Delivery' },
]

export default function Hero() {
  const { settings, portfolio } = useApp()
  const whatsapp = settings.whatsapp || '94717336756'
  const ref = useRef(null)
  const images = portfolio.filter((i) => i.image || i.src).slice(0, 3)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yContent = useTransform(scrollYProgress, [0, 1], [0, 130])
  const yCards = useTransform(scrollYProgress, [0, 1], [0, -110])
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0])

  const pmx = useSpring(useMotionValue(0), { stiffness: 55, damping: 18 })
  const pmy = useSpring(useMotionValue(0), { stiffness: 55, damping: 18 })
  const cardX = useTransform(pmx, (v) => v)
  const cardY = useTransform(pmy, (v) => v)
  const glow = useMotionTemplate`radial-gradient(600px circle at ${cardX}px 0px, rgba(249,115,22,0.12), transparent)`

  const handleMove = (e) => {
    pmx.set((e.clientX / window.innerWidth - 0.5) * 46)
    pmy.set((e.clientY / window.innerHeight - 0.5) * 46)
  }

  return (
    <section
      ref={ref}
      onMouseMove={handleMove}
      className="relative min-h-[92vh] flex items-center bg-grid overflow-hidden"
    >
      {/* Animated aurora background (no WebGL — pure CSS) */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-[#0a0a0a]/80 to-[#241a08]" />
      <motion.div
        className="pointer-events-none absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-primary/25 blur-[120px] animate-blob"
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute top-1/3 -right-40 w-[460px] h-[460px] rounded-full bg-accent2/25 blur-[110px] animate-blob"
        style={{ animationDelay: '2.4s' }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-accent3/20 blur-[100px] animate-blob"
        style={{ animationDelay: '4.8s' }}
        aria-hidden
      />
      <FloatingOrbs count={2} intensity={0.4} />

      <motion.div className="absolute inset-0 z-[1]" style={{ background: glow }} aria-hidden />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div style={{ y: yContent, opacity: fade }}>
            <motion.span
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white text-sm font-semibold rounded-full mb-6 glass"
            >
              <span className="w-2 h-2 rounded-full bg-accent3 animate-pulse-soft" />
              Premium Digital Graphics Services
            </motion.span>

            <AnimatedHeading
              text="Designs That Speak Volumes"
              gradient={['Speak', 'Volumes']}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight"
            />

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 text-lg sm:text-xl text-white/80 max-w-xl leading-relaxed"
            >
              From brand identity to social media graphics — we craft visuals that captivate, convert, and leave a lasting impression.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-9 flex flex-wrap gap-4"
            >
              <MagneticButton>
                <Link
                  to="/services"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 shine-holder"
                >
                  Explore Services
                  <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </MagneticButton>
              <MagneticButton>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 border-2 border-white/25 text-white font-semibold rounded-full hover:border-green-500 hover:text-green-400 hover:bg-white/5 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <FaWhatsapp size={18} className="text-green-400 animate-pulse-soft" />
                  WhatsApp Us
                </a>
              </MagneticButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="mt-10 flex flex-wrap gap-8"
            >
              {[{ n: '50+', l: 'Projects' }, { n: '30+', l: 'Clients' }, { n: '24h', l: 'Turnaround' }].map((s, i) => (
                <motion.div key={s.l} whileHover={{ y: -4 }} className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold text-primary">{s.n}</span>
                  <span className="text-sm text-white/60">{s.l}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Floating showcase */}
          <motion.div
            style={{ y: yCards }}
            className="hidden lg:flex items-center justify-center relative h-[520px]"
          >
            <div className="absolute w-[380px] h-[380px] rounded-full border-2 border-dashed border-primary/20 animate-orbit" />
            <div className="absolute w-[280px] h-[280px] rounded-full border border-accent2/20 animate-orbit" style={{ animationDirection: 'reverse' }} />
            <div className="absolute inset-0 m-auto w-72 h-72 rounded-full bg-gradient-to-br from-primary/20 to-accent2/20 blur-3xl animate-pulse-soft" />

            {images.length > 0 ? (
              images.map((img, i) => {
                const offsets = [
                  { x: -150, y: -110 },
                  { x: 40, y: 120 },
                  { x: 155, y: -80 },
                ]
                const o = offsets[i % offsets.length]
                return (
                  <motion.div
                    key={img.id || i}
                    initial={{ opacity: 0, scale: 0.7, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.18, type: 'spring', stiffness: 160, damping: 18 }}
                    style={{
                      x: cardX,
                      y: cardY,
                      rotateY: [22, -24, 30][i],
                      rotateZ: [8, -6, 18][i],
                      transformPerspective: 900,
                      top: `calc(50% + ${o.y}px)`,
                      left: `calc(50% + ${o.x}px)`,
                    }}
                    className="absolute -ml-[104px] -mt-[130px] w-52 aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/15"
                  >
                    <div className="w-full h-full animate-ken-burns">
                      <img src={img.image || img.src} alt={img.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-white text-xs font-semibold">{img.title}</p>
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                style={{ x: cardX, y: cardY, transformPerspective: 900, rotateY: -14 }}
                className="absolute top-1/2 left-1/2 -ml-32 -mt-32 w-64 h-64 rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-black/50"
              >
                <span className="text-6xl">🎨</span>
              </motion.div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          style={{ opacity: fade }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 text-white/60"
        >
          <span className="text-[11px] uppercase tracking-[0.25em]">Scroll</span>
          <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity }} className="flex">
            <HiChevronDown size={22} />
          </motion.span>
        </motion.div>
      </div>

      {/* Trust strip */}
      <div className="absolute bottom-0 inset-x-0 z-10 border-t border-white/10 bg-black/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {highlights.map((h, i) => (
            <motion.div
              key={h.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.08 }}
              className="flex items-center gap-2.5 justify-center"
            >
              <span className="w-8 h-8 rounded-lg bg-white/10 text-accent3 flex items-center justify-center shrink-0">
                <h.icon size={15} />
              </span>
              <span className="text-xs sm:text-sm font-medium text-white/85">{h.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}