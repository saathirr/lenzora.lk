import { useState } from 'react'
import { useApp } from '../../lib/AppContext'
import { updateOrder } from '../../lib/db'
import { HiEye, HiCheck } from 'react-icons/hi'

const statusColors = {
  Pending: 'bg-amber-100 text-amber-600',
  'In Progress': 'bg-blue-100 text-blue-600',
  Completed: 'bg-green-100 text-green-600',
  Cancelled: 'bg-red-100 text-red-600',
}

const paymentColors = {
  unpaid: 'bg-gray-100 text-gray-600',
  paid: 'bg-blue-100 text-blue-600',
  confirmed: 'bg-green-100 text-green-600',
}

export default function AdminOrders() {
  const { orders, setOrders, dataLoading } = useApp()
  const [filter, setFilter] = useState('All')
  const [viewingSlip, setViewingSlip] = useState(null)

  const filtered = filter === 'All' ? orders : orders.filter((o) => o.status === filter)

  const updateStatus = async (id, newStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)))
    try {
      await updateOrder(id, { status: newStatus })
    } catch (err) {
      console.error('Failed to update order status:', err)
    }
  }

  const confirmPayment = async (id) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, payment_status: 'confirmed', status: 'In Progress' } : o)))
    try {
      await updateOrder(id, { payment_status: 'confirmed', status: 'In Progress' })
    } catch (err) {
      console.error('Failed to confirm payment:', err)
    }
  }

  const totalRevenue = orders.filter((o) => o.status === 'Completed').reduce((s, o) => s + Number(o.amount), 0)

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">Orders</h1>
          <p className="text-gray-500">Manage customer orders and confirm payments.</p>
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
                <th className="p-4 font-medium hidden sm:table-cell">Items</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Payment</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium hidden md:table-cell">Date</th>
                <th className="p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const items = Array.isArray(o.items) ? o.items : (typeof o.items === 'string' ? JSON.parse(o.items || '[]') : [])
                const slip = o.payment_slips
                return (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-dark">#{o.id}</td>
                    <td className="p-4">
                      <div>
                        <p className="text-dark font-medium">{o.customer_name}</p>
                        <p className="text-gray-400 text-xs hidden sm:block">{o.customer_email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 hidden sm:table-cell">
                      {items.length > 0 ? items.map((i) => i.name).join(', ') : '-'}
                    </td>
                    <td className="p-4 font-medium text-dark">LKR {Number(o.amount).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${paymentColors[o.payment_status] || 'bg-gray-100 text-gray-600'}`}>
                        {o.payment_status || 'unpaid'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 hidden md:table-cell">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {slip?.slip_url && (
                          <button
                            onClick={() => setViewingSlip({ ...o, slipUrl: slip.slip_url, slipName: slip.slip_url.split('/').pop() })}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View payment slip"
                          >
                            <HiEye size={16} />
                          </button>
                        )}
                        {o.payment_status === 'paid' && (
                          <button
                            onClick={() => confirmPayment(o.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Confirm payment"
                          >
                            <HiCheck size={16} />
                          </button>
                        )}
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
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-gray-400">No orders found.</div>
        )}
      </div>

      {viewingSlip && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setViewingSlip(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-dark">Payment Slip — #{viewingSlip.id}</h3>
              <button onClick={() => setViewingSlip(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500">Customer</p>
                <p className="font-medium text-dark">{viewingSlip.customer_name} ({viewingSlip.customer_email})</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500">Amount</p>
                <p className="font-bold text-primary text-lg">LKR {Number(viewingSlip.amount).toLocaleString()}</p>
              </div>
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                <p className="text-gray-500 text-xs mb-1">Bank: Amana Bank</p>
                <p className="text-gray-500 text-xs mb-1">Account: 0100510024001</p>
                <p className="text-gray-500 text-xs">Holder: MH.Mohamed Saathir</p>
              </div>
              {viewingSlip.slipName && (
                <p className="text-gray-400 text-xs">Slip: {viewingSlip.slipName}</p>
              )}
            </div>
            {viewingSlip.slipUrl && (
              <div className="mt-4">
                {viewingSlip.slipUrl.match(/\.(pdf)$/i) ? (
                  <a href={viewingSlip.slipUrl} target="_blank" rel="noopener noreferrer" className="block w-full py-3 bg-primary text-white text-center font-semibold rounded-xl hover:bg-primary-dark transition">
                    View PDF Slip
                  </a>
                ) : (
                  <img src={viewingSlip.slipUrl} alt="Payment slip" className="w-full rounded-xl border border-gray-200" />
                )}
              </div>
            )}
            <div className="flex flex-col gap-2 mt-4">
              {viewingSlip.slipUrl && (
                <a
                  href={`https://wa.me/94761736756?text=${encodeURIComponent(`Payment Slip - Order #${viewingSlip.id}%0ACustomer: ${viewingSlip.customer_name}%0AAmount: LKR ${Number(viewingSlip.amount).toLocaleString()}%0ASlip: ${viewingSlip.slipUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition text-sm"
                >
                  Send via WhatsApp
                </a>
              )}
              <div className="flex gap-2">
                {viewingSlip.payment_status === 'paid' && (
                  <button
                    onClick={() => { confirmPayment(viewingSlip.id); setViewingSlip(null) }}
                    className="flex-1 py-2.5 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition text-sm"
                  >
                    Confirm Payment
                  </button>
                )}
                <button onClick={() => setViewingSlip(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-600 font-semibold rounded-full hover:bg-gray-200 transition text-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
