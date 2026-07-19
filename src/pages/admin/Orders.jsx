import { useState } from 'react'
import { useApp } from '../../lib/AppContext'

const statusColors = {
  Pending: 'bg-amber-100 text-amber-600',
  'In Progress': 'bg-blue-100 text-blue-600',
  Completed: 'bg-green-100 text-green-600',
  Cancelled: 'bg-red-100 text-red-600',
}

export default function AdminOrders() {
  const { orders, setOrders } = useApp()
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? orders : orders.filter((o) => o.status === filter)

  const updateStatus = (id, newStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)))
  }

  const totalRevenue = orders.filter((o) => o.status === 'Completed').reduce((s, o) => s + o.amount, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">Orders</h1>
          <p className="text-gray-500">Manage customer orders.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">LKR {totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === s
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500 bg-gray-50">
                <th className="p-4 font-medium">Order</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium hidden sm:table-cell">Service</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium hidden md:table-cell">Date</th>
                <th className="p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4 font-medium text-dark">{o.id}</td>
                  <td className="p-4">
                    <div>
                      <p className="text-dark font-medium">{o.customer}</p>
                      <p className="text-gray-400 text-xs hidden sm:block">{o.email}</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 hidden sm:table-cell">{o.service}</td>
                  <td className="p-4 font-medium text-dark">LKR {o.amount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 hidden md:table-cell">{o.date}</td>
                  <td className="p-4">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-gray-400">No orders found.</div>
        )}
      </div>
    </div>
  )
}
