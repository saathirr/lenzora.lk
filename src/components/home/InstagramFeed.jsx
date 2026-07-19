import { motion } from 'framer-motion'
import { FaInstagram } from 'react-icons/fa'

export default function InstagramFeed() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <FaInstagram className="mx-auto text-3xl text-primary mb-3" />
          <h2 className="text-3xl sm:text-4xl font-bold text-dark">Follow Us</h2>
          <p className="mt-2 text-gray-500">@lenzora.lk on Instagram</p>
        </motion.div>

        <div className="flex justify-center">
          <div className="w-full max-w-lg aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-lg">
            <iframe
              src="https://www.instagram.com/lenzora.lk/embed"
              className="w-full h-full"
              title="Instagram Feed"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
