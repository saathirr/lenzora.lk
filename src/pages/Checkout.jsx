import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { HiCash, HiCheck, HiArrowLeft, HiCloudUpload } from 'react-icons/hi'
import { useApp } from '../lib/AppContext'
import { createOrder, createPaymentSlip, uploadFile } from '../lib/db'

const BANK_DETAILS = {
  bank: 'Amana Bank',
  accountNo: '0100510024001',
  holder: 'MH.Mohamed Saathir',
}

export default function Checkout() {
  const { cart, setCart, user, addOrder } = useApp()
  const navigate = useNavigate()
  const [slipFile, setSlipFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) setSlipFile(file)
  }

  const handleSubmit = async () => {
    if (!slipFile || !user) return
    setUploading(true)

    try {
      const fileExt = slipFile.name.split('.').pop()
      const filePath = `slips/${user.id}/${Date.now()}.${fileExt}`
      const slipUrl = await uploadFile('payment-slips', filePath, slipFile)

      const slip = await createPaymentSlip({
        user_id: user.id,
        slip_url: slipUrl,
        bank_name: BANK_DETAILS.bank,
        account_no: BANK_DETAILS.accountNo,
        account_holder: BANK_DETAILS.holder,
      })

      const orderId = '#' + Date.now().toString(36).toUpperCase()
      const items = cart.map((c) => ({ name: c.name, qty: c.qty, price: c.price }))

      const order = await createOrder({
        customer_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
        customer_email: user.email,
        user_id: user.id,
        items: items,
        amount: total,
        status: 'Pending',
        payment_status: 'paid',
        payment_slip_id: slip.id,
      })

      addOrder({
        id: '#' + order.id,
        customer: order.customer_name,
        email: order.customer_email,
        items,
        amount: order.amount,
        status: order.status,
        paymentStatus: order.payment_status,
        slipUrl,
        slipName: slipFile.name,
        date: new Date().toISOString().split('T')[0],
      })

      setCart([])
      setSubmitted(true)
    } catch (err) {
      console.error('Checkout error:', err)
      const msg = err?.message || ''
      if (msg.includes('Bucket not found') || msg.includes('bucket')) {
        alert('Storage bucket not configured. Please run the database setup SQL in your Supabase dashboard (supabase-schema.sql).')
      } else if (msg.includes('relation') || msg.includes('does not exist')) {
        alert('Database tables not found. Please run the setup SQL in your Supabase dashboard (supabase-schema.sql).')
      } else {
        alert('Failed to process payment: ' + (msg || 'Unknown error'))
      }
    }
    setUploading(false)
  }

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiCheck className="text-green-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-dark mb-2">Payment Slip Submitted!</h2>
          <p className="text-gray-500 mb-6">
            Your payment slip has been received. The admin will confirm your payment and provide the service within 24 hours.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition"
          >
            Back to Shop
          </button>
        </motion.div>
      </div>
    )
  }

  if (cart.length === 0 && !submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Your cart is empty.</p>
          <button onClick={() => navigate('/shop')} className="px-6 py-3 bg-primary text-white font-semibold rounded-full">
            Go to Shop
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-20 sm:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate('/shop')} className="flex items-center gap-2 text-gray-500 hover:text-primary mb-8 transition">
          <HiArrowLeft size={18} /> Back to Shop
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Checkout
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-dark mb-8">Complete Your Order</h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-dark mb-4">Order Summary</h2>
                <div className="space-y-3">
                  {cart.map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="font-medium text-dark">{c.name}</p>
                        <p className="text-sm text-gray-400">Qty: {c.qty} x LKR {c.price.toLocaleString()}</p>
                      </div>
                      <span className="font-semibold text-dark">LKR {(c.price * c.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
                  <span className="font-bold text-dark text-lg">Total</span>
                  <span className="text-2xl font-bold text-primary">LKR {total.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-dark mb-2">Bank Transfer Details</h2>
                <p className="text-sm text-gray-500 mb-4">Transfer the exact amount to the account below and upload the payment slip.</p>
                <div className="bg-primary/5 rounded-xl p-4 space-y-2 border border-primary/10">
                  <div className="flex items-center gap-3">
                    <HiCash className="text-primary shrink-0" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Bank</p>
                      <p className="font-semibold text-dark">{BANK_DETAILS.bank}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <HiCash className="text-primary shrink-0" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Account Number</p>
                      <p className="font-semibold text-dark text-lg">{BANK_DETAILS.accountNo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <HiCash className="text-primary shrink-0" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Account Holder</p>
                      <p className="font-semibold text-dark">{BANK_DETAILS.holder}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-24">
                <h2 className="text-lg font-bold text-dark mb-4">Upload Payment Slip</h2>
                <p className="text-sm text-gray-500 mb-4">
                  After making the transfer, upload the payment receipt/slip here.
                </p>

                {!user ? (
                  <div className="p-4 bg-amber-50 text-amber-700 text-sm rounded-xl border border-amber-200">
                    Please <button onClick={() => navigate('/login')} className="underline font-semibold">sign in</button> to complete checkout.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition">
                      {slipFile ? (
                        <div className="text-center">
                          <HiCheck className="text-green-500 mx-auto mb-2" size={28} />
                          <p className="text-sm font-medium text-dark">{slipFile.name}</p>
                          <p className="text-xs text-gray-400">{(slipFile.size / 1024).toFixed(1)} KB</p>
                          <button
                            onClick={(e) => { e.preventDefault(); setSlipFile(null) }}
                            className="text-xs text-red-500 hover:underline mt-1"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <HiCloudUpload className="text-gray-300 mx-auto mb-2" size={32} />
                          <p className="text-sm text-gray-500">Click to upload payment slip</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF (max 5MB)</p>
                        </div>
                      )}
                      <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="hidden" />
                    </label>

                    <button
                      onClick={handleSubmit}
                      disabled={!slipFile || uploading}
                      className="w-full py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition disabled:opacity-50 shadow-lg"
                    >
                      {uploading ? 'Uploading...' : 'Submit Payment Slip'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
