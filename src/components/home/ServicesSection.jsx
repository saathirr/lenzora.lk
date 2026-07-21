import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiPhotograph, HiColorSwatch, HiPencil, HiVideoCamera, HiChartBar, HiTemplate } from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'

const iconMap = {
  HiPhotograph, HiColorSwatch, HiPencil,
  HiVideoCamera, HiChartBar, HiTemplate,
}

export default function ServicesSection() {
  const { services } = useApp()
  const active = services.filter((s) => s.active).slice(0, 6)

  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-dark">What We Offer</h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            End-to-end digital graphics services tailored to elevate your brand.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {active.map((s, i) => {
            const Icon = iconMap[s.icon] || [HiPhotograph, HiColorSwatch, HiPencil, HiVideoCamera, HiChartBar, HiTemplate][i % 6]
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition">
                  <Icon className="text-primary group-hover:text-white transition" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-dark mb-2">{s.name}</h3>
                <p className="text-sm text-gray-500">{s.description || s.desc || ''}</p>
              </motion.div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            View all services & pricing
          </Link>
        </div>
      </div>
    </section>
  )
}
