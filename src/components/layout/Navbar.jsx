import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiMenu, HiX, HiUser, HiLogout, HiShoppingCart, HiMail, HiSun, HiMoon } from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'
import LiveClock from '../ui/LiveClock'
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
  const { user, profile, signOut, settings, toggleTheme } = useApp()
  const navigate = useNavigate()
  const isDark = settings.theme === 'dark'

  const handleSignOut = async () => {
    await signOut()
    setDropdownOpen(false)
    setOpen(false)
    navigate('/')
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() || 'U'

  const logoUrl = settings.logo_url || defaultLogo
  const siteName = settings.site_name || 'Lenzora'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 dark:bg-[#0c0c0c]/85 backdrop-blur-xl border-b border-gray-100 dark:border-white/10 transition-colors duration-300 shadow-sm shadow-black/5 dark:shadow-black/40">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" aria-hidden />
      {settings.announcement_enabled && settings.announcement_text && (
        <div className="bg-gradient-to-r from-primary via-primary-dark to-dark text-white text-center text-sm font-medium px-4 py-1.5">
          {settings.announcement_text}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <span className="relative h-12 sm:h-14 px-2 bg-white rounded-xl shadow-md shadow-primary/10 ring-1 ring-black/5 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/20">
              <img src={logoUrl} alt={siteName} className="h-9 sm:h-11 max-w-[170px] sm:max-w-[200px] object-contain" />
            </span>
            <span className="hidden sm:flex flex-col leading-none">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent2 bg-clip-text text-transparent">
                {siteName}
                {!siteName.toLowerCase().endsWith('.lk') && <span className="text-secondary">.lk</span>}
              </span>
              <span className="text-[10px] uppercase tracking-[0.22em] text-gray-400 dark:text-slate-400 font-semibold mt-1">
                Frames · Design · Print
              </span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-accent2 text-white shadow-lg shadow-primary/25'
                      : 'text-gray-600 dark:text-slate-300 hover:text-primary hover:bg-primary/5'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LiveClock className="hidden lg:inline-flex text-gray-700 dark:text-slate-300" />
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 dark:border-white/15 text-gray-600 dark:text-slate-300 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isDark ? 'moon' : 'sun'}
                  initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex"
                >
                  {isDark ? <HiMoon size={17} /> : <HiSun size={17} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
            {user ? (
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent2 text-white text-sm font-bold flex items-center justify-center hover:shadow-lg hover:shadow-primary/30 transition shadow-md shadow-primary/20 ring-2 ring-white/20"
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
                        className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl z-20 py-2"
                      >
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                          <p className="text-sm font-medium text-dark truncate">{profile?.full_name || 'User'}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={() => { setDropdownOpen(false); navigate('/my-orders') }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:pl-5 transition-all flex items-center gap-2"
                        >
                          <HiShoppingCart size={16} />
                          My Orders
                        </button>
                        <button
                          onClick={() => { setDropdownOpen(false); navigate('/my-messages') }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:pl-5 transition-all flex items-center gap-2"
                        >
                          <HiMail size={16} />
                          My Messages
                        </button>
                        {profile?.role === 'admin' && (
                          <button
                            onClick={() => { setDropdownOpen(false); navigate('/admin') }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:pl-5 transition-all flex items-center gap-2"
                          >
                            <HiUser size={16} />
                            Admin Panel
                          </button>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 hover:pl-5 transition-all flex items-center gap-2"
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
                  className="text-sm font-semibold text-gray-600 dark:text-slate-300 hover:text-primary transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent2 text-white text-sm font-bold rounded-full hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 text-gray-700 dark:text-slate-200"
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
                {open ? <HiX size={26} /> : <HiMenu size={26} />}
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
            className="md:hidden bg-white dark:bg-[#101010] border-t border-gray-100 dark:border-white/10 px-4 shadow-xl overflow-hidden"
          >
            <div className="py-2">
              <div className="flex items-center justify-between py-2 mb-1">
                <span className="text-sm font-medium text-gray-600 dark:text-slate-300">
                  {isDark ? 'Dark mode' : 'Light mode'}
                </span>
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="p-2 rounded-full border border-gray-200 dark:border-white/15 text-gray-600 dark:text-slate-300 hover:text-primary hover:border-primary/40 transition-colors"
                >
                  {isDark ? <HiMoon size={18} /> : <HiSun size={18} />}
                </button>
              </div>
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
                      `block py-3 px-3 rounded-xl text-sm font-semibold transition ${
                        isActive
                          ? 'bg-gradient-to-r from-primary to-accent2 text-white'
                          : 'text-gray-600 dark:text-slate-300 hover:bg-primary/5 hover:text-primary'
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                </motion.div>
              ))}
              {user ? (
                <>
                  <div className="border-t border-gray-100 dark:border-white/10 pt-3 mt-2">
                    <p className="text-sm font-medium text-dark px-3">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-gray-400 mb-3 px-3">{user.email}</p>
                    <Link
                      to="/my-orders"
                      onClick={() => setOpen(false)}
                      className="block px-5 py-2.5 text-sm font-semibold text-center text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-white/5 rounded-full mb-2"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/my-messages"
                      onClick={() => setOpen(false)}
                      className="block px-5 py-2.5 text-sm font-semibold text-center text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-white/5 rounded-full mb-2"
                    >
                      My Messages
                    </Link>
                    {profile?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className="block px-5 py-2.5 text-sm font-semibold text-center text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-white/5 rounded-full mb-2"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full px-5 py-2.5 text-sm font-semibold text-center text-red-600 bg-red-50 dark:bg-red-500/10 rounded-full"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-100 dark:border-white/10 pt-3 mt-2 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="block px-5 py-2.5 text-sm font-semibold text-center text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-white/5 rounded-full"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="block px-5 py-2.5 bg-gradient-to-r from-primary to-accent2 text-white text-sm font-semibold rounded-full text-center"
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
