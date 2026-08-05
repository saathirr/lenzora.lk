import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import { useApp } from '../../lib/AppContext'

export default function Layout() {
  const { settings } = useApp()
  const hasAnnouncement = settings.announcement_enabled && settings.announcement_text

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className={`flex-1 ${hasAnnouncement ? 'pt-24' : 'pt-16'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}