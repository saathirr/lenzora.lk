import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'
import ScrollProgress from '../ui/ScrollProgress'
import PageTransition from '../ui/PageTransition'
import { useApp } from '../../lib/AppContext'

export default function Layout() {
  const { settings } = useApp()
  const location = useLocation()
  const hasAnnouncement = settings.announcement_enabled && settings.announcement_text

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollProgress />
      <Navbar />
      <main className={`flex-1 ${hasAnnouncement ? 'pt-24' : 'pt-16'}`}>
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}