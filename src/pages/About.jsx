import { motion } from 'framer-motion'
import { FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa'

export default function About() {
  return (
    <div className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
              About Us
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-dark leading-tight">
              We Turn Ideas Into{' '}
              <span className="text-primary">
                Visual Masterpieces
              </span>
            </h1>
            <p className="mt-6 text-gray-600 leading-relaxed">
              At Lenzora.lk, we are a team of passionate digital artists dedicated to delivering
              premium graphics services. From photo editing and branding to social media creatives
              and video production, we help businesses and individuals stand out in the digital space.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Our mission is simple — provide top-tier design solutions that are accessible, fast,
              and tailored to your unique needs. Every project is a partnership, and your vision is
              our blueprint.
            </p>
            <div className="mt-8 flex gap-3">
              <a href="https://instagram.com/lenzora.lk" target="_blank" rel="noopener noreferrer" className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition">
                <FaInstagram size={20} />
              </a>
              <a href="https://facebook.com/lenzora.lk" target="_blank" rel="noopener noreferrer" className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition">
                <FaFacebook size={20} />
              </a>
              <a href="lenzora Logo.jpg" target="_blank" rel="noopener noreferrer" className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition">
                <FaWhatsapp size={20} />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800&h=600&fit=crop"
                alt="Design studio"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 hidden sm:block">
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-gray-500">Projects Done</div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          {[
            { number: '50+', label: 'Projects Completed' },
            { number: '30+', label: 'Happy Clients' },
            { number: '24h', label: 'Fast Turnaround' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-8 rounded-2xl bg-gray-50 border border-gray-100"
            >
              <div className="text-4xl font-bold text-primary">
                {stat.number}
              </div>
              <div className="mt-2 text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
