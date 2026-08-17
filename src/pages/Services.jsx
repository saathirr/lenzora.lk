import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiPhotograph, HiColorSwatch, HiPencil, HiVideoCamera, HiChartBar, HiTemplate, HiCheck, HiArrowRight, HiSparkles } from 'react-icons/hi'
import { useApp } from '../lib/AppContext'
import TiltCard from '../components/ui/TiltCard'
import Reveal from '../components/ui/Reveal'
import AnimatedHeading from '../components/ui/AnimatedHeading'
import CountUp from '../components/ui/CountUp'
import FloatingOrbs from '../components/ui/FloatingOrbs'
import MagneticButton from '../components/ui/MagneticButton'

const iconMap = {
  HiPhotograph, HiColorSwatch, HiPencil,
  HiVideoCamera, HiChartBar, HiTemplate,
}

const iconList = [HiPhotograph, HiColorSwatch, HiPencil, HiVideoCamera, HiChartBar, HiTemplate]

const features = {
  'Photo Editing': ['Retouching & restoration', 'Background removal', 'Color correction', 'High-res delivery'],
  'Graphic Design': ['Custom layouts', 'Print-ready files', 'Unlimited revisions', 'Source files included'],
  'Brand Identity': ['Logo design', 'Color & typography', 'Brand guidelines', 'Stationery set'],
  'Video Editing': ['Trim & cuts', 'Transitions & effects', 'Motion graphics', 'Sound mixing'],
  'Social Media Graphics': ['Post & story designs', 'Banner & ads', 'Reusable templates', 'Format per platform'],
  'UI/UX Design': ['Wireframes', 'Prototypes', 'Design system', 'Developer handoff'],
}

export default function Services() {
  const { services } = useApp()
  const active = services.filter((s) => s.active)
  const [activeTab, setActiveTab] = useState(0)

  if (active.length === 0) {
    return (
      <div className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-dark mb-4">Our Services</h1>
          <p className="text-gray-500">Coming soon.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative py-20 sm:py-28 overflow-hidden">
      <FloatingOrbs count={2} intensity={0.35} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <Reveal className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Our Services
          </span>
          <AnimatedHeading
            text="Design Solutions for Every Need"
            gradient={['Every']}
            className="text-4xl sm:text-5xl font-extrabold text-dark tracking-tight"
          />
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Transparent pricing, fast delivery, and quality you can trust.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 perspective-1600">
          <Reveal className="lg:col-span-1">
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 lg:sticky lg:top-24">
              {active.map((s, i) => {
                const Icon = iconMap[s.icon] || iconList[i % iconList.length] || HiPhotograph
                const selected = activeTab === i
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveTab(i)}
                    className={`relative shrink-0 lg:w-full text-left p-4 rounded-2xl flex items-center gap-3 transition-colors ${
                      selected ? 'text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="service-tab-pill"
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary to-accent2 shadow-lg shadow-primary/30"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <motion.span
                      animate={selected ? { rotate: -10, scale: 1.1 } : {}}
                      className="relative z-10 flex items-center gap-3 w-full"
                    >
                      <Icon size={20} className="relative z-10" />
                      <span className="relative z-10 font-medium whitespace-nowrap">{s.name}</span>
                      {selected && (
                        <motion.span layoutId="service-spark" className="ml-auto relative z-10">
                          <HiSparkles size={18} />
                        </motion.span>
                      )}
                    </motion.span>
                  </button>
                )
              })}
            </div>
          </Reveal>

          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, rotateY: -8, y: 16 }}
                animate={{ opacity: 1, rotateY: 0, y: 0 }}
                exit={{ opacity: 0, rotateY: 8, y: -10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="preserve-3d"
              >
                {(() => {
                  const s = active[activeTab]
                  const Icon = iconMap[s.icon] || iconList[activeTab % iconList.length] || HiPhotograph
                  const priceText = s.price ? `From LKR` : ''
                  const usesFeatures = features[s.name] || ['Fast delivery', 'Premium quality', 'Tailored to you']
                  return (
                    <TiltCard max={7} className="h-full">
                      <div className="relative h-full p-7 sm:p-10 rounded-3xl bg-white border border-gray-100 dark:border-[#2b2b35] shadow-xl overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br from-primary/15 to-accent2/15 blur-3xl animate-blob" aria-hidden />
                        <div className="flex items-start gap-5 mb-6">
                          <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent2 text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/30"
                          >
                            <Icon size={30} />
                          </motion.div>
                          <div className="min-w-0">
                            <h2 className="text-2xl sm:text-3xl font-bold text-dark truncate">{s.name}</h2>
                            {s.price && (
                              <span className="text-primary font-bold inline-flex items-baseline gap-1">
                                {priceText}{' '}
                                <CountUp to={Number(s.price)} prefix="LKR " className="text-2xl" />
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-600 dark:text-slate-300 mt-4 leading-relaxed">
                          {s.description || s.desc || ''}
                        </p>

                        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {usesFeatures.map((f, j) => (
                            <motion.div
                              key={f}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.15 + j * 0.08 }}
                              className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-slate-300"
                            >
                              <span className="w-5 h-5 rounded-full bg-green-500/15 text-green-600 flex items-center justify-center shrink-0">
                                <HiCheck size={12} />
                              </span>
                              {f}
                            </motion.div>
                          ))}
                        </div>

                        <div className="mt-9">
                          <MagneticButton>
                            <Link
                              to="/contact"
                              className="group inline-flex items-center gap-2 px-7 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
                            >
                              Order This Service
                              <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </MagneticButton>
                        </div>
                      </div>
                    </TiltCard>
                  )
                })()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}