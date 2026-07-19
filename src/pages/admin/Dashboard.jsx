import { motion } from 'framer-motion'
import { HiShoppingCart, HiCollection, HiPhotograph, HiMail } from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'

const statusColors = {
  'In Progress': 'bg-blue-100 text-blue-600',
  Completed: 'bg-green-100 text-green-600',
  Pending: 'bg-amber-100 text-amber-600',
}

export default function AdminDashboard() {
  const { orders, services, portfolio, messages } = useApp()
  const completedOrders = orders.filter((o) => o.status === 'Completed').length
  const unreadMessages = messages.filter((m) => !m.read).length

  const stats = [
    { icon: HiShoppingCart, label: 'Total Orders', value: orders.length.toString(), change: `${completedOrders} completed`, color: 'from-blue-500 to-blue-600' },
    { icon: HiCollection, label: 'Services', value: services.length.toString(), change: 'Active', color: 'from-primary to-primary-dark' },
    { icon: HiPhotograph, label: 'Portfolio Items', value: portfolio.length.toString(), change: 'Total', color: 'from-pink-500 to-pink-600' },
    { icon: HiMail, label: 'New Messages', value: unreadMessages.toString(), change: 'Unread', color: 'from-amber-500 to-amber-600' },
  ]

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
                <th className="pb-3 font-medium px-4 sm:px-6">Service</th>
                <th className="pb-3 font-medium px-4 sm:px-6">Status</th>
                <th className="pb-3 font-medium px-4 sm:px-6">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id} className="border-b border-gray-50">
                  <td className="py-3 font-medium text-dark px-4 sm:px-6">{o.id}</td>
                  <td className="py-3 text-gray-600 px-4 sm:px-6">{o.customer}</td>
                  <td className="py-3 text-gray-600 px-4 sm:px-6">{o.service}</td>
                  <td className="py-3 px-4 sm:px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500 px-4 sm:px-6">{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
