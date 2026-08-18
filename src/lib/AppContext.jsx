import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'
import {
  fetchServices, createService, updateService, deleteService,
  fetchPortfolio, createPortfolioItem, deletePortfolioItem,
  fetchProducts, createProduct, updateProduct, deleteProduct,
  fetchOrders, createOrder, updateOrder,
  fetchSales, createSale, deleteSale,
  fetchFrames, createFrame, updateFrame, deleteFrame,
  fetchFrameCategories, createFrameCategory, updateFrameCategory, deleteFrameCategory,
  fetchMessages, createMessage, updateMessage,
  createConversation, addMessageToConversation,
  fetchMyConversations, fetchMessagesByConversation,
  fetchCustomerOrders,
  fetchSiteSettings, updateSiteSettings,
  subscribeToOrders,
} from './db'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [services, setServices] = useState([])
  const [portfolio, setPortfolio] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [sales, setSales] = useState([])
  const [frames, setFrames] = useState([])
  const [frameCategories, setFrameCategories] = useState([])
  const [messages, setMessages] = useState([])
  const [settings, setSettings] = useState({
    id: 1,
    theme: 'dark',
    site_name: 'Lenzora',
    tagline: 'Premium digital graphics services.',
    logo_url: '',
    whatsapp: '94717336756',
    contact_email: 'hello@lenzora.lk',
    facebook_url: 'https://facebook.com/lenzora.lk',
    instagram_url: 'https://instagram.com/lenzora.lk',
    announcement_enabled: false,
    announcement_text: '',
  })
  const [cart, setCart] = useState([])
  const [customerOrders, setCustomerOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [dataLoading, setDataLoading] = useState(true)

  const loadAllData = async () => {
    try {
      const [s, p, pr, o, m, sal, st, fr, fc] = await Promise.all([
        fetchServices(),
        fetchPortfolio(),
        fetchProducts(),
        fetchOrders(),
        fetchMessages(),
        fetchSales(),
        fetchSiteSettings(),
        fetchFrames(),
        fetchFrameCategories().catch(() => []),
      ])
      setServices(s)
      setPortfolio(p)
      setProducts(pr)
      setOrders(o)
      setMessages(m)
      setSales(sal)
      setFrames(fr)
      setFrameCategories(fc || [])
      if (st) setSettings((prev) => ({ ...prev, ...st }))
    } catch (err) {
      console.error('Failed to load data:', err?.message || err)
    }
    setDataLoading(false)
  }

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        if (session?.user) {
          const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
          setProfile(data)
        }
      } catch (err) {
        console.error('Auth session error:', err)
      }
      setLoading(false)
    }
    getSession()
    loadAllData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setUser(session?.user ?? null)
        if (session?.user) {
          const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
          setProfile(data)
        } else {
          setProfile(null)
        }
      } catch (err) {
        console.error('Auth state change error:', err)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeToOrders((payload) => {
      if (payload.eventType === 'INSERT') {
        setOrders((prev) => [payload.new, ...prev])
      } else if (payload.eventType === 'UPDATE') {
        setOrders((prev) => prev.map((o) => (o.id === payload.new.id ? { ...o, ...payload.new } : o)))
      } else if (payload.eventType === 'DELETE') {
        setOrders((prev) => prev.filter((o) => o.id !== payload.old.id))
      }
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    let saved = localStorage.getItem('lenzora-theme')
    if (!saved) {
      saved = 'dark'
      localStorage.setItem('lenzora-theme', 'dark')
    }
    const root = document.documentElement
    root.classList.toggle('dark', saved === 'dark')
    if (saved !== settings.theme) {
      setSettings((prev) => ({ ...prev, theme: saved }))
    }
  }, [settings.theme])

  const toggleTheme = () => {
    const next = settings.theme === 'dark' ? 'light' : 'dark'
    setSettings((prev) => ({ ...prev, theme: next }))
    localStorage.setItem('lenzora-theme', next)
    updateSiteSettings(1, { theme: next }).catch(() => {})
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const addOrder = (order) => {
    setOrders((prev) => [order, ...prev])
    setCustomerOrders((prev) => [order, ...prev])
  }

  return (
    <AppContext.Provider value={{
      services, setServices,
      portfolio, setPortfolio,
      products, setProducts,
      orders, setOrders,
      sales, setSales,
      frames, setFrames,
      frameCategories, setFrameCategories,
      messages, setMessages,
      settings, setSettings, updateSiteSettings, toggleTheme,
      cart, setCart,
      customerOrders, setCustomerOrders,
      addOrder,
      user, profile, loading, signOut,
      dataLoading, loadAllData,
      createService, updateService, deleteService,
      createPortfolioItem, deletePortfolioItem,
      createProduct, updateProduct, deleteProduct,
      createOrder, updateOrder,
      createSale, deleteSale,
      createFrame, updateFrame, deleteFrame,
      createFrameCategory, updateFrameCategory, deleteFrameCategory,
      createMessage, updateMessage,
      createConversation, addMessageToConversation,
      fetchMyConversations, fetchMessagesByConversation,
      fetchCustomerOrders,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
