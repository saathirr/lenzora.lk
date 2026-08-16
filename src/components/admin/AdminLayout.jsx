import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiMenu, HiX, HiHome, HiCollection, HiShoppingCart, HiPhotograph,
  HiCube, HiMail, HiLogout, HiBadgeCheck, HiCog, HiTemplate,
  HiSun, HiMoon, HiSparkles,
} from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'

const sidebarLinks = [
  { to: '/admin', icon: HiHome, label: 'Dashboard', end: true },
  { to: '/admin/orders', icon: HiShoppingCart, label: 'Orders' },
  { to: '/admin/services', icon: HiCollection, label: 'Services' },
  { to: '/admin/portfolio', icon: HiPhotograph, label: 'Portfolio' },
  { to: '/admin/products', icon: HiCube, label: 'Products' },
  { to: '/admin/sales', icon: HiBadgeCheck, label: 'Sales' },
  { to: '/admin/frames', icon: HiTemplate, label: 'Frames' },
  { to: '/admin/settings', icon: HiCog, label: 'Settings' },
  { to: '/admin/messages', icon: HiMail, label: 'Messages' },
]

const navItem = {
  hidden: { opacity: 0, x: -16 },
  show: (i) => ({ opacity: 1, x: 0, transition: { delay: 0.04 + i * 0.04, type: 'spring', stiffness: 300, damping: 26 } }),
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, profile, loading, signOut, settings, setSettings, updateSiteSettings } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const dark = settings?.theme === 'dark'

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      navigate('/login')
    }
  }, [user, profile, loading, navigate])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const toggleTheme = async () => {
    const next = dark ? 'light' : 'dark'
    setSettings((prev) => ({ ...prev, theme: next }))
    try {
      await updateSiteSettings(1, { theme: next })
    } catch (err) {
      console.error('Failed to save theme:', err)
    }
  }

  if (loading) return null
  if (!user || profile?.role !== 'admin') return null

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A'

  return (
    <div className={`relative min-h-screen flex overflow-hidden transition-colors duration-500 ${dark ? 'bg-[#0d0d12]' : 'bg-[#f4f5fa]'}`}>
      {/* Decorative ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className={`absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full blur-3xl opacity-25 animate-float-slow ${dark ? 'bg-accent2/20' : 'bg-primary/20'}`} />
        <div className={`absolute top-1/3 -right-40 w-[420px] h-[420px] rounded-full blur-3xl opacity-20 animate-float ${dark ? 'bg-accent3/20' : 'bg-accent2/20'}`} />
        <div className={`absolute bottom-0 left-1/3 w-[380px] h-[380px] rounded-full blur-3xl opacity-15 animate-float-slow ${dark ? 'bg-primary/15' : 'bg-accent3/15'}`} />
      </div>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-40 h-screen w-72 shrink-0 text-white flex flex-col
          bg-gradient-to-b from-[#161022] via-[#150f22] to-[#0c0814]
          shadow-2xl shadow-black/40 transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Sidebar glow accents */}
        <div className="pointer-events-none absolute overflow-hidden inset-0" aria-hidden>
          <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-primary/25 blur-3xl animate-float-slow" />
          <div className="absolute bottom-10 -left-24 w-64 h-64 rounded-full bg-accent2/25 blur-3xl animate-float" />
        </div>

        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent2 flex items-center justify-center shadow-lg shadow-primary/30">
                <HiSparkles size={20} className="text-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent2 bg-clip-text text-transparent">
                  Lenzora<span className="text-secondary">.lk</span>
                </span>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-medium">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg transition"
            >
              <HiX size={20} />
            </button>
          </div>
        </div>

        <nav className="relative z-10 p-4 space-y-1.5 flex-1 overflow-y-auto">
          {sidebarLinks.map((l, i) => (
            <motion.div key={l.to} variants={navItem} initial="hidden" animate="show" custom={i}>
              <NavLink
                to={l.to}
                end={l.end}
                onClick={() => setSidebarOpen(false)}
                className="group relative block"
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="adminActivePill"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary via-accent to-primary-dark shadow-lg shadow-primary/40"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span
                      className={`relative z-10 flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition
                        ${isActive
                          ? 'text-white'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                    >
                      <l.icon size={18} className={`transition ${isActive ? '' : 'group-hover:scale-110'}`} />
                      {l.label}
                      {!isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition" />
                      )}
                    </span>
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        <div className="relative z-10 p-4 border-t border-white/10 space-y-4">
          <div className="px-1">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent2 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-primary/25 shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{profile?.full_name || 'Admin'}</p>
                <span className="inline-flex mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-primary/20 text-secondary">
                  Admin
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 px-4 py-2.5 w-full text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition"
            >
              <HiLogout size={17} />
              Back to Site
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2.5 w-full text-sm text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-xl transition"
            >
              <HiLogout size={17} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        <header className={`sticky top-0 z-30 h-16 px-4 sm:px-6 flex items-center justify-between
          bg-white/75 dark:bg-[#17171d]/70 backdrop-blur-xl
          border-b border-gray-100 dark:border-[#2b2b35] transition-colors duration-500`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition"
            >
              <HiMenu size={22} />
            </button>
            <div className="hidden lg:flex items-center gap-2 text-sm text-gray-400 dark:text-slate-500">
              <span className="text-gray-300 dark:text-slate-600">Admin</span>
              <span>/</span>
              <span className="capitalize text-primary font-semibold">
                {location.pathname === '/admin' ? 'Dashboard' : sidebarLinks.find((l) => location.pathname.startsWith(l.to))?.label || 'Panel'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              onClick={toggleTheme}
              whileTap={{ scale: 0.82 }}
              aria-label="Toggle theme"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition
                ${dark
                  ? 'bg-white/10 text-amber-300 hover:bg-white/20'
                  : 'bg-gray-100 text-slate-500 hover:bg-gray-200'}`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={dark ? 'moon' : 'sun'}
                  initial={{ rotate: -120, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 120, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.25 }}
                  className="flex"
                >
                  {dark ? <HiMoon size={18} /> : <HiSun size={18} className="text-amber-500" />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent2 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary/25">
                {initials}
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-slate-200 hidden sm:block">
                {profile?.full_name || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 18, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.995 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}