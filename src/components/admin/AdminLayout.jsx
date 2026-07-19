import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { HiMenu, HiX, HiHome, HiCollection, HiShoppingCart, HiPhotograph, HiCube, HiMail, HiLogout } from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'

const sidebarLinks = [
  { to: '/admin', icon: HiHome, label: 'Dashboard', end: true },
  { to: '/admin/orders', icon: HiShoppingCart, label: 'Orders' },
  { to: '/admin/services', icon: HiCollection, label: 'Services' },
  { to: '/admin/portfolio', icon: HiPhotograph, label: 'Portfolio' },
  { to: '/admin/products', icon: HiCube, label: 'Products' },
  { to: '/admin/messages', icon: HiMail, label: 'Messages' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, profile, loading, signOut } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      navigate('/login')
    }
  }, [user, profile, loading, navigate])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (loading) return null
  if (!user || profile?.role !== 'admin') return null

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-dark text-white transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-primary">Lenzora</span>
              <span className="text-xs text-gray-500">.lk</span>
              <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-white/10 rounded">
              <HiX size={20} />
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {sidebarLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-gray-300 hover:bg-white/10'
                }`
              }
            >
              <l.icon size={18} />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 space-y-1">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-4 py-3 w-full text-sm text-gray-300 hover:bg-white/10 rounded-xl transition"
          >
            <HiLogout size={18} />
            Back to Site
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full text-sm text-red-400 hover:bg-white/10 rounded-xl transition"
          >
            <HiLogout size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <HiMenu size={22} />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{profile?.full_name || 'Admin'}</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
