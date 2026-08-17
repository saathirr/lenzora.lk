import { motion } from 'framer-motion'
import { FaInstagram } from 'react-icons/fa'
import { HiExternalLink } from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'
import Reveal from '../ui/Reveal'
import AnimatedHeading from '../ui/AnimatedHeading'
import TiltCard from '../ui/TiltCard'
import MagneticButton from '../ui/MagneticButton'

export default function InstagramFeed() {
  const { settings, portfolio } = useApp()
  const instagramUrl = settings.instagram_url || 'https://instagram.com/lenzora.lk'
  const tiles = portfolio.filter((item) => item.image || item.src).slice(0, 6)

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <motion.div className="pointer-events-none absolute -bottom-20 left-0 w-[340px] h-[340px] rounded-full bg-accent3/10 blur-3xl animate-blob" aria-hidden />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <Reveal className="text-center mb-14">
          <motion.div
            animate={{ rotate: [0, 12, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex w-14 h-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-500 text-white shadow-lg shadow-pink-500/30 mx-auto mb-5"
          >
            <FaInstagram size={26} />
          </motion.div>
          <AnimatedHeading
            text="Follow Our Journey"
            gradient={['Journey']}
            className="text-3xl sm:text-5xl font-extrabold text-dark tracking-tight"
          />
          <p className="mt-3 text-gray-500">@lenzora.lk on Instagram — daily inspiration and behind-the-scenes.</p>
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {tiles.map((item, i) => (
            <motion.div
              key={item.id || i}
              initial={{ opacity: 0, scale: 0.8, y: 24 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 200, damping: 20 }}
              className="h-full"
            >
              <TiltCard max={16} glare={false} className="h-full">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative aspect-square overflow-hidden rounded-xl group"
                >
                  <img
                    src={item.image || item.src}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-115 group-hover:rotate-1 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                    <HiExternalLink size={16} className="text-white" />
                  </div>
                </a>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        <Reveal delay={0.1} className="text-center mt-10">
          <MagneticButton>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 text-white font-semibold rounded-full hover:shadow-xl hover:shadow-pink-500/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              <FaInstagram size={18} />
              Follow @lenzora.lk
            </a>
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}