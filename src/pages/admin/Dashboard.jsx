import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { HiShoppingCart, HiCollection, HiPhotograph, HiMail, HiTrendingUp } from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'

const periodLabels = { daily: 'Today', weekly: 'This Week', monthly: 'This Month' }

export default function AdminDashboard() {
  const { orders, services, portfolio, messages, dataLoading } = useApp()
  const [period, setPeriod] = useState('monthly')

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

    const periodOrders = orders.filter((o) => {
      if (period === 'daily') return inPeriod(o.created_at, startOfDay)
      if (period === 'weekly') return inPeriod(o.created_at, startOfWeek)
      return inPeriod(o.created_at, startOfMonth)
    })

    const totalIncome = periodOrders.reduce((s, o) => s + Number(o.amount), 0)
    const completedIncome = periodOrders.filter((o) => o.status === 'Completed').reduce((s, o) => s + Number(o.amount), 0)
    const pendingIncome = periodOrders.filter((o) => o.status === 'Pending').reduce((s, o) => s + Number(o.amount), 0)

    return { total: totalIncome, completed: completedIncome, pending: pendingIncome, count: periodOrders.length }
  }, [orders, period])

  const completedOrders = orders.filter((o) => o.status === 'Completed').length
  const unreadMessages = messages.filter((m) => !m.read).length

  const stats = [
    { icon: HiShoppingCart, label: 'Total Orders', value: orders.length.toString(), change: `${completedOrders} completed`, color: 'from-blue-500 to-blue-600' },
    { icon: HiCollection, label: 'Services', value: services.length.toString(), change: 'Active', color: 'from-primary to-primary-dark' },
    { icon: HiPhotograph, label: 'Portfolio Items', value: portfolio.length.toString(), change: 'Total', color: 'from-pink-500 to-pink-600' },
    { icon: HiMail, label: 'New Messages', value: unreadMessages.toString(), change: 'Unread', color: 'from-amber-500 to-amber-600' },
  ]

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here is your overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white`}>
                  <Icon size={18} />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  {s.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-dark">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-dark flex items-center gap-2">
              <HiTrendingUp className="text-primary" />
              Income Overview
            </h2>
            <div className="flex gap-1 bg-gray-100 rounded-full p-1">
              {['daily', 'weekly', 'monthly'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition ${
                    period === p ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {periodLabels[p]}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div>
                <p className="text-sm text-gray-500">Total Income ({periodLabels[period]})</p>
                <p className="text-2xl font-bold text-green-600">LKR {analytics.total.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">{analytics.count} orders</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-xl font-bold text-blue-600">LKR {analytics.completed.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl">
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-xl font-bold text-amber-600">LKR {analytics.pending.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-dark mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-3xl font-bold text-dark">{orders.length}</p>
              <p className="text-sm text-gray-500">Total Orders</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-3xl font-bold text-green-600">{completedOrders}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-3xl font-bold text-amber-600">{orders.filter((o) => o.status === 'Pending').length}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-3xl font-bold text-blue-600">{unreadMessages}</p>
              <p className="text-sm text-gray-500">Unread Messages</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-dark">Recent Orders</h2>
          <span className="text-sm text-gray-500">{orders.length} total</span>
        </div>
        <div className="overflow-x-auto -mx-4 sm:-mx-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="pb-3 font-medium px-4 sm:px-6">Order</th>
                <th className="pb-3 font-medium px-4 sm:px-6">Customer</th>
                <th className="pb-3 font-medium px-4 sm:px-6">Amount</th>
                <th className="pb-3 font-medium px-4 sm:px-6">Status</th>
                <th className="pb-3 font-medium px-4 sm:px-6">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id} className="border-b border-gray-50">
                  <td className="py-3 font-medium text-dark px-4 sm:px-6">#{o.id}</td>
                  <td className="py-3 text-gray-600 px-4 sm:px-6">{o.customer_name}</td>
                  <td className="py-3 text-gray-600 px-4 sm:px-6">LKR {Number(o.amount).toLocaleString()}</td>
                  <td className="py-3 px-4 sm:px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      o.status === 'Completed' ? 'bg-green-100 text-green-600' :
                      o.status === 'In Progress' ? 'bg-blue-100 text-blue-600' :
                      o.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500 px-4 sm:px-6">
                    {o.created_at ? new Date(o.created_at).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400">No orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
