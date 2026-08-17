import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiMenu, HiX, HiUser, HiLogout, HiShoppingCart, HiMail } from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'
import defaultLogo from '../../assets/lenzora-logo.png'

const links = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/shop', label: 'Shop' },
  { to: '/frames', label: 'Frames' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, profile, signOut, settings } = useApp()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    setDropdownOpen(false)
    setOpen(false)
    navigate('/')
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() || 'U'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 dark:border-[#2b2b35] transition-colors">
      {settings.announcement_enabled && settings.announcement_text && (
        <div className="bg-gradient-to-r from-primary via-primary-dark to-dark text-white text-center text-sm font-medium px-4 py-1.5">
          {settings.announcement_text}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt={settings.site_name || 'Lenzora'} className="h-10 max-w-[170px] object-contain transition-transform duration-300 group-hover:scale-105" />
            ) : (
              <>
                <img src={defaultLogo} alt={settings.site_name || 'Lenzora'} className="h-9 sm:h-10 max-w-[170px] object-contain transition-transform duration-300 group-hover:scale-105" />
                {!settings.site_name?.toLowerCase().endsWith('.lk') && (
                  <span className="text-xs text-gray-400 mt-2">.lk</span>
                )}
              </>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `relative text-sm font-medium transition whitespace-nowrap py-1 ${
                    isActive
                      ? 'text-primary'
                      : 'text-gray-600 hover:text-primary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-primary to-accent2"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                    {l.label}
                  </>
                )}
              </NavLink>
            ))}
            {user ? (
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent2 text-white text-sm font-bold flex items-center justify-center hover:shadow-lg hover:shadow-primary/30 transition shadow-md shadow-primary/20"
                >
                  {initials}
                </motion.button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.16 }}
                        className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-2"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-dark truncate">{profile?.full_name || 'User'}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={() => { setDropdownOpen(false); navigate('/my-orders') }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:pl-5 transition-all flex items-center gap-2"
                        >
                          <HiShoppingCart size={16} />
                          My Orders
                        </button>
                        <button
                          onClick={() => { setDropdownOpen(false); navigate('/my-messages') }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:pl-5 transition-all flex items-center gap-2"
                        >
                          <HiMail size={16} />
                          My Messages
                        </button>
                        {profile?.role === 'admin' && (
                          <button
                            onClick={() => { setDropdownOpen(false); navigate('/admin') }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:pl-5 transition-all flex items-center gap-2"
                          >
                            <HiUser size={16} />
                            Admin Panel
                          </button>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:pl-5 transition-all flex items-center gap-2"
                        >
                          <HiLogout size={16} />
                          Sign Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-primary transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? 'x' : 'menu'}
                initial={{ rotate: -40, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 40, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="flex"
              >
                {open ? <HiX size={24} /> : <HiMenu size={24} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden bg-white border-t border-gray-100 px-4 shadow-xl overflow-hidden"
          >
            <div className="py-2">
              {links.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 + i * 0.04 }}
                >
                  <NavLink
                    to={l.to}
                    end={l.to === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block py-2.5 text-sm font-medium ${
                        isActive ? 'text-primary' : 'text-gray-600'
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                </motion.div>
              ))}
              {user ? (
                <>
                  <div className="border-t border-gray-100 pt-3 mt-2">
                    <p className="text-sm font-medium text-dark">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-gray-400 mb-3">{user.email}</p>
                    <Link
                      to="/my-orders"
                      onClick={() => setOpen(false)}
                      className="block px-5 py-2 text-sm font-semibold text-center text-gray-700 bg-gray-100 rounded-full mb-2"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/my-messages"
                      onClick={() => setOpen(false)}
                      className="block px-5 py-2 text-sm font-semibold text-center text-gray-700 bg-gray-100 rounded-full mb-2"
                    >
                      My Messages
                    </Link>
                    {profile?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className="block px-5 py-2 text-sm font-semibold text-center text-gray-700 bg-gray-100 rounded-full mb-2"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full px-5 py-2 text-sm font-semibold text-center text-red-600 bg-red-50 rounded-full"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-100 pt-3 mt-2 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="block px-5 py-2 text-sm font-semibold text-center text-gray-700 bg-gray-100 rounded-full"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="block px-5 py-2 bg-primary text-white text-sm font-semibold rounded-full text-center"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}