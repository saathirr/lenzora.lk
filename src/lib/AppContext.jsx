import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'
import {
  fetchServices, createService, updateService, deleteService,
  fetchPortfolio, createPortfolioItem, deletePortfolioItem,
  fetchProducts, createProduct, updateProduct, deleteProduct,
  fetchOrders, createOrder, updateOrder,
  fetchSales, createSale, deleteSale,
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
  const [messages, setMessages] = useState([])
  const [settings, setSettings] = useState({
    id: 1,
    theme: 'light',
    site_name: 'Lenzora',
    whatsapp: '94717336756',
    contact_email: 'hello@lenzora.lk',
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
      const [s, p, pr, o, m, sal, st] = await Promise.all([
        fetchServices(),
        fetchPortfolio(),
        fetchProducts(),
        fetchOrders(),
        fetchMessages(),
        fetchSales(),
        fetchSiteSettings(),
      ])
      setServices(s)
      setPortfolio(p)
      setProducts(pr)
      setOrders(o)
      setMessages(m)
      setSales(sal)
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
    const root = document.documentElement
    if (settings.theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [settings.theme])

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
      messages, setMessages,
      settings, setSettings, updateSiteSettings,
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
