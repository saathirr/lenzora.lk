import { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiMenu, HiX, HiHome, HiCollection, HiShoppingCart, HiPhotograph,
  HiCube, HiMail, HiLogout, HiBadgeCheck, HiCog, HiTemplate, HiUserGroup,
  HiClock, HiShieldCheck, HiCash,
  HiSparkles, HiSun, HiMoon, HiArrowUp, HiAdjustments, HiDocumentText, HiTrendingUp,
} from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'
import defaultLogo from '../../assets/lenzora-logo.png'
import LiveClock from '../ui/LiveClock'

const sidebarLinks = [
  { to: '/admin', icon: HiHome, label: 'Dashboard', end: true },
  { to: '/admin/orders', icon: HiShoppingCart, label: 'Orders' },
  { to: '/admin/services', icon: HiCollection, label: 'Services' },
  { to: '/admin/portfolio', icon: HiPhotograph, label: 'Portfolio' },
  { to: '/admin/products', icon: HiCube, label: 'Products' },
  { to: '/admin/sales', icon: HiBadgeCheck, label: 'Sales' },
  { to: '/admin/expenses', icon: HiCash, label: 'Expenses' },
  { to: '/admin/profit', icon: HiTrendingUp, label: 'Profit' },
  { to: '/admin/invoices', icon: HiDocumentText, label: 'Invoices' },
  { to: '/admin/frames', icon: HiTemplate, label: 'Frames' },
  { to: '/admin/frames-settings', icon: HiAdjustments, label: 'Frames Setting' },
  { to: '/admin/settings', icon: HiCog, label: 'Settings' },
  { to: '/admin/messages', icon: HiMail, label: 'Messages' },
]

const superAdminLinks = [
  { to: '/admin', icon: HiShieldCheck, label: 'Super Dashboard', end: true },
  { to: '/admin/access', icon: HiUserGroup, label: 'Admin Access' },
  { to: '/admin/login-logs', icon: HiClock, label: 'Login Activity' },
  { to: '/admin/audit-logs', icon: HiShieldCheck, label: 'Change Log' },
]

const navItem = {
  hidden: { opacity: 0, x: -16 },
  show: (i) => ({ opacity: 1, x: 0, transition: { delay: 0.04 + i * 0.04, type: 'spring', stiffness: 300, damping: 26 } }),
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const scrollRef = useRef(null)
  const profileMenuRef = useRef(null)
  const { user, profile, loading, signOut, settings, toggleTheme, isSuperAdmin } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const dark = settings?.theme === 'dark'

  useEffect(() => {
    if (!loading && (!user || (profile?.role !== 'admin' && profile?.role !== 'super_admin'))) {
      navigate('/login')
    }
  }, [user, profile, loading, navigate])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  const handleScroll = () => {
    const top = scrollRef.current?.scrollTop || 0
    setShowTop(top > 420)
  }

  useEffect(() => {
    if (!profileOpen) return
    const onClick = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [profileOpen])

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (loading) return null
  if (!user || (profile?.role !== 'admin' && profile?.role !== 'super_admin')) return null

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A'

  return (
    <div className={`relative h-screen h-dvh flex overflow-hidden transition-colors duration-500 ${dark ? 'bg-[#0a0a0a]' : 'bg-[#f4f5fa]'}`}>
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
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-40 h-screen h-dvh w-72 shrink-0 text-white flex flex-col
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
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1.5 overflow-hidden shadow-lg shadow-black/20">
                <img src={settings.logo_url || defaultLogo} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent2 bg-clip-text text-transparent">
                  {settings.site_name || 'Lenzora'}
                  {!settings.site_name?.toLowerCase().endsWith('.lk') && (
                    <span className="text-secondary">.lk</span>
                  )}
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

        <nav className="relative z-10 p-4 space-y-1.5 flex-1 overflow-y-auto min-h-0 admin-scroll">
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
          {isSuperAdmin && (
            <>
              <div className="pt-4 pb-1 px-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent2/20 text-accent3 border border-accent3/20">
                  <HiShieldCheck size={11} />
                  Super Admin
                </span>
              </div>
              {superAdminLinks.map((l, i) => (
                <motion.div key={l.to} variants={navItem} initial="hidden" animate="show" custom={i + sidebarLinks.length}>
                  <NavLink
                    to={l.to}
                    onClick={() => setSidebarOpen(false)}
                    className="group relative block"
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId="superAdminActivePill"
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent2 to-accent3 shadow-lg shadow-accent2/40"
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
            </>
          )}
        </nav>

        <div className="relative z-10 p-4 border-t border-white/10 space-y-4">
          <div className="px-1">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent2 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-primary/25 shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{profile?.full_name || 'Admin'}</p>
                <span className={`inline-flex mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${isSuperAdmin ? 'bg-accent2/20 text-accent3' : 'bg-primary/20 text-secondary'}`}>
                  {isSuperAdmin ? 'Super Admin' : 'Admin'}
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
          bg-white/75 dark:bg-[#141414]/70 backdrop-blur-xl
          border-b border-gray-100 dark:border-[#262626] transition-colors duration-500`}>
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
            <LiveClock className="hidden md:inline-flex text-gray-700 dark:text-slate-300" />
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:text-primary hover:border-primary/40 transition"
            >
              {dark ? <HiMoon size={18} /> : <HiSun size={18} />}
            </button>
            <div className="relative">
              <button
                onClick={() => setProfileOpen((o) => !o)}
                aria-label="Profile menu"
                className="flex items-center gap-3 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent2 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary/25">
                  {initials}
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-slate-200 hidden sm:block">
                  {profile?.full_name || 'Admin'}
                </span>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    ref={profileMenuRef}
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-56 z-50 rounded-2xl bg-white dark:bg-[#1a1a1f] border border-gray-100 dark:border-[#2a2a2f] shadow-xl shadow-black/10 p-2"
                  >
                    <div className="px-3 py-2.5 mb-1 rounded-xl bg-gray-50 dark:bg-white/5">
                      <p className="text-sm font-bold text-dark dark:text-white truncate">{profile?.full_name || 'Admin'}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{profile?.email || user?.email || ''}</p>
                      <span className={`inline-flex mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${isSuperAdmin ? 'bg-accent2/20 text-accent3' : 'bg-primary/10 text-primary'}`}>
                        {isSuperAdmin ? 'Super Admin' : 'Admin'}
                      </span>
                    </div>
                    <button
                      onClick={() => { setProfileOpen(false); navigate('/') }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-white/10 transition"
                    >
                      <HiLogout size={17} className="text-gray-500" />
                      Back to Site
                    </button>
                    <button
                      onClick={() => { setProfileOpen(false); handleSignOut() }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                    >
                      <HiLogout size={17} />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main
          ref={scrollRef}
          onScroll={handleScroll}
          className="admin-scroll relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8"
        >
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

          <AnimatePresence>
            {showTop && (
              <motion.button
                initial={{ opacity: 0, y: 16, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.8 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={scrollToTop}
                aria-label="Back to top"
                className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-gradient-to-br from-primary to-accent2 text-white shadow-lg shadow-primary/30 flex items-center justify-center hover:shadow-xl hover:shadow-primary/40 transition-shadow"
              >
                <HiArrowUp size={18} />
              </motion.button>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}