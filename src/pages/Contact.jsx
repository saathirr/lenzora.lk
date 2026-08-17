import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiMail, HiPhone, HiLocationMarker, HiCheck, HiClock } from 'react-icons/hi'
import { FaInstagram, FaWhatsapp } from 'react-icons/fa'
import { useApp } from '../lib/AppContext'
import { supabase } from '../lib/supabase'
import TiltCard from '../components/ui/TiltCard'
import Reveal from '../components/ui/Reveal'
import AnimatedHeading from '../components/ui/AnimatedHeading'
import FloatingOrbs from '../components/ui/FloatingOrbs'
import MagneticButton from '../components/ui/MagneticButton'

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#2f2f2f] focus:border-primary focus:ring-2 focus:ring-primary/25 outline-none transition bg-white dark:bg-[#141414] text-dark dark:text-white'

export default function Contact() {
  const { user, profile, createConversation, addMessageToConversation, settings } = useApp()
  const whatsapp = settings.whatsapp || '94717336756'
  const contactEmail = settings.contact_email || 'hello@lenzora.lk'
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', message: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      const conversation = await createConversation({
        customer_id: user?.id || null,
        customer_email: form.email,
        customer_name: form.name,
        subject: form.service || 'General Inquiry',
      })
      await addMessageToConversation({
        conversation_id: conversation.id,
        sender_id: user?.id || null,
        sender_email: form.email,
        sender_name: form.name,
        body: form.message,
        is_admin: false,
      })
      setSubmitted(true)
      setForm({ name: '', email: '', phone: '', service: '', message: '' })
    } catch (err) {
      console.error('Failed to send message:', err)
      alert('Failed to send message. Please try again.')
    }
    setSending(false)
    setTimeout(() => setSubmitted(false), 6000)
  }

  return (
    <div className="relative py-20 sm:py-28 overflow-hidden">
      <FloatingOrbs count={2} intensity={0.3} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <Reveal className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Get in Touch
          </span>
          <AnimatedHeading
            text="Let's Work Together"
            gradient={['Together']}
            className="text-4xl sm:text-5xl font-extrabold text-dark tracking-tight"
          />
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Tell us about your project and we will get back to you within 24 hours.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="p-12 bg-green-50 dark:bg-green-500/10 rounded-3xl border border-green-200 dark:border-green-500/20 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 15 }}
                    className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-500/40"
                  >
                    <HiCheck className="text-white" size={40} />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-green-800 dark:text-green-400">Message Sent!</h3>
                  <p className="text-green-600 dark:text-green-300 mt-2">We'll get back to you within 24 hours.</p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Name *</label>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className={inputClass}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email *</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={inputClass}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Phone</label>
                      <input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className={inputClass}
                        placeholder="+94 7X XXX XXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Service Needed</label>
                      <select
                        value={form.service}
                        onChange={(e) => setForm({ ...form, service: e.target.value })}
                        className={`${inputClass} bg-white dark:bg-[#141414]`}
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Message *</label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className={`${inputClass} resize-none`}
                      placeholder="Tell us about your project..."
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={sending}
                    whileHover={sending ? {} : { scale: 1.02 }}
                    whileTap={sending ? {} : { scale: 0.98 }}
                    className="w-full py-3.5 bg-gradient-to-r from-primary to-accent2 text-white font-bold rounded-full hover:shadow-xl hover:shadow-primary/30 transition-shadow disabled:opacity-60"
                  >
                    {sending ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      'Send Message'
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <Reveal delay={0.15} className="space-y-6">
            <TiltCard max={6} className="rounded-3xl">
              <div className="p-7 rounded-3xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] shadow-sm hover:shadow-xl transition-shadow">
                <h3 className="font-bold text-dark text-lg mb-5">Contact Info</h3>
                <div className="space-y-5">
                  {[
                    { Icon: HiMail, label: 'Email', value: contactEmail },
                    { Icon: HiPhone, label: 'Phone', value: '076 173 6756' },
                    { Icon: HiLocationMarker, label: 'Location', value: 'Colombo, Sri Lanka' },
                  ].map(({ Icon, label, value }, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, x: -14 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-4 group"
                    >
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/12 to-accent2/12 text-primary flex items-center justify-center group-hover:from-primary group-hover:to-accent2 group-hover:text-white group-hover:-rotate-6 transition-all duration-300">
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{label}</p>
                        <p className="font-medium text-dark">{value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TiltCard>

            <div className="p-7 rounded-3xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] shadow-sm">
              <h3 className="font-bold text-dark text-lg mb-4">Quick Connect</h3>
              <p className="text-sm text-gray-500 mb-4">Prefer instant messaging? Reach us on:</p>
              <div className="flex gap-3">
                <MagneticButton className="flex-1">
                  <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-shadow">
                    <FaWhatsapp size={18} className="animate-pulse-soft" />
                    WhatsApp
                  </a>
                </MagneticButton>
                <MagneticButton className="flex-1">
                  <a href={settings.instagram_url || 'https://instagram.com/lenzora.lk'} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-pink-500/30 transition-shadow">
                    <FaInstagram size={18} />
                    DM Us
                  </a>
                </MagneticButton>
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-gradient-to-r from-primary/8 to-accent2/8 border border-primary/12">
              <div className="flex items-center gap-3 mb-2">
                <HiClock className="text-primary" size={22} />
                <h3 className="font-bold text-dark text-lg">Response Time</h3>
              </div>
              <p className="text-sm text-gray-500">
                We typically respond within <strong className="text-primary">2-4 hours</strong> during business hours (9 AM - 9 PM, Mon-Sat).
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  )
}