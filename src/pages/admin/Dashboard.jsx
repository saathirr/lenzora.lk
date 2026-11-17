import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiShoppingCart, HiCollection, HiPhotograph, HiMail, HiTrendingUp, HiSparkles } from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'

const periodLabels = { daily: 'Today', weekly: 'This Week', monthly: 'This Month', date: 'Pick Date', all: 'All Time' }

function CountUp({ value, duration = 0.9 }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let raf
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.floor(value * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return <span className="tabular-nums">{display.toLocaleString()}</span>
}

export default function AdminDashboard() {
  const { orders, services, portfolio, messages, sales, frames, dataLoading } = useApp()
  const [period, setPeriod] = useState('monthly')
  const [customDate, setCustomDate] = useState(() => new Date().toISOString().slice(0, 10))

  const analytics = useMemo(() => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfDay)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const inPeriod = (dateStr, start) => {
      const d = new Date(dateStr)
      return d >= start && d <= now
    }

    const sameDate = (dateStr) => {
      const d = new Date(dateStr)
      return d.getFullYear() === new Date(customDate).getFullYear()
        && d.getMonth() === new Date(customDate).getMonth()
        && d.getDate() === new Date(customDate).getDate()
    }

    const filterByPeriod = (list) => {
      if (period === 'all') return list
      if (period === 'date') return list.filter((x) => sameDate(x.created_at))
      if (period === 'daily') return list.filter((x) => inPeriod(x.created_at, startOfDay))
      if (period === 'weekly') return list.filter((x) => inPeriod(x.created_at, startOfWeek))
      return list.filter((x) => inPeriod(x.created_at, startOfMonth))
    }

    const periodOrders = filterByPeriod(orders)

    const periodSales = filterByPeriod(sales)

    const periodFrames = filterByPeriod(frames)

    const orderTotal = periodOrders.reduce((s, o) => s + Number(o.amount), 0)
    const salesTotal = periodSales.reduce((s, sale) => s + Number(sale.amount), 0)
    const frameSalesTotal = periodFrames.reduce((s, f) => s + Number(f.price || 0), 0)
    const frameProfit = periodFrames.reduce((s, f) => s + Number(f.profit), 0)

    const totalSales = orderTotal + salesTotal + frameSalesTotal
    const totalProfit = orderTotal + salesTotal + frameProfit
    const completedIncome = periodOrders.filter((o) => o.status === 'Completed').reduce((s, o) => s + Number(o.amount), 0)
    const pendingIncome = periodOrders.filter((o) => o.status === 'Pending').reduce((s, o) => s + Number(o.amount), 0)

    const allTimeTotal = frames.reduce((s, f) => s + Number(f.profit), 0)
      + sales.reduce((s, sale) => s + Number(sale.amount), 0)
    const allTimeProfit = orders.reduce((s, o) => s + Number(o.amount), 0)
      + sales.reduce((s, sale) => s + Number(sale.amount), 0)
      + frames.reduce((s, f) => s + Number(f.profit), 0)

    return { total: totalSales, profit: totalProfit, completed: completedIncome, pending: pendingIncome, allTimeTotal, allTimeProfit, count: periodOrders.length + periodSales.length + periodFrames.length }
  }, [orders, sales, frames, period, customDate])

  const completedOrders = orders.filter((o) => o.status === 'Completed').length
  const unreadMessages = messages.filter((m) => !m.read).length

  const stats = [
    { icon: HiShoppingCart, label: 'Total Orders',   value: orders.length,    change: `${completedOrders} completed`, color: 'from-blue-500 to-blue-600',   glow: 'group-hover:shadow-blue-500/40',   darkCard: '#0f1e38', darkBorder: 'rgba(99,138,255,0.25)' },
    { icon: HiCollection,  label: 'Services',         value: services.length,  change: 'Active',                      color: 'from-primary to-primary-dark', glow: 'group-hover:shadow-primary/40',    darkCard: '#1a1230', darkBorder: 'rgba(139,92,246,0.25)' },
    { icon: HiPhotograph,  label: 'Portfolio Items',  value: portfolio.length, change: 'Total',                       color: 'from-pink-500 to-pink-600',    glow: 'group-hover:shadow-pink-500/40',   darkCard: '#2a1020', darkBorder: 'rgba(236,72,153,0.25)' },
    { icon: HiMail,        label: 'New Messages',     value: unreadMessages,   change: 'Unread',                      color: 'from-amber-500 to-amber-600',  glow: 'group-hover:shadow-amber-500/40',  darkCard: '#28180a', darkBorder: 'rgba(245,158,11,0.25)' },
  ]

  const completionPct = analytics.total ? Math.min(Math.round((analytics.pending / analytics.total) * 100), 100) : 0

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, type: 'spring', stiffness: 220, damping: 24 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2.5 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-dark">
            Dashboard
          </h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary animate-pulse-soft">
            <HiSparkles size={12} />
            Live
          </span>
        </div>
        <p className="text-gray-500 dark:text-slate-400">Welcome back! Here is your business overview.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 240, damping: 24 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className={`group relative p-5 rounded-2xl bg-white dark:border shadow-sm hover:shadow-xl ${s.glow} transition-all duration-300 overflow-hidden`}
              style={{ '--tw-shadow-color': 'transparent' }}
            >
              {/* dark-mode tinted card background */}
              <span
                className="pointer-events-none absolute inset-0 rounded-2xl hidden dark:block"
                style={{ background: s.darkCard, border: `1px solid ${s.darkBorder}` }}
              />
              <div className="pointer-events-none absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <Icon size={18} />
                </div>
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2.5 py-1 rounded-full border border-green-100 dark:border-green-500/20">
                  {s.change}
                </span>
              </div>
              <p className="relative text-2xl font-extrabold text-dark dark:text-white">
                <CountUp value={s.value} />
              </p>
              <p className="relative text-sm text-gray-500 dark:text-slate-400 mt-0.5">{s.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -22 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 180, damping: 26 }}
          className="bg-white dark:bg-[#181825] border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-indigo-900/10 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-dark dark:text-white flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                <HiTrendingUp size={17} />
              </span>
              Income Overview
            </h2>
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-1 bg-gray-100 dark:bg-white/8 rounded-full p-1 border border-gray-100 dark:border-white/10">
                {['daily', 'weekly', 'monthly', 'date', 'all'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition ${
                      period === p ? 'bg-white dark:bg-white/15 text-primary shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'
                    }`}
                  >
                    {periodLabels[p]}
                  </button>
                ))}
              </div>
              {period === 'date' && (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-white/10 text-gray-700 dark:text-slate-200 outline-none focus:border-primary"
                />
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-sky-700 text-white shadow-lg shadow-indigo-500/25">
                <div className="pointer-events-none absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-2xl animate-float-slow" />
                <p className="text-sm text-indigo-100">Total Sales ({periodLabels[period]})</p>
                <p className="text-3xl font-extrabold mt-1 tabular-nums">
                  LKR <CountUp value={analytics.total} />
                </p>
                <p className="text-xs text-indigo-100/80 mt-1">{analytics.count} transactions in period</p>
              </div>
              <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-700 text-white shadow-lg shadow-violet-500/25">
                <div className="pointer-events-none absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-2xl animate-float" />
                <p className="text-sm text-violet-100">All Time Sales</p>
                <p className="text-3xl font-extrabold mt-1 tabular-nums">
                  LKR <CountUp value={analytics.allTimeTotal} />
                </p>
                <p className="text-xs text-violet-100/80 mt-1">{orders.length + sales.length + frames.length} total records</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                <p className="text-sm text-gray-500 dark:text-emerald-200/70">Profit (design services + sales + frames)</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  LKR <CountUp value={analytics.profit} />
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20">
                <p className="text-sm text-gray-500 dark:text-teal-200/70">All Time Profit</p>
                <p className="text-xl font-bold text-teal-600 dark:text-teal-400">
                  LKR <CountUp value={analytics.allTimeProfit} />
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20">
                <p className="text-sm text-gray-500 dark:text-green-200/70">Completed</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  LKR <CountUp value={analytics.completed} />
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
                <p className="text-sm text-gray-500 dark:text-amber-200/70">Pending</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  LKR <CountUp value={analytics.pending} />
                </p>
              </div>
            </div>
            {analytics.total > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 mb-1.5">
                  <span>Pending share</span>
                  <span className="font-semibold">{completionPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-white/8 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPct}%` }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 22 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.26, type: 'spring', stiffness: 180, damping: 26 }}
          className="bg-white dark:bg-[#181825] border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-purple-900/10 p-6"
        >
          <h2 className="text-lg font-bold text-dark dark:text-white mb-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />
            Quick Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Total Orders',    value: orders.length,                                               lightBg: 'from-indigo-50 to-blue-50',   darkFrom: '#1e2a4a', darkTo: '#1a2540', border: 'border-indigo-100 dark:border-indigo-500/30',  numColor: 'text-indigo-600 dark:text-indigo-300',  dotColor: 'bg-indigo-500' },
              { label: 'Completed',       value: completedOrders,                                              lightBg: 'from-emerald-50 to-green-50', darkFrom: '#132e22', darkTo: '#102a1e', border: 'border-emerald-100 dark:border-emerald-500/30', numColor: 'text-emerald-600 dark:text-emerald-300', dotColor: 'bg-emerald-500' },
              { label: 'Pending',         value: orders.filter((o) => o.status === 'Pending').length,          lightBg: 'from-amber-50 to-orange-50',  darkFrom: '#2e200e', darkTo: '#2a1c0a', border: 'border-amber-100 dark:border-amber-500/30',   numColor: 'text-amber-600 dark:text-amber-300',    dotColor: 'bg-amber-500' },
              { label: 'Unread Messages', value: unreadMessages,                                               lightBg: 'from-sky-50 to-blue-50',      darkFrom: '#102030', darkTo: '#0d1c2a', border: 'border-sky-100 dark:border-sky-500/30',       numColor: 'text-sky-600 dark:text-sky-300',        dotColor: 'bg-sky-500' },
            ].map((q, i) => (
              <motion.div
                key={q.label}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + i * 0.08, type: 'spring', stiffness: 220, damping: 20 }}
                whileHover={{ y: -5, scale: 1.03 }}
                className={`group relative p-5 rounded-2xl bg-gradient-to-br ${q.lightBg} dark:border ${q.border} text-center overflow-hidden transition-all duration-300 hover:shadow-lg`}
                style={{ background: undefined }}
              >
                {/* dark-mode gradient background via inline style */}
                <span
                  className="pointer-events-none absolute inset-0 rounded-2xl hidden dark:block"
                  style={{ background: `linear-gradient(135deg, ${q.darkFrom}, ${q.darkTo})` }}
                />
                {/* subtle glow dot */}
                <span className={`pointer-events-none absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-30 ${q.dotColor}`} />
                <div className="relative">
                  <p className={`text-4xl font-black tabular-nums ${q.numColor}`}>
                    <CountUp value={q.value} duration={0.7} />
                  </p>
                  <p className="text-xs font-semibold text-gray-500 dark:text-slate-300 mt-2 uppercase tracking-wider">{q.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, type: 'spring', stiffness: 180, damping: 26 }}
        className="bg-white dark:bg-[#181825] border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 sm:p-6">
          <h2 className="text-lg font-bold text-dark flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent2 flex items-center justify-center text-white shadow-md">
              <HiShoppingCart size={17} />
            </span>
            Recent Orders
          </h2>
          <span className="text-sm text-gray-500 dark:text-slate-400">{orders.length} total</span>
        </div>
        <div className="overflow-x-auto admin-scroll -mx-4 sm:-mx-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/10 text-left text-gray-500 dark:text-slate-400">
                <th className="pb-3 font-medium px-4 sm:px-6">Order</th>
                <th className="pb-3 font-medium px-4 sm:px-6">Customer</th>
                <th className="pb-3 font-medium px-4 sm:px-6">Amount</th>
                <th className="pb-3 font-medium px-4 sm:px-6">Status</th>
                <th className="pb-3 font-medium px-4 sm:px-6">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o, i) => (
                <motion.tr
                  key={o.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  className="border-b border-gray-50 dark:border-[#1d1d24] hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 font-semibold text-primary px-4 sm:px-6">#{o.id}</td>
                  <td className="py-3 text-gray-600 dark:text-slate-300 px-4 sm:px-6">{o.customer_name}</td>
                  <td className="py-3 font-medium text-gray-800 dark:text-slate-200 px-4 sm:px-6 tabular-nums">LKR {Number(o.amount).toLocaleString()}</td>
                  <td className="py-3 px-4 sm:px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      o.status === 'Completed' ? 'bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-400' :
                      o.status === 'In Progress' ? 'bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400' :
                      o.status === 'Cancelled' ? 'bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400' :
                      'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500 dark:text-slate-400 px-4 sm:px-6">
                    {o.created_at ? new Date(o.created_at).toLocaleDateString() : '-'}
                  </td>
                </motion.tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400 dark:text-slate-500">No orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}