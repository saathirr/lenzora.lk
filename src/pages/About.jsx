import { motion } from 'framer-motion'
import { FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa'
import { HiSparkles, HiHeart, HiLightningBolt, HiShieldCheck } from 'react-icons/hi'
import lenzoraLogo from '../assets/Lenzora.jpg'
import { useApp } from '../lib/AppContext'
import TiltCard from '../components/ui/TiltCard'
import Reveal from '../components/ui/Reveal'
import AnimatedHeading from '../components/ui/AnimatedHeading'
import CountUp from '../components/ui/CountUp'
import FloatingOrbs from '../components/ui/FloatingOrbs'
import MagneticButton from '../components/ui/MagneticButton'

const values = [
  { icon: HiSparkles, title: 'Premium Quality', desc: 'Pixel-perfect output on every single project, every time.' },
  { icon: HiLightningBolt, title: 'Lightning Fast', desc: 'Quick turnarounds without ever compromising on detail.' },
  { icon: HiHeart, title: 'Client First', desc: 'Your vision is the blueprint — we bring it to life.' },
  { icon: HiShieldCheck, title: 'Reliable Delivery', desc: 'Clear communication and on-time delivery, guaranteed.' },
]

export default function About() {
  const { settings } = useApp()
  const siteName = settings.site_name || 'Lenzora'
  const whatsapp = settings.whatsapp || '94717336756'
  const instagramUrl = settings.instagram_url || 'https://instagram.com/lenzora.lk'
  const facebookUrl = settings.facebook_url || 'https://facebook.com/lenzora.lk'

  return (
    <div className="relative py-20 sm:py-28 overflow-hidden">
      <FloatingOrbs count={2} intensity={0.32} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div>
            <Reveal>
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
                About Us
              </span>
              <AnimatedHeading
                text="We Turn Ideas Into Visual Masterpieces"
                gradient={['Visual', 'Masterpieces']}
                className="text-4xl sm:text-5xl font-extrabold text-dark leading-tight tracking-tight"
              />
            </Reveal>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-gray-600 dark:text-slate-300 leading-relaxed"
            >
              At {siteName}{!siteName.toLowerCase().endsWith('.lk') ? '.lk' : ''}, we are a team of passionate digital artists dedicated to delivering
              premium graphics services. From photo editing and branding to social media creatives
              and video production, we help businesses and individuals stand out in the digital space.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-gray-600 dark:text-slate-300 leading-relaxed"
            >
              Our mission is simple — provide top-tier design solutions that are accessible, fast,
              and tailored to your unique needs. Every project is a partnership, and your vision is
              our blueprint.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-9 flex gap-3"
            >
              {[
                { href: instagramUrl, Icon: FaInstagram },
                { href: facebookUrl, Icon: FaFacebook },
                { href: `https://wa.me/${whatsapp}`, Icon: FaWhatsapp },
              ].map(({ href, Icon }, i) => (
                <MagneticButton key={i} strength={0.45}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 bg-primary/10 text-primary rounded-xl hover:bg-gradient-to-br hover:from-primary hover:to-accent2 hover:text-white transition-all duration-300 inline-flex"
                  >
                    <Icon size={20} />
                  </a>
                </MagneticButton>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="perspective-1600">
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative"
              >
                <TiltCard max={7} className="rounded-3xl">
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-gray-100 dark:border-[#2b2b35]">
                    <img
                      src={settings.logo_url || lenzoraLogo}
                      alt={`${siteName} Logo`}
                      className="w-full h-full object-contain bg-black p-10"
                    />
                  </div>
                </TiltCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 180, damping: 16 }}
                animate={{ y: [0, -8, 0] }}
                style={{ animationDuration: '6s' }}
                className="absolute -top-6 -right-4 sm:-right-8 bg-white dark:bg-[#17171d] rounded-2xl shadow-2xl p-5 border border-gray-100 dark:border-[#2b2b35]"
              >
                <div className="text-3xl font-extrabold text-primary">
                  <CountUp to={50} suffix="+" />
                </div>
                <div className="text-sm text-gray-500">Projects Done</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.55, type: 'spring', stiffness: 180, damping: 16 }}
                animate={{ y: [0, 8, 0] }}
                style={{ animationDuration: '7s' }}
                className="absolute -bottom-6 -left-4 sm:-left-8 bg-white dark:bg-[#17171d] rounded-2xl shadow-2xl p-5 border border-gray-100 dark:border-[#2b2b35]"
              >
                <div className="text-3xl font-extrabold text-accent2">
                  <CountUp to={30} suffix="+" />
                </div>
                <div className="text-sm text-gray-500">Happy Clients</div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          {[
            { n: 50, s: '+', label: 'Projects Completed' },
            { n: 30, s: '+', label: 'Happy Clients' },
            { n: 24, s: 'h', label: 'Fast Turnaround' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, rotateX: 25 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-center p-9 rounded-3xl bg-white dark:bg-[#17171d] border border-gray-100 dark:border-[#2b2b35] shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent2 group-hover:scale-110 transition-transform">
                <CountUp to={stat.n} suffix={stat.s} />
              </div>
              <div className="mt-2 text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-24">
          <Reveal className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
              Why Choose Us
            </span>
            <AnimatedHeading
              text="Built on Values That Matter"
              gradient={['Values']}
              className="text-3xl sm:text-5xl font-extrabold text-dark tracking-tight"
            />
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 perspective-1600">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.1 }}
                className="h-full"
              >
                <TiltCard max={12} className="h-full">
                  <div className="relative h-full p-7 rounded-2xl bg-white dark:bg-[#17171d] border border-gray-100 dark:border-[#2b2b35] hover:border-primary/20 transition-colors text-center overflow-hidden group">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.35 }}
                      className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-accent2/15 text-primary flex items-center justify-center group-hover:from-primary group-hover:to-accent2 group-hover:text-white transition-colors duration-300"
                    >
                      <v.icon size={24} />
                    </motion.div>
                    <h3 className="font-bold text-dark mb-1.5">{v.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}