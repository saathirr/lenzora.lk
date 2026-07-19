import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'

const AppContext = createContext()

const initialServices = [
  { id: 1, icon: 'HiPhotograph', name: 'Photo Editing', desc: 'Professional retouching, color grading, background removal, and restoration for personal or commercial use.', features: ['Color Correction', 'Skin Retouching', 'Background Removal', 'Object Removal', 'Restoration'], category: 'Editing', active: true },
  { id: 2, icon: 'HiColorSwatch', name: 'Graphic Design', desc: 'Eye-catching designs for print and digital banners, posters, flyers, business cards, and more.', features: ['Flyers & Posters', 'Business Cards', 'Social Media Posts', 'Banners', 'Presentations'], category: 'Design', active: true },
  { id: 3, icon: 'HiPencil', name: 'Brand Identity', desc: 'Complete branding solutions including logo design, color palettes, typography, and brand guidelines.', features: ['Logo Design', 'Brand Guidelines', 'Color Palette', 'Typography', 'Brand Assets'], category: 'Branding', active: true },
  { id: 4, icon: 'HiVideoCamera', name: 'Video Editing', desc: 'Short-form content, Instagram Reels, TikToks, promos, and event highlight edits.', features: ['Reels & Shorts', 'Color Grading', 'Transitions', 'Text Overlays', 'Audio Sync'], category: 'Video', active: true },
  { id: 5, icon: 'HiChartBar', name: 'Social Media Graphics', desc: 'Engaging visuals for Instagram, Facebook, LinkedIn, and TikTok that drive engagement.', features: ['Post Designs', 'Story Templates', 'Ad Creatives', 'Carousel Designs', 'Profile Branding'], category: 'Social', active: true },
  { id: 6, icon: 'HiTemplate', name: 'UI/UX Design', desc: 'Modern, user-friendly website and app mockups with clean aesthetics and smooth flows.', features: ['Wireframes', 'High-fidelity Mockups', 'Prototyping', 'Design Systems', 'Responsive Design'], category: 'Design', active: true },
]

const initialPortfolio = [
  { id: 1, src: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=600&fit=crop', title: 'Social Media Post', category: 'Graphic Design' },
  { id: 2, src: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=600&fit=crop', title: 'Brand Identity Pack', category: 'Branding' },
  { id: 3, src: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=600&fit=crop', title: 'Flyer Design', category: 'Graphic Design' },
  { id: 4, src: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=600&fit=crop', title: 'Color Grading', category: 'Photo Editing' },
  { id: 5, src: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&h=600&fit=crop', title: 'Instagram Template', category: 'Social Media' },
  { id: 6, src: 'https://images.unsplash.com/photo-1557838923-2985c318be48?w=600&h=600&fit=crop', title: 'Logo Design', category: 'Branding' },
  { id: 7, src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop', title: 'Portrait Retouch', category: 'Photo Editing' },
  { id: 8, src: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&h=600&fit=crop', title: 'Business Card', category: 'Graphic Design' },
]

const initialProducts = [
  { id: 1, name: 'Social Media Pack', price: 2500, desc: '5 custom Instagram post designs.', stock: 10 },
  { id: 2, name: 'Logo Package', price: 8000, desc: '3 logo concepts with revisions.', stock: 5 },
  { id: 3, name: 'Photo Retouch (10)', price: 5000, desc: 'Professional retouching for 10 images.', stock: 20 },
  { id: 4, name: 'Business Card Design', price: 3000, desc: 'Front & back design, print-ready.', stock: 15 },
  { id: 5, name: 'Brand Identity Kit', price: 15000, desc: 'Logo, palette, typography, mockups.', stock: 3 },
  { id: 6, name: 'Reel Edit (1 min)', price: 4000, desc: '1-minute Instagram Reel edit.', stock: 10 },
]

const initialOrders = [
  { id: '#001', customer: 'Sarah Perera', email: 'sarah@email.com', service: 'Logo Design', amount: 8000, status: 'In Progress', date: '2024-01-15' },
  { id: '#002', customer: 'Kavindu Silva', email: 'kavindu@email.com', service: 'Photo Retouch (10)', amount: 5000, status: 'Completed', date: '2024-01-14' },
  { id: '#003', customer: 'Dulani Fernando', email: 'dulani@email.com', service: 'Brand Identity Kit', amount: 15000, status: 'Pending', date: '2024-01-13' },
  { id: '#004', customer: 'Amila Jay', email: 'amila@email.com', service: 'Reel Edit', amount: 4000, status: 'Pending', date: '2024-01-12' },
  { id: '#005', customer: 'Nadee Perera', email: 'nadee@email.com', service: 'Social Media Pack', amount: 2500, status: 'Completed', date: '2024-01-11' },
]

const initialMessages = [
  { id: 1, name: 'Sarah Perera', email: 'sarah@email.com', subject: 'Logo Design Inquiry', message: 'Hi, I need a logo for my new startup. Can you help?', date: '2024-01-15', read: false },
  { id: 2, name: 'Kavindu Silva', email: 'kavindu@email.com', subject: 'Photo Editing', message: 'I have 50 product photos that need background removal. Price?', date: '2024-01-14', read: false },
  { id: 3, name: 'Dulani Fernando', email: 'dulani@email.com', subject: 'Brand Identity', message: 'Looking for a full brand identity package for my cafe.', date: '2024-01-13', read: true },
  { id: 4, name: 'Amila Jay', email: 'amila@email.com', subject: 'Video Edit', message: 'Need a 30s promo video edited for Instagram.', date: '2024-01-12', read: true },
]

export function AppProvider({ children }) {
  const [services, setServices] = useState(initialServices)
  const [portfolio, setPortfolio] = useState(initialPortfolio)
  const [products, setProducts] = useState(initialProducts)
  const [orders, setOrders] = useState(initialOrders)
  const [messages, setMessages] = useState(initialMessages)

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        setProfile(data)
      }
      setLoading(false)
    }
    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        setProfile(data)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AppContext.Provider value={{
      services, setServices,
      portfolio, setPortfolio,
      products, setProducts,
      orders, setOrders,
      messages, setMessages,
      user, profile, loading, signOut
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
