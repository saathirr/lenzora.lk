import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../../lib/AppContext'

export default function PortfolioHighlight() {
  const { portfolio } = useApp()
  const items = portfolio.slice(0, 4)

  return (
    <section className="py-20 sm:py-28 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-dark">Recent Work</h2>
          <p className="mt-2 text-gray-500">A glimpse of what we have crafted for our clients.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative group overflow-hidden rounded-2xl aspect-square"
            >
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/40 transition flex items-center justify-center">
                <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition">View Project</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-full hover:border-primary hover:text-primary transition"
          >
            See Full Gallery
          </Link>
        </div>
      </div>
    </section>
  )
}
