import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiPhotograph, HiColorSwatch, HiPencil, HiVideoCamera, HiChartBar, HiTemplate, HiCheck, HiArrowRight } from 'react-icons/hi'
import { useApp } from '../lib/AppContext'

const iconMap = {
  HiPhotograph, HiColorSwatch, HiPencil,
  HiVideoCamera, HiChartBar, HiTemplate,
}

const iconList = [HiPhotograph, HiColorSwatch, HiPencil, HiVideoCamera, HiChartBar, HiTemplate]

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
    <div className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Our Services
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-dark">
            Design Solutions for Every Need
          </h1>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Transparent pricing, fast delivery, and quality you can trust.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            {active.map((s, i) => {
              const Icon = iconMap[s.icon] || iconList[i % iconList.length] || HiPhotograph
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveTab(i)}
                  className={`shrink-0 lg:w-full text-left p-4 rounded-xl flex items-center gap-3 transition ${
                    activeTab === i
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium whitespace-nowrap">{s.name}</span>
                </button>
              )
            })}
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 shadow-xl"
          >
            {(() => {
              const s = active[activeTab]
              const Icon = iconMap[s.icon] || iconList[activeTab % iconList.length] || HiPhotograph
              const priceText = s.price ? `From LKR ${Number(s.price).toLocaleString()}` : 'Contact for pricing'
              return (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="text-primary" size={24} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-dark truncate">{s.name}</h2>
                      <span className="text-sm text-primary font-semibold">{priceText}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mt-4">{s.description || s.desc || ''}</p>
                  <Link
                    to="/contact"
                    className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition shadow-lg"
                  >
                    Order This Service
                    <HiArrowRight />
                  </Link>
                </div>
              )
            })()}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
