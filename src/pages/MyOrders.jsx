import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiShoppingCart, HiEye, HiClock, HiCheckCircle, HiXCircle, HiTruck } from 'react-icons/hi'
import { useApp } from '../lib/AppContext'
import { fetchCustomerOrders, subscribeToCustomerOrders } from '../lib/db'

const statusColors = {
  Pending: 'bg-amber-100 text-amber-600',
  'In Progress': 'bg-blue-100 text-blue-600',
  Completed: 'bg-green-100 text-green-600',
  Cancelled: 'bg-red-100 text-red-600',
}

const statusIcons = {
  Pending: HiClock,
  'In Progress': HiTruck,
  Completed: HiCheckCircle,
  Cancelled: HiXCircle,
}

const paymentColors = {
  unpaid: 'bg-gray-100 text-gray-600',
  paid: 'bg-blue-100 text-blue-600',
  confirmed: 'bg-green-100 text-green-600',
}

const paymentLabels = {
  unpaid: 'Not Paid',
  paid: 'Payment Submitted',
  confirmed: 'Payment Confirmed',
}

export default function MyOrders() {
  const { user } = useApp()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewingSlip, setViewingSlip] = useState(null)

  useEffect(() => {
    if (user) {
      fetchCustomerOrders(user).then(setOrders).catch(console.error).finally(() => setLoading(false))
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeToCustomerOrders(user.id, (payload) => {
      if (payload.eventType === 'UPDATE') {
        setOrders((prev) =>
          prev.map((o) => (o.id === payload.new.id ? { ...o, ...payload.new } : o))
        )
      } else if (payload.eventType === 'INSERT') {
        setOrders((prev) => [payload.new, ...prev])
      } else if (payload.eventType === 'DELETE') {
        setOrders((prev) => prev.filter((o) => o.id !== payload.old.id))
      }
    })
    return unsubscribe
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
          <p className="text-gray-500 mt-2">View your order history and payment status. Updates in real-time.</p>
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
              const items = Array.isArray(o.items) ? o.items : (typeof o.items === 'string' ? JSON.parse(o.items || '[]') : [])
              const slip = o.payment_slips
              const StatusIcon = statusIcons[o.status] || HiClock
              const createdDate = o.created_at ? new Date(o.created_at) : null
              const updatedDate = o.updated_at ? new Date(o.updated_at) : null

              return (
                <div key={o.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-50">
                    <div>
                      <p className="text-lg font-bold text-dark">Order #{o.id}</p>
                      {createdDate && (
                        <p className="text-sm text-gray-400">
                          Placed on {createdDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          {' at '}
                          {createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusColors[o.status] || 'bg-gray-100 text-gray-600'}`}>
                        <StatusIcon size={13} />
                        {o.status}
                      </span>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${paymentColors[o.payment_status] || 'bg-gray-100 text-gray-600'}`}>
                        {paymentLabels[o.payment_status] || o.payment_status || 'Not Paid'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Items Ordered</p>
                    {items.length > 0 ? (
                      items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm bg-gray-50 rounded-xl px-4 py-2.5">
                          <div>
                            <span className="text-dark font-medium">{item.name}</span>
                            <span className="text-gray-400 ml-2">× {item.qty || 1}</span>
                          </div>
                          <span className="font-medium text-dark">
                            LKR {((item.price || 0) * (item.qty || 1)).toLocaleString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 italic">{o.service_name || o.details || 'No item details available'}</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="font-bold text-dark">Total Amount</span>
                    <span className="font-bold text-primary text-xl">LKR {Number(o.amount).toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-50 text-xs">
                    <div>
                      <p className="text-gray-400">Order Date</p>
                      <p className="text-dark font-medium">{createdDate ? createdDate.toLocaleDateString() : '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Order Time</p>
                      <p className="text-dark font-medium">{createdDate ? createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Last Updated</p>
                      <p className="text-dark font-medium">{updatedDate ? updatedDate.toLocaleDateString() : '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Total Items</p>
                      <p className="text-dark font-medium">{items.length > 0 ? items.reduce((s, i) => s + (i.qty || 1), 0) : 1}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Payment Method</p>
                      <p className="text-dark font-medium">Bank Transfer</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Order Status</p>
                      <p className="text-dark font-medium">{o.status}</p>
                    </div>
                  </div>

                  {slip?.slip_url && (
                    <button
                      onClick={() => setViewingSlip({ ...o, slipUrl: slip.slip_url })}
                      className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <HiEye size={16} /> View Payment Slip
                    </button>
                  )}

                  {o.status === 'Cancelled' && (
                    <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">
                      This order was cancelled. Contact us via Messages if you have questions.
                    </div>
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