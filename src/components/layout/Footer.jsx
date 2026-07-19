import { Link } from 'react-router-dom'
import { FaInstagram, FaFacebook, FaWhatsapp, FaEnvelope } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-dark text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <span className="text-2xl font-bold text-primary">Lenzora</span>
            <span className="text-xs text-gray-500">.lk</span>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              Premium digital graphics services. We bring your vision to life with cutting-edge design.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link to="/services" className="block hover:text-primary transition">Services</Link>
              <Link to="/gallery" className="block hover:text-primary transition">Gallery</Link>
              <Link to="/shop" className="block hover:text-primary transition">Shop</Link>
              <Link to="/about" className="block hover:text-primary transition">About Us</Link>
              <Link to="/contact" className="block hover:text-primary transition">Contact</Link>
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
              <a href="https://instagram.com/lenzora.lk" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-primary transition">
                <FaInstagram size={18} />
              </a>
              <a href="https://facebook.com/lenzora.lk" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-primary transition">
                <FaFacebook size={18} />
              </a>
              <a href="https://wa.me/94761736756" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-primary transition">
                <FaWhatsapp size={18} />
              </a>
              <a href="mailto:hello@lenzora.lk" className="p-2 bg-white/10 rounded-full hover:bg-primary transition">
                <FaEnvelope size={18} />
              </a>
            </div>
            <p className="text-sm text-gray-400">hello@lenzora.lk</p>
            <p className="text-sm text-gray-400">076 173 6756</p>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Lenzora.lk — All rights reserved.
        </div>
      </div>
    </footer>
  )
}
