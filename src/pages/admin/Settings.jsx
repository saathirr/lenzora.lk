import { useState, useEffect } from 'react'
import { HiSave, HiSun, HiMoon, HiSpeakerphone, HiGlobe, HiPhone, HiMail } from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'

export default function AdminSettings() {
  const { settings, setSettings, updateSiteSettings, dataLoading } = useApp()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState(settings)

  useEffect(() => {
    setForm(settings)
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const updated = await updateSiteSettings(1, {
        theme: form.theme,
        site_name: form.site_name.trim(),
        whatsapp: form.whatsapp.trim(),
        contact_email: form.contact_email.trim(),
        announcement_enabled: form.announcement_enabled,
        announcement_text: form.announcement_text.trim(),
      })
      setSettings(updated)
      setForm(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error('Failed to save settings:', err)
      alert('Failed to save settings.')
    }
    setSaving(false)
  }

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
        <h1 className="text-2xl font-bold text-dark">Settings</h1>
        <p className="text-gray-500">Customize how your website looks and behaves.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-1">
            <HiSun className="text-primary" size={20} />
            <HiMoon className="text-gray-400" size={20} />
            <h3 className="font-bold text-dark ml-1">Theme</h3>
          </div>
          <p className="text-sm text-gray-500 mb-5">Choose how the whole website looks.</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setForm({ ...form, theme: 'light' })}
              className={`p-5 rounded-2xl border-2 transition text-left ${
                form.theme === 'light'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-3">
                <HiSun className="text-amber-500" size={18} />
              </div>
              <p className="font-semibold text-dark">Light</p>
              <p className="text-xs text-gray-500">Bright and clean.</p>
            </button>
            <button
              onClick={() => setForm({ ...form, theme: 'dark' })}
              className={`rounded-2xl border-2 transition text-left ${
                form.theme === 'dark'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-dark flex items-center justify-center mb-3">
                <HiMoon size={18} />
              </div>
              <p className="font-semibold text-dark">Dark</p>
              <p className="text-xs text-gray-500">Easy on the eyes.</p>
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-1">
            <HiSpeakerphone className="text-primary" size={20} />
            <h3 className="font-bold text-dark">Announcement Bar</h3>
          </div>
          <p className="text-sm text-gray-500 mb-5">Show a short message at the top of the site.</p>
          <label className="flex items-center justify-between cursor-pointer mb-4">
            <span className="text-sm font-medium text-gray-600">Enable announcement</span>
            <button
              type="button"
              onClick={() => setForm({ ...form, announcement_enabled: !form.announcement_enabled })}
              className={`w-12 h-6 rounded-full p-1 transition ${form.announcement_enabled ? 'bg-primary' : 'bg-gray-200'}`}
            >
              <span className={`block w-4 h-4 rounded-full bg-white transition ${form.announcement_enabled ? 'translate-x-6' : ''}`} />
            </button>
          </label>
          <textarea
            value={form.announcement_text}
            onChange={(e) => setForm({ ...form, announcement_text: e.target.value })}
            placeholder="e.g. Big sale this weekend — 20% off all designs!"
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white text-dark"
          />
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-1">
            <HiGlobe className="text-primary" size={20} />
            <h3 className="font-bold text-dark">Site Name</h3>
          </div>
          <p className="text-sm text-gray-500 mb-5">Shown in the navbar and footer.</p>
          <input
            value={form.site_name}
            onChange={(e) => setForm({ ...form, site_name: e.target.value })}
            placeholder="Site name"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white text-dark"
          />
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-1">
            <HiPhone className="text-primary" size={20} />
            <HiMail className="text-gray-400" size={20} />
            <h3 className="font-bold text-dark">Contact Info</h3>
          </div>
          <p className="text-sm text-gray-500 mb-5">Used for WhatsApp and footer contact links.</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">WhatsApp number (with country code)</label>
              <input
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="e.g. 94717336756"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white text-dark"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Contact email</label>
              <input
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                placeholder="e.g. hello@lenzora.lk"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white text-dark"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition disabled:opacity-60"
        >
          {saving ? 'Saving...' : <HiSave size={16} />}
          Save Settings
        </button>
        {saved && <span className="ml-3 self-center text-sm text-green-600">Saved ✓</span>}
      </div>
    </div>
  )
}