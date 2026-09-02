import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import AdminLayout from './components/admin/AdminLayout'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Gallery from './pages/Gallery'
import Shop from './pages/Shop'
import Frames from './pages/Frames'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import Checkout from './pages/Checkout'
import MyOrders from './pages/MyOrders'
import MyMessages from './pages/MyMessages'
import AdminDashboard from './pages/admin/Dashboard'
import AdminServices from './pages/admin/Services'
import AdminOrders from './pages/admin/Orders'
import AdminPortfolio from './pages/admin/Portfolio'
import AdminProducts from './pages/admin/Products'
import AdminMessages from './pages/admin/Messages'
import AdminSales from './pages/admin/Sales'
import AdminInvoices from './pages/admin/Invoices'
import AdminFrames from './pages/admin/Frames'
import AdminFramesSettings from './pages/admin/FramesSettings'
import AdminProfit from './pages/admin/Profit'
import AdminSettings from './pages/admin/Settings'
import AdminAccess from './pages/admin/Access'
import AdminLoginLogs from './pages/admin/LoginLogs'
import AdminAuditLogs from './pages/admin/AuditLogs'
import SuperDashboard from './pages/admin/SuperDashboard'
import RequireSuperAdmin from './components/admin/RequireSuperAdmin'
import { useApp } from './lib/AppContext'
import ScrollToTop from './components/ui/ScrollToTop'

function AdminIndex() {
  const { isSuperAdmin } = useApp()
  return isSuperAdmin ? <SuperDashboard /> : <AdminDashboard />
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="shop" element={<Shop />} />
          <Route path="frames" element={<Frames />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="my-orders" element={<MyOrders />} />
          <Route path="my-messages" element={<MyMessages />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminIndex />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="portfolio" element={<AdminPortfolio />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="sales" element={<AdminSales />} />
          <Route path="invoices" element={<AdminInvoices />} />
          <Route path="frames" element={<AdminFrames />} />
          <Route path="frames-settings" element={<AdminFramesSettings />} />
          <Route path="profit" element={<AdminProfit />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="access" element={<RequireSuperAdmin><AdminAccess /></RequireSuperAdmin>} />
          <Route path="login-logs" element={<RequireSuperAdmin><AdminLoginLogs /></RequireSuperAdmin>} />
          <Route path="audit-logs" element={<RequireSuperAdmin><AdminAuditLogs /></RequireSuperAdmin>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
