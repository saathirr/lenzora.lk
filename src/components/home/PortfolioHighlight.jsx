import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowRight, HiExternalLink } from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'
import TiltCard from '../ui/TiltCard'
import Reveal from '../ui/Reveal'
import AnimatedHeading from '../ui/AnimatedHeading'
import Marquee from '../ui/Marquee'

export default function PortfolioHighlight() {
  const { portfolio } = useApp()
  const items = portfolio.slice(0, 4)

  return (
    <section className="relative py-20 sm:py-28 bg-gray-50/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <Reveal className="mb-14">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Portfolio
          </span>
          <AnimatedHeading
            text="Our Recent Work"
            gradient={['Recent']}
            className="text-3xl sm:text-5xl font-extrabold text-dark tracking-tight"
          />
          <p className="mt-3 text-gray-500">A glimpse of what each project looks like — delivered with care.</p>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 perspective-1600">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <TiltCard max={12} glare={i % 2 === 0} className="h-full">
                <div className="relative group overflow-hidden rounded-2xl aspect-square h-full">
                  <div className="w-full h-full animate-ken-burns group-hover:[animation-duration:7s]">
                    <img
                      src={item.image || item.src}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-4">
                    <span className="text-white font-semibold text-sm translate-y-3 group-hover:translate-y-0 transition-transform duration-400 flex items-center gap-1">
                      {item.title}
                      <HiExternalLink size={14} />
                    </span>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {items.length > 0 && (
          <Marquee
            items={items.map((i) => i.title).slice(0, 5)}
            className="mt-14 border-y border-gray-100 py-3 opacity-70"
            itemClassName="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400"
          />
        )}

        <Reveal delay={0.1} className="text-center mt-10">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/gallery"
              className="group inline-flex items-center gap-2 px-7 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:border-primary hover:text-primary hover:-translate-y-0.5 transition-all duration-300"
            >
              See Full Gallery
              <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </Reveal>
      </div>
    </section>
  )
}