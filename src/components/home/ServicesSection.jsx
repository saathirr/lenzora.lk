import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiPhotograph, HiColorSwatch, HiPencil, HiVideoCamera, HiChartBar, HiTemplate, HiArrowRight } from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'
import TiltCard from '../ui/TiltCard'
import Reveal from '../ui/Reveal'
import AnimatedHeading from '../ui/AnimatedHeading'

const iconMap = {
  HiPhotograph, HiColorSwatch, HiPencil,
  HiVideoCamera, HiChartBar, HiTemplate,
}

const gradients = [
  'from-orange-500/15 to-amber-500/15 text-orange-500',
  'from-orange-700/15 to-orange-500/15 text-orange-700',
  'from-amber-500/15 to-orange-500/15 text-amber-600',
  'from-orange-600/20 to-amber-400/10 text-orange-600',
  'from-amber-600/15 to-amber-400/15 text-amber-700',
  'from-orange-400/20 to-amber-500/15 text-orange-500',
]

export default function ServicesSection() {
  const { services } = useApp()
  const active = services.filter((s) => s.active).slice(0, 6)

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <motion.div className="pointer-events-none absolute -top-24 right-0 w-[360px] h-[360px] rounded-full bg-accent2/10 blur-3xl animate-blob" aria-hidden />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <Reveal className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            What We Offer
          </span>
          <AnimatedHeading
            text="End-to-End Creative Services"
            gradient={['Creative']}
            className="text-3xl sm:text-5xl font-extrabold text-dark tracking-tight"
          />
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            End-to-end digital graphics services tailored to elevate your brand.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 perspective-1600">
          {active.map((s, i) => {
            const Icon = iconMap[s.icon] || [HiPhotograph, HiColorSwatch, HiPencil, HiVideoCamera, HiChartBar, HiTemplate][i % 6]
            const grad = gradients[i % gradients.length]
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 40, rotateY: 12 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: (i % 3) * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                <TiltCard max={10} className="h-full">
                  <div className="group relative h-full p-7 rounded-3xl bg-white border border-gray-100 dark:border-[#262626] shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br from-primary/10 to-accent2/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300`}>
                      <Icon size={26} />
                    </div>
                    <h3 className="text-lg font-bold text-dark mb-2">{s.name}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{s.description || s.desc || ''}</p>
                  </div>
                </TiltCard>
              </motion.div>
            )
          })}
        </div>

        <Reveal delay={0.15} className="text-center mt-12">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/services"
              className="group inline-flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-primary to-accent2 text-white font-semibold rounded-full hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              View all services &amp; pricing
              <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </Reveal>
      </div>
    </section>
  )
}