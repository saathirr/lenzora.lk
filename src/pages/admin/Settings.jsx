import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiSave, HiSun, HiMoon, HiSpeakerphone, HiGlobe, HiMail,
  HiPhotograph, HiCheckCircle, HiExclamationCircle, HiX, HiUpload,
  HiTrash, HiMenu, HiShoppingCart, HiUser, HiLink,
} from 'react-icons/hi'
import { FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa'
import { useApp } from '../../lib/AppContext'
import { uploadFile } from '../../lib/db'

const sections = [
  { id: 'general', label: 'General', icon: HiGlobe, fields: ['site_name', 'tagline'] },
  { id: 'appearance', label: 'Appearance', icon: HiPhotograph, fields: ['theme', 'logo_url'] },
  { id: 'announcement', label: 'Announcement', icon: HiSpeakerphone, fields: ['announcement_enabled', 'announcement_text'] },
  { id: 'contact', label: 'Contact & Social', icon: HiMail, fields: ['whatsapp', 'contact_email', 'facebook_url', 'instagram_url'] },
]

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#33333e] bg-white dark:bg-[#17171d] text-dark dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition placeholder:text-gray-400 dark:placeholder:text-slate-500'

export default function AdminSettings() {
  const { settings, setSettings, updateSiteSettings, dataLoading } = useApp()
  const [active, setActive] = useState('general')
  const [form, setForm] = useState(settings)
  const [savingSection, setSavingSection] = useState(null)
  const [pendingLogo, setPendingLogo] = useState(null)
  const [toast, setToast] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    setForm(settings)
  }, [settings])

  const dirty = sections
    .filter((s) => s.id !== 'appearance')
    .some((s) => s.fields.some((f) => form[f] !== settings[f]))
    || Boolean(pendingLogo)
    || form.theme !== settings.theme

  const showToast = (type, message) => {
    setToast({ type, message })
    window.clearTimeout(showToast._t)
    showToast._t = window.setTimeout(() => setToast(null), 3200)
  }

  const handleUploadLogo = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please choose an image file.')
      return
    }
    setPendingLogo({ file, preview: URL.createObjectURL(file) })
    e.target.value = ''
  }

  const uploadPendingLogo = async () => {
    if (!pendingLogo) return form.logo_url || ''
    const ext = pendingLogo.file.name.split('.').pop().toLowerCase()
    const path = `logo-${Date.now()}.${ext}`
    try {
      return await uploadFile('site-assets', path, pendingLogo.file)
    } catch (err) {
      console.error('Failed to upload logo:', err)
      return null
    }
  }

  const persist = async (updates) => {
    const updated = await updateSiteSettings(1, updates)
    setSettings((prev) => ({ ...prev, ...updated }))
    return updated
  }

  const saveSection = async (sectionId) => {
    const section = sections.find((s) => s.id === sectionId)
    const current = { ...form }

    if (current.whatsapp && !/^[0-9]+$/.test(String(current.whatsapp).replace(/\s+/g, ''))) {
      showToast('error', 'WhatsApp number must contain only digits (with country code).')
      return
    }
    if (current.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(current.contact_email)) {
      showToast('error', 'Please enter a valid contact email.')
      return
    }

    setSavingSection(sectionId)
    try {
      if (sectionId === 'appearance') {
        const logoUrl = await uploadPendingLogo()
        if (pendingLogo && !logoUrl) throw new Error('logo-upload')
        await persist({ theme: current.theme, logo_url: logoUrl })
        setPendingLogo(null)
      } else {
        const payload = {}
        section.fields.forEach((f) => {
          payload[f] = current[f]
        })
        await persist(payload)
      }
      showToast('success', `${section.label} settings saved. Applied site-wide.`)
    } catch (err) {
      console.error('Failed to save settings:', err)
      showToast('error', err?.message === 'logo-upload' ? 'Logo upload failed. Check storage permissions.' : 'Failed to save settings.')
    }
    setSavingSection(null)
  }

  const saveAll = async () => {
    const current = { ...form }
    setSavingSection('all')
    try {
      const logoUrl = await uploadPendingLogo()
      if (pendingLogo && !logoUrl) throw new Error('logo-upload')
      const updates = {
        theme: current.theme,
        site_name: current.site_name,
        tagline: current.tagline,
        logo_url: logoUrl,
        whatsapp: current.whatsapp,
        contact_email: current.contact_email,
        facebook_url: current.facebook_url,
        instagram_url: current.instagram_url,
        announcement_enabled: current.announcement_enabled,
        announcement_text: current.announcement_text,
      }
      await persist(updates)
      setPendingLogo(null)
      showToast('success', 'All settings saved and applied site-wide.')
    } catch (err) {
      console.error('Failed to save settings:', err)
      showToast('error', err?.message === 'logo-upload' ? 'Logo upload failed. Check storage permissions.' : 'Failed to save all settings.')
    }
    setSavingSection(null)
  }

  const applyThemeNow = (theme) => {
    setForm((prev) => ({ ...prev, theme }))
    setSettings((prev) => ({ ...prev, theme }))
    persist({ theme }).catch(() => {})
  }

  const removeLogo = () => {
    setPendingLogo(null)
    setForm((prev) => ({ ...prev, logo_url: '' }))
  }

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const logoSource = pendingLogo?.preview || form.logo_url || null
  const theme = form.theme

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-dark">Settings</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Configure everything about your website. Changes apply site-wide instantly.</p>
        </div>
        <motion.button
          onClick={saveAll}
          disabled={savingSection === 'all' || !dirty}
          whileTap={{ scale: 0.96 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-accent2 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {savingSection === 'all' ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <HiSave size={16} />
          )}
          Save All Changes
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tab navigation */}
        <div className="lg:col-span-1">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 lg:sticky lg:top-24">
            {sections.map((s) => {
              const Icon = s.icon
              const isDirty = s.id !== 'appearance'
                ? s.fields.some((f) => form[f] !== settings[f])
                : pendingLogo || form.theme !== settings.theme
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 transition ${
                    active === s.id
                      ? 'bg-white dark:bg-[#17171d] text-primary border border-primary/30 shadow-md shadow-primary/10'
                      : 'text-gray-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${active === s.id ? 'bg-gradient-to-br from-primary to-accent2 text-white shadow' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-slate-400'}`}>
                    <Icon size={15} />
                  </span>
                  {s.label}
                  {isDirty && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Active section */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
            >
              {active === 'general' && (
                <div className="bg-white dark:bg-[#17171d] border border-gray-100 dark:border-[#2b2b35] rounded-2xl shadow-sm p-6 sm:p-8">
                  <SectionHeader icon={HiGlobe} title="General Information" desc="Identify your brand across the entire site." />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1.5 block">Site name *</label>
                      <input
                        value={form.site_name}
                        onChange={(e) => setForm({ ...form, site_name: e.target.value })}
                        placeholder="e.g. Lenzora"
                        className={inputCls}
                      />
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">Shown in the navbar, footer & copyright.</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1.5 block">Tagline</label>
                      <input
                        value={form.tagline}
                        onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                        placeholder="Short brand description"
                        className={inputCls}
                      />
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">Used in the footer brand block.</p>
                    </div>
                  </div>
                  <SaveBar section="general" saving={savingSection === 'general'} onSave={() => saveSection('general')} />
                </div>
              )}

              {active === 'appearance' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-[#17171d] border border-gray-100 dark:border-[#2b2b35] rounded-2xl shadow-sm p-6 sm:p-8">
                    <SectionHeader icon={HiSun} title="Theme" desc="Pick how the whole website looks. Applies instantly." />
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <button
                        onClick={() => applyThemeNow('light')}
                        className={`p-5 rounded-2xl border-2 transition text-left group ${
                          theme === 'light'
                            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                            : 'border-gray-200 dark:border-[#33333e] hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                            <HiSun className="text-amber-500 group-hover:rotate-45 transition-transform duration-300" size={18} />
                          </div>
                          {theme === 'light' && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white">
                              <HiCheckCircle size={14} />
                            </motion.span>
                          )}
                        </div>
                        <p className="font-bold text-dark">Light</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Bright and clean.</p>
                      </button>
                      <button
                        onClick={() => applyThemeNow('dark')}
                        className={`p-5 rounded-2xl border-2 transition text-left group ${
                          theme === 'dark'
                            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                            : 'border-gray-200 dark:border-[#33333e] hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-9 h-9 rounded-xl bg-dark flex items-center justify-center">
                            <HiMoon className="text-secondary group-hover:-rotate-12 transition-transform duration-300" size={18} />
                          </div>
                          {theme === 'dark' && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white">
                              <HiCheckCircle size={14} />
                            </motion.span>
                          )}
                        </div>
                        <p className="font-bold text-dark dark:text-white">Dark</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Easy on the eyes.</p>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#17171d] border border-gray-100 dark:border-[#2b2b35] rounded-2xl shadow-sm p-6 sm:p-8">
                    <SectionHeader icon={HiPhotograph} title="Site Logo" desc="Upload your brand logo. It replaces the text logo in the navbar and footer." />
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-6">
                      <div className={`w-40 h-24 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition ${
                        logoSource ? 'border-primary/40 bg-gray-50 dark:bg-white/5' : 'border-gray-300 dark:border-[#33333e] bg-gray-50 dark:bg-white/5'
                      }`}>
                        {logoSource ? (
                          <img src={logoSource} alt="Logo preview" className="w-full h-full object-contain p-2" />
                        ) : (
                          <div className="text-center text-gray-400 dark:text-slate-500 px-3">
                            <HiPhotograph size={22} className="mx-auto mb-1" />
                            <p className="text-[11px]">No logo</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2.5">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleUploadLogo}
                          className="hidden"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition"
                          >
                            <HiUpload size={16} />
                            {logoSource ? 'Replace Logo' : 'Upload Logo'}
                          </button>
                          {logoSource && (
                            <button
                              onClick={removeLogo}
                              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-red-600 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition"
                            >
                              <HiTrash size={16} />
                              Remove
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 dark:text-slate-500">PNG, JPG, SVG or WebP. Transparent PNG/WebP recommended.</p>
                      </div>
                    </div>
                    <SaveBar section="appearance" saving={savingSection === 'appearance'} onSave={() => saveSection('appearance')} />
                  </div>

                  <div className="bg-white dark:bg-[#17171d] border border-gray-100 dark:border-[#2b2b35] rounded-2xl shadow-sm p-6 sm:p-8">
                    <SectionHeader icon={HiMenu} title="Live Preview" desc="How your brand header looks with the current settings." />
                    <div className={`mt-6 rounded-2xl overflow-hidden border transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0d0d12] border-[#2b2b35]' : 'bg-white border-gray-100'}`}>
                      {form.announcement_enabled && form.announcement_text && (
                        <div className="bg-gradient-to-r from-primary via-primary-dark to-dark text-white text-center text-xs font-medium px-4 py-1.5">
                          {form.announcement_text}
                        </div>
                      )}
                      <div className="px-5 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {logoSource ? (
                            <img src={logoSource} alt="logo" className="h-9 max-w-[140px] object-contain" />
                          ) : (
                            <span className="text-2xl font-bold text-primary">{form.site_name}<span className="text-[10px] text-gray-400 align-top">.lk</span></span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="hidden sm:block text-xs text-gray-400">Home · Gallery · Shop</span>
                          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent2" />
                        </div>
                      </div>
                      {theme === 'dark' && <p className="text-xs text-slate-500 text-center pb-2">Dark theme preview</p>}
                    </div>
                  </div>
                </div>
              )}

              {active === 'announcement' && (
                <div className="bg-white dark:bg-[#17171d] border border-gray-100 dark:border-[#2b2b35] rounded-2xl shadow-sm p-6 sm:p-8">
                  <SectionHeader icon={HiSpeakerphone} title="Announcement Bar" desc="Broadcast a short message at the top of every page." />
                  <div className="mt-6 space-y-5">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">Enable announcement bar</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Shows above the navbar across all pages.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, announcement_enabled: !form.announcement_enabled })}
                        className={`relative w-14 h-7 rounded-full p-1 transition ${form.announcement_enabled ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'}`}
                      >
                        <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${form.announcement_enabled ? 'translate-x-7' : ''}`} />
                      </button>
                    </label>
                    {form.announcement_enabled && (
                      <motion.textarea
                        key="announcement-text"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        value={form.announcement_text}
                        onChange={(e) => setForm({ ...form, announcement_text: e.target.value })}
                        placeholder="e.g. Big sale this weekend — 20% off all designs!"
                        rows={3}
                        className={`${inputCls} resize-none`}
                      />
                    )}
                  </div>
                  <SaveBar section="announcement" saving={savingSection === 'announcement'} onSave={() => saveSection('announcement')} />
                </div>
              )}

              {active === 'contact' && (
                <div className="bg-white dark:bg-[#17171d] border border-gray-100 dark:border-[#2b2b35] rounded-2xl shadow-sm p-6 sm:p-8">
                  <SectionHeader icon={HiMail} title="Contact & Social" desc="Used for WhatsApp buttons, contact page and site social links." />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1.5 block flex items-center gap-2">
                        <FaWhatsapp className="text-green-500" size={14} />
                        WhatsApp number *
                      </label>
                      <input
                        value={form.whatsapp}
                        onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                        placeholder="e.g. 94717336756"
                        className={inputCls}
                      />
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">With country code, digits only.</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1.5 block flex items-center gap-2">
                        <HiMail className="text-primary" size={14} />
                        Contact email *
                      </label>
                      <input
                        value={form.contact_email}
                        onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                        placeholder="e.g. hello@lenzora.lk"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1.5 block flex items-center gap-2">
                        <FaInstagram className="text-pink-500" size={14} />
                        Instagram URL
                      </label>
                      <input
                        value={form.instagram_url}
                        onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
                        placeholder="https://instagram.com/yourpage"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1.5 block flex items-center gap-2">
                        <FaFacebook className="text-blue-500" size={14} />
                        Facebook URL
                      </label>
                      <input
                        value={form.facebook_url}
                        onChange={(e) => setForm({ ...form, facebook_url: e.target.value })}
                        placeholder="https://facebook.com/yourpage"
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <SaveBar section="contact" saving={savingSection === 'contact'} onSave={() => saveSection('contact')} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.message}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 pl-4 pr-5 py-3 rounded-2xl shadow-2xl border text-sm font-semibold backdrop-blur-xl ${
              toast.type === 'success'
                ? 'bg-emerald-500/95 text-white border-emerald-400'
                : 'bg-red-500/95 text-white border-red-400'
            }`}
          >
            {toast.type === 'success' ? <HiCheckCircle size={20} /> : <HiExclamationCircle size={20} />}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100 transition">
              <HiX size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SectionHeader({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent2 flex items-center justify-center text-white shadow-md shadow-primary/20 shrink-0">
        <Icon size={18} />
      </div>
      <div>
        <h3 className="font-bold text-dark text-lg">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">{desc}</p>
      </div>
    </div>
  )
}

function SaveBar({ section, saving, onSave }) {
  return (
    <div className="mt-6 pt-5 border-t border-gray-100 dark:border-[#2b2b35] flex items-center justify-end gap-3">
      <span className="text-xs text-gray-400 dark:text-slate-500">
        <HiLink className="inline mr-1 -mt-0.5" size={12} />
        Applies site-wide instantly
      </span>
      <motion.button
        onClick={onSave}
        disabled={saving}
        whileTap={{ scale: 0.96 }}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark shadow-md shadow-primary/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {saving ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <HiSave size={15} />
            Save {section === 'appearance' ? 'Appearance' : ''}
          </>
        )}
      </motion.button>
    </div>
  )
}