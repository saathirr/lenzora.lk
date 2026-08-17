import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaInstagram, FaFacebook, FaWhatsapp, FaEnvelope } from 'react-icons/fa'
import { useApp } from '../../lib/AppContext'
import Marquee from '../ui/Marquee'
import defaultLogo from '../../assets/lenzora-logo.png'

const socials = [
  { key: 'instagram', icon: FaInstagram },
  { key: 'facebook', icon: FaFacebook },
  { key: 'whatsapp', icon: FaWhatsapp },
  { key: 'email', icon: FaEnvelope },
]

export default function Footer() {
  const { settings } = useApp()
  const siteName = settings.site_name || 'Lenzora'
  const brandSuffix = siteName.toLowerCase().endsWith('.lk') ? '' : '.lk'
  const tagline = settings.tagline || 'Premium digital graphics services.'
  const whatsapp = settings.whatsapp || '94717336756'
  const email = settings.contact_email || 'hello@lenzora.lk'
  const instagramUrl = settings.instagram_url || 'https://instagram.com/lenzora.lk'
  const facebookUrl = settings.facebook_url || 'https://facebook.com/lenzora.lk'

  const socialHrefs = {
    instagram: instagramUrl,
    facebook: facebookUrl,
    whatsapp: `https://wa.me/${whatsapp}`,
    email: `mailto:${email}`,
  }

  const brandWords = ['Graphic Design', 'Photo Editing', 'Brand Identity', 'Social Media', 'Video Editing', 'Frames & Prints']

  return (
    <footer className="relative bg-dark text-gray-300 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      <Marquee
        items={brandWords}
        className="bg-gradient-to-r from-primary/15 via-accent2/15 to-primary/15 border-y border-white/5"
        itemClassName="text-sm font-semibold uppercase tracking-[0.2em] text-white/60"
        speed="animate-marquee"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            {settings.logo_url ? (
              <img src={settings.logo_url} alt={siteName} className="h-11 max-w-[180px] object-contain mb-2" />
            ) : (
              <img src={defaultLogo} alt={siteName} className="h-11 max-w-[180px] object-contain mb-2" />
            )}
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              {tagline}
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm">
              {[
                { to: '/services', label: 'Services' },
                { to: '/gallery', label: 'Gallery' },
                { to: '/shop', label: 'Shop' },
                { to: '/frames', label: 'Frames' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
              ].map((l) => (
                <motion.div key={l.to} whileHover={{ x: 5 }}>
                  <Link to={l.to} className="block hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <div className="space-y-2 text-sm">
              <span className="block">Graphic Design</span>
              <span className="block">Photo Editing</span>
              <span className="block">Brand Identity</span>
              <span className="block">Social Media Graphics</span>
              <span className="block">Video Editing</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <div className="flex gap-3 mb-4 flex-wrap">
              {socials.map(({ key, icon: Icon }) => (
                <motion.a
                  key={key}
                  href={socialHrefs[key]}
                  target={key === 'email' ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  whileHover={{ y: -4, scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  className={`p-2 bg-white/10 rounded-full hover:bg-primary transition-colors inline-flex ${key === 'whatsapp' ? 'animate-pulse-soft' : ''}`}
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
            <p className="text-sm text-gray-400">{email}</p>
            <p className="text-sm text-gray-400">{whatsapp}</p>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {siteName}{brandSuffix} — All rights reserved.
        </div>
      </div>
    </footer>
  )
}