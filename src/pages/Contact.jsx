import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiMail, HiPhone, HiLocationMarker, HiCheck } from 'react-icons/hi'
import { FaInstagram, FaWhatsapp } from 'react-icons/fa'
import { createMessage } from '../lib/db'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', message: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      await createMessage({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        service: form.service || null,
        message: form.message,
      })
      setSubmitted(true)
      setForm({ name: '', email: '', phone: '', service: '', message: '' })
    } catch (err) {
      console.error('Failed to send message:', err)
      alert('Failed to send message. Please try again.')
    }
    setSending(false)
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <div className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Get in Touch
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-dark">Let's Work Together</h1>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Tell us about your project and we will get back to you within 24 hours.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {submitted ? (
              <div className="p-10 bg-green-50 rounded-2xl border border-green-200 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiCheck className="text-green-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-green-800">Message Sent!</h3>
                <p className="text-green-600 mt-2">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                      placeholder="+94 7X XXX XXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Needed</label>
                    <select
                      value={form.service}
                      onChange={(e) => setForm({ ...form, service: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-white"
                    >
                      <option value="">Select a service</option>
                      <option value="photo-editing">Photo Editing</option>
                      <option value="graphic-design">Graphic Design</option>
                      <option value="branding">Brand Identity</option>
                      <option value="video-editing">Video Editing</option>
                      <option value="social-media">Social Media Graphics</option>
                      <option value="ui-ux">UI/UX Design</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition resize-none"
                    placeholder="Tell us about your project..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition shadow-lg shadow-primary/25 disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
              <h3 className="font-bold text-dark text-lg mb-4">Contact Info</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <HiMail className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-dark">hello@lenzora.lk</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <HiPhone className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-dark">076 173 6756</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <HiLocationMarker className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-dark">Colombo, Sri Lanka</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
              <h3 className="font-bold text-dark text-lg mb-4">Quick Connect</h3>
              <p className="text-sm text-gray-500 mb-4">Prefer instant messaging? Reach us on:</p>
              <div className="flex gap-3">
                <a href="https://wa.me/94761736756" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition">
                  <FaWhatsapp size={18} />
                  WhatsApp
                </a>
                <a href="https://instagram.com/lenzora.lk" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition">
                  <FaInstagram size={18} />
                  DM Us
                </a>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
              <h3 className="font-bold text-dark text-lg mb-2">Response Time</h3>
              <p className="text-sm text-gray-500">
                We typically respond within <strong className="text-primary">2-4 hours</strong> during business hours (9 AM - 9 PM, Mon-Sat).
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
