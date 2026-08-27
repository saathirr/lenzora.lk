import { useState } from 'react'
import { HiPlus, HiPencil, HiUpload, HiCheckCircle } from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'
import { uploadFile } from '../../lib/db'

export default function AdminFrames() {
  const { frames, setFrames, createFrame, updateFrame, dataLoading } = useApp()
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pendingImage, setPendingImage] = useState(null)
  const [form, setForm] = useState({ frame_size: '', price: '', cost: '', category: '', description: '', notes: '', active: true })

  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const todayFrames = frames.filter((f) => {
    const d = new Date(f.created_at)
    const now = new Date()
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
  })

  const sumProfit = (list) => list.reduce((sum, f) => sum + Number(f.profit), 0)
  const profitToday = sumProfit(todayFrames)
  const profitAll = sumProfit(frames)

  const openNew = () => {
    setEditing(null)
    setPendingImage(null)
    setForm({ frame_size: '', price: '', cost: '', category: '', description: '', notes: '', active: true })
    setShowForm(true)
  }

  const openEdit = (f) => {
    setEditing(f.id)
    setPendingImage(null)
    setForm({
      frame_size: f.frame_size,
      price: f.price,
      cost: f.cost,
      category: f.category || '',
      description: f.description || '',
      notes: f.notes || '',
      active: f.active !== false,
    })
    setShowForm(true)
  }

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.')
      return
    }
    setPendingImage({ file, preview: URL.createObjectURL(file) })
    e.target.value = ''
  }

  const computeProfit = () => Number(form.price || 0) - Number(form.cost || 0)

  const handleSave = async () => {
    if (!form.frame_size.trim()) return
    setSaving(true)
    try {
      let imageUrl = editing
        ? (frames.find((f) => f.id === editing)?.image_url || '')
        : ''
      if (pendingImage) {
        const ext = pendingImage.file.name.split('.').pop().toLowerCase()
        imageUrl = await uploadFile('frame-images', `frame-${Date.now()}.${ext}`, pendingImage.file)
      }
      const payload = {
        frame_size: form.frame_size.trim(),
        price: Number(form.price || 0),
        cost: Number(form.cost || 0),
        profit: computeProfit(),
        image_url: imageUrl,
        category: form.category.trim() || null,
        description: form.description.trim() || null,
        notes: form.notes.trim() || null,
        active: form.active,
      }
      if (editing) {
        const updated = await updateFrame(editing, payload)
        setFrames((prev) => prev.map((f) => (f.id === editing ? updated : f)))
      } else {
        const created = await createFrame(payload)
        setFrames((prev) => [created, ...prev])
      }
      setShowForm(false)
      setPendingImage(null)
    } catch (err) {
      console.error('Failed to save frame:', err)
      alert('Failed to save frame.')
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

  const imagePreview = pendingImage?.preview || ''
  const existingImage = editing ? (frames.find((f) => f.id === editing)?.image_url || '') : ''
  const previewSrc = imagePreview || (showForm && existingImage)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">Frames</h1>
          <p className="text-gray-500">Manage frame sizes, prices & photos shown on the site. Profit feeds into daily income.</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition"
        >
          <HiPlus />
          Add Frame
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-sm">
          <p className="text-sm text-white/80">Today's Profit</p>
          <p className="text-3xl font-bold mt-1">LKR {profitToday.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">{todayLabel}</p>
          <p className="text-3xl font-bold text-dark mt-1">{todayFrames.length}</p>
          <p className="text-sm text-gray-500">frames sold</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">All Time Profit</p>
          <p className="text-3xl font-bold text-dark mt-1">LKR {profitAll.toLocaleString()}</p>
          <p className="text-sm text-gray-500">{frames.length} frames</p>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 p-6 bg-white border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-dark">{editing ? 'Edit Frame' : 'Add Frame'}</h3>
            <span className={`text-sm font-semibold ${computeProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Profit: LKR {computeProfit().toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 mb-5">
            <div className="w-full sm:w-44">
              <div className={`w-44 h-44 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden ${previewSrc ? 'border-primary/40 bg-gray-50 dark:bg-white/5' : 'border-gray-300 dark:border-[#2f2f2f] bg-gray-50 dark:bg-white/5'}`}>
                {previewSrc ? (
                  <img src={previewSrc} alt="Frame preview" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="text-center text-gray-400 dark:text-slate-500 px-3">
                    <HiUpload size={22} className="mx-auto mb-1" />
                    <p className="text-[11px]">No image</p>
                  </div>
                )}
              </div>
              <label className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-dark transition cursor-pointer">
                <HiUpload size={14} />
                {previewSrc ? 'Replace Image' : 'Upload Image'}
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <input value={form.frame_size} onChange={(e) => setForm({ ...form, frame_size: e.target.value })} placeholder="Frame size (e.g. 12x16)" className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2f2f2f] focus:border-primary outline-none bg-white dark:bg-[#141414] text-dark dark:text-white" />
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category (optional)" className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2f2f2f] focus:border-primary outline-none bg-white dark:bg-[#141414] text-dark dark:text-white" />
                <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price (LKR)" className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2f2f2f] focus:border-primary outline-none bg-white dark:bg-[#141414] text-dark dark:text-white" />
                <input type="number" min="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="Cost (LKR)" className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2f2f2f] focus:border-primary outline-none bg-white dark:bg-[#141414] text-dark dark:text-white" />
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description (optional)" className="sm:col-span-2 lg:col-span-4 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2f2f2f] focus:border-primary outline-none bg-white dark:bg-[#141414] text-dark dark:text-white" />
                <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Private notes (only you see these)" className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2f2f2f] focus:border-primary outline-none bg-white dark:bg-[#141414] text-dark dark:text-white" />
              </div>
              <label className="flex items-center gap-2 mt-5 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-gray-600 dark:text-slate-300 font-medium">Visible on the site</span>
              </label>
              <div className="flex items-center gap-3 mt-5">
                <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary-dark disabled:opacity-50">
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Frame'}
                </button>
                <button onClick={() => { setShowForm(false); setPendingImage(null) }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-slate-300">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#262626] text-left text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-white/5">
                <th className="p-4 font-medium">Frame</th>
                <th className="p-4 font-medium hidden sm:table-cell">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium hidden md:table-cell">Cost</th>
                <th className="p-4 font-medium">Profit</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium hidden lg:table-cell">Date</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {frames.map((f) => (
                <tr key={f.id} className="border-b border-gray-50 dark:border-[#1d1d24] hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {f.image_url ? (
                        <img src={f.image_url} alt={f.frame_size} className="w-11 h-11 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
                          <HiUpload size={16} />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-dark">{f.frame_size}</p>
                        {f.description && <p className="text-xs text-gray-400 dark:text-slate-500 max-w-[220px] truncate">{f.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-slate-300 hidden sm:table-cell">{f.category || '-'}</td>
                  <td className="p-4 font-medium text-dark">LKR {Number(f.price).toLocaleString()}</td>
                  <td className="p-4 text-gray-600 dark:text-slate-300 hidden md:table-cell">LKR {Number(f.cost).toLocaleString()}</td>
                  <td className="p-4 font-medium text-green-600 dark:text-green-400">LKR {Number(f.profit).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${f.active !== false ? 'bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-slate-400'}`}>
                      {f.active !== false ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 dark:text-slate-400 hidden lg:table-cell">{f.created_at ? new Date(f.created_at).toLocaleDateString() : '-'}</td>
                  <td className="p-4">
                    <div className="flex gap-2 items-center">
                      <button onClick={() => openEdit(f)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition"><HiPencil size={16} /></button>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400" title="Frame sales are protected">
                        <HiCheckCircle size={12} />
                        Kept
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {frames.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-400 dark:text-slate-500">No frames yet. Add your first frame to showcase it on the site.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}