import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowRight } from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import { useApp } from '../../lib/AppContext'
import MagneticButton from '../ui/MagneticButton'

export default function CTABanner() {
  const { settings } = useApp()
  const whatsapp = settings.whatsapp || '94717336756'

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-aurora opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,10,0.55)_100%)]" />
      <motion.div
        className="pointer-events-none absolute -top-24 left-1/4 w-[420px] h-[420px] rounded-full bg-white/10 blur-3xl animate-blob"
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -bottom-32 right-1/4 w-[360px] h-[360px] rounded-full bg-white/10 blur-3xl animate-blob"
        style={{ animationDelay: '2s' }}
        aria-hidden
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 text-white text-sm font-semibold rounded-full backdrop-blur-sm mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse-soft" />
          Let's Create Together
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-6xl font-extrabold text-white leading-tight tracking-tight"
        >
          Ready to Elevate
          <motion.span
            animate={{ opacity: [1, 0.55, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="block text-white/90"
          >
            Your Brand?
          </motion.span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mt-5 text-lg text-white/80 max-w-xl mx-auto"
        >
          Let's create something amazing together. Reach out and bring your vision to life.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <MagneticButton>
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary font-bold rounded-full hover:bg-gray-100 hover:-translate-y-0.5 transition-all duration-300 shadow-xl shadow-black/10"
            >
              Get a Quote
              <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </MagneticButton>
          <MagneticButton>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white/40 text-white font-bold rounded-full hover:bg-white/15 hover:-translate-y-0.5 transition-all duration-300"
            >
              <FaWhatsapp size={18} className="animate-pulse-soft text-green-400" />
              WhatsApp Us
            </a>
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  )
}