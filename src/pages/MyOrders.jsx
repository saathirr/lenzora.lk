import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiShoppingCart, HiEye } from 'react-icons/hi'
import { useApp } from '../lib/AppContext'

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

export default function MyOrders() {
  const { user, fetchCustomerOrders } = useApp()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewingSlip, setViewingSlip] = useState(null)

  useEffect(() => {
    if (user) {
      fetchCustomerOrders(user.id).then(setOrders).catch(console.error).finally(() => setLoading(false))
    }
  }, [user])

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please sign in to view your orders.</p>
          <Link to="/login" className="px-6 py-3 bg-primary text-white font-semibold rounded-full">Sign In</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">My Account</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-dark">My Orders</h1>
          <p className="text-gray-500 mt-2">View your order history and payment status.</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm">
            <HiShoppingCart className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-dark mb-2">No Orders Yet</h3>
            <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
            <Link to="/shop" className="px-6 py-3 bg-primary text-white font-semibold rounded-full">Browse Shop</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => {
              const items = Array.isArray(o.items) ? o.items : []
              const slip = o.payment_slips
              return (
                <div key={o.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-lg font-bold text-dark">#{o.id}</p>
                      <p className="text-sm text-gray-400">{o.created_at ? new Date(o.created_at).toLocaleDateString() : '-'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[o.status]}`}>{o.status}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${paymentColors[o.payment_status]}`}>{o.payment_status}</span>
                    </div>
                  </div>
                  <div className="space-y-2 border-t border-gray-50 pt-4">
                    {items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.name} x{item.qty}</span>
                        <span className="font-medium text-dark">LKR {(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm border-t border-gray-100 pt-2">
                      <span className="font-bold text-dark">Total</span>
                      <span className="font-bold text-primary text-lg">LKR {Number(o.amount).toLocaleString()}</span>
                    </div>
                  </div>
                  {slip?.slip_url && (
                    <button onClick={() => setViewingSlip({ ...o, slipUrl: slip.slip_url })} className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:underline">
                      <HiEye size={16} /> View Payment Slip
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {viewingSlip && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setViewingSlip(null)}>
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-dark">Payment Slip — #{viewingSlip.id}</h3>
                <button onClick={() => setViewingSlip(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              {viewingSlip.slipUrl && (
                <img src={viewingSlip.slipUrl} alt="Payment slip" className="w-full rounded-xl border border-gray-200" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
