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
    const totalProfit = orderTotal + frameProfit
    const completedIncome = periodOrders.filter((o) => o.status === 'Completed').reduce((s, o) => s + Number(o.amount), 0)
    const pendingIncome = periodOrders.filter((o) => o.status === 'Pending').reduce((s, o) => s + Number(o.amount), 0)

    const allTimeTotal = orders.reduce((s, o) => s + Number(o.amount), 0)
      + sales.reduce((s, sale) => s + Number(sale.amount), 0)
      + frames.reduce((s, f) => s + Number(f.price || 0), 0)
    const allTimeProfit = orders.reduce((s, o) => s + Number(o.amount), 0)
      + frames.reduce((s, f) => s + Number(f.profit), 0)

    return { total: totalSales, profit: totalProfit, completed: completedIncome, pending: pendingIncome, allTimeTotal, allTimeProfit, count: periodOrders.length + periodSales.length + periodFrames.length }
  }, [orders, sales, frames, period, customDate])

  const completedOrders = orders.filter((o) => o.status === 'Completed').length
  const unreadMessages = messages.filter((m) => !m.read).length

  const stats = [
    { icon: HiShoppingCart, label: 'Total Orders', value: orders.length, change: `${completedOrders} completed`, color: 'from-blue-500 to-blue-600', glow: 'group-hover:shadow-blue-500/30' },
    { icon: HiCollection, label: 'Services', value: services.length, change: 'Active', color: 'from-primary to-primary-dark', glow: 'group-hover:shadow-primary/30' },
    { icon: HiPhotograph, label: 'Portfolio Items', value: portfolio.length, change: 'Total', color: 'from-pink-500 to-pink-600', glow: 'group-hover:shadow-pink-500/30' },
    { icon: HiMail, label: 'New Messages', value: unreadMessages, change: 'Unread', color: 'from-amber-500 to-amber-600', glow: 'group-hover:shadow-amber-500/30' },
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
              className={`group relative p-5 rounded-2xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] shadow-sm hover:shadow-xl ${s.glow} transition-all duration-300`}
            >
              <div className="pointer-events-none absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <Icon size={18} />
                </div>
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2.5 py-1 rounded-full">
                  {s.change}
                </span>
              </div>
              <p className="text-2xl font-extrabold text-dark dark:text-white">
                <CountUp value={s.value} />
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400">{s.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -22 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 180, damping: 26 }}
          className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-dark flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-md">
                <HiTrendingUp size={17} />
              </span>
              Income Overview
            </h2>
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-1 bg-gray-100 dark:bg-white/5 rounded-full p-1 border border-gray-100 dark:border-white/5">
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
            <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 text-white shadow-lg shadow-green-500/20">
              <div className="pointer-events-none absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-2xl animate-float-slow" />
              <p className="text-sm text-white/80">Total Sales ({periodLabels[period]})</p>
              <p className="text-3xl font-extrabold mt-1">
                LKR <CountUp value={analytics.total} />
              </p>
              <p className="text-xs text-white/70 mt-1">{analytics.count} transactions in period</p>
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-sm text-white/80">All Time Sales</p>
                <p className="text-2xl font-extrabold mt-0.5">
                  LKR <CountUp value={analytics.allTimeTotal} />
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20">
                <p className="text-sm text-gray-500 dark:text-green-200/70">Profit (design services + frames)</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  LKR <CountUp value={analytics.profit} />
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20">
                <p className="text-sm text-gray-500 dark:text-green-200/70">All Time Profit</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
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
                <div className="h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
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
          className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm p-6"
        >
          <h2 className="text-lg font-bold text-dark mb-5">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Total Orders', value: orders.length, color: 'text-dark', grad: 'from-indigo-500 to-blue-600' },
              { label: 'Completed', value: completedOrders, color: 'text-green-600', grad: 'from-emerald-500 to-green-600' },
              { label: 'Pending', value: orders.filter((o) => o.status === 'Pending').length, color: 'text-amber-600', grad: 'from-amber-500 to-orange-600' },
              { label: 'Unread Messages', value: unreadMessages, color: 'text-blue-600', grad: 'from-sky-500 to-blue-600' },
            ].map((q, i) => (
              <motion.div
                key={q.label}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + i * 0.08, type: 'spring', stiffness: 220, damping: 20 }}
                whileHover={{ y: -4 }}
                className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/5 border border-gray-100 dark:border-white/5 text-center"
              >
                <p className={`text-3xl font-extrabold ${q.color} dark:text-white`}>
                  <CountUp value={q.value} duration={0.7} />
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{q.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, type: 'spring', stiffness: 180, damping: 26 }}
        className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm overflow-hidden"
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
              <tr className="border-b border-gray-100 dark:border-[#262626] text-left text-gray-500 dark:text-slate-400">
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