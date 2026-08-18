import { useRef, useState } from 'react'
import { HiPlus, HiTrash, HiUpload, HiPhotograph, HiOutlineCheck, HiOutlineX } from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'
import { uploadFile } from '../../lib/db'

export default function AdminFramesSettings() {
  const { frames, frameCategories, setFrameCategories, createFrameCategory, updateFrameCategory, deleteFrameCategory, dataLoading } = useApp()
  const [savingId, setSavingId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newImage, setNewImage] = useState(null)
  const fileRefs = useRef({})

  const categoryCount = (name) =>
    frames.filter((f) => (f.category || '').trim().toUpperCase() === (name || '').trim().toUpperCase()).length

  const handleImage = (cat, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.')
      return
    }
    e.target.value = ''
    setSavingId(cat.id)
    uploadFile('frame-images', `frame-category-${cat.id}-${Date.now()}.${file.name.split('.').pop().toLowerCase()}`, file)
      .then(async (url) => {
        const updated = await updateFrameCategory(cat.id, { image_url: url })
        setFrameCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)))
      })
      .catch((err) => {
        console.error('Failed to upload category photo:', err)
        alert('Failed to upload category photo.')
      })
      .finally(() => setSavingId(null))
  }

  const handleToggle = async (cat) => {
    setSavingId(cat.id)
    try {
      const updated = await updateFrameCategory(cat.id, { active: !(cat.active !== false) })
      setFrameCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)))
    } catch (err) {
      console.error('Failed to update category:', err)
      alert('Failed to update category.')
    }
    setSavingId(null)
  }

  const handleDelete = async (cat) => {
    if (!confirm(`Delete "${cat.name}" category from the site?`)) return
    try {
      await deleteFrameCategory(cat.id)
      setFrameCategories((prev) => prev.filter((c) => c.id !== cat.id))
    } catch (err) {
      console.error('Failed to delete category:', err)
      alert('Failed to delete category.')
    }
  }

  const handleMove = async (cat, dir) => {
    const sorted = [...frameCategories].sort((a, b) => a.sort_order - b.sort_order)
    const idx = sorted.findIndex((c) => c.id === cat.id)
    const swapIdx = idx + dir
    if (idx < 0 || swapIdx < 0 || swapIdx >= sorted.length) return
    const other = sorted[swapIdx]
    setSavingId(cat.id)
    try {
      const [a, b] = await Promise.all([
        updateFrameCategory(cat.id, { sort_order: other.sort_order }),
        updateFrameCategory(other.id, { sort_order: cat.sort_order }),
      ])
      setFrameCategories((prev) => prev.map((c) => {
        if (c.id === a.id) return a
        if (c.id === b.id) return b
        return c
      }))
    } catch (err) {
      console.error('Failed to reorder category:', err)
      alert('Failed to reorder category.')
    }
    setSavingId(null)
  }

  const handleAdd = async () => {
    if (!newName.trim()) return
    setSavingId('new')
    try {
      let imageUrl = ''
      if (newImage) {
        imageUrl = await uploadFile('frame-images', `frame-category-${Date.now()}.${newImage.name.split('.').pop().toLowerCase()}`, newImage)
      }
      const nextOrder = frameCategories.length ? Math.max(...frameCategories.map((c) => c.sort_order)) + 1 : 1
      const created = await createFrameCategory({ name: newName.trim(), image_url: imageUrl, active: true, sort_order: nextOrder })
      setFrameCategories((prev) => [...prev, created])
      setShowAdd(false)
      setNewName('')
      setNewImage(null)
    } catch (err) {
      console.error('Failed to add category:', err)
      alert('Failed to add category.')
    }
    setSavingId(null)
  }

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const sorted = [...frameCategories].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">Frames Settings</h1>
          <p className="text-gray-500">Control the categories &amp; photos shown on the customer Frames page. Add a photo to each category to display it on the site.</p>
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition"
        >
          {showAdd ? <HiOutlineX /> : <HiPlus />}
          {showAdd ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {showAdd && (
        <div className="mb-6 p-6 bg-white border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm">
          <h3 className="font-bold text-dark mb-4">Add Category</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Category name (e.g. 8x10 Frames)"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2f2f2f] focus:border-primary outline-none bg-white dark:bg-[#141414] text-dark dark:text-white"
            />
            <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary text-sm font-semibold rounded-xl hover:bg-primary/20 transition cursor-pointer">
              <HiUpload size={16} />
              {newImage ? newImage.name : 'Choose Photo'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (!file.type.startsWith('image/')) return alert('Please choose an image file.')
                setNewImage(file)
                e.target.value = ''
              }} />
            </label>
            <button
              onClick={handleAdd}
              disabled={savingId === 'new' || !newName.trim()}
              className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-50 transition"
            >
              {savingId === 'new' ? 'Adding...' : 'Add Category'}
            </button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm">
          <HiPhotograph size={40} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
          <p className="text-gray-500 dark:text-slate-400">No categories yet. Add your first frame category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sorted.map((cat, i) => (
            <div key={cat.id} className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm overflow-hidden">
              <div className="relative aspect-[4/3] bg-gray-100 dark:bg-white/5 overflow-hidden">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-slate-600">
                    <HiPhotograph size={40} />
                    <p className="text-xs mt-2">No photo uploaded</p>
                  </div>
                )}
                {savingId === cat.id && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-7 h-7 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${cat.active !== false ? 'bg-green-500/90 text-white' : 'bg-gray-700/80 text-white'}`}>
                  {cat.active !== false ? 'Visible' : 'Hidden'}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-extrabold text-dark truncate">{cat.name}</h3>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-full shrink-0">
                    {categoryCount(cat.name)} frames
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className={`inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-dark transition cursor-pointer flex-1 justify-center ${savingId === cat.id ? 'opacity-50 pointer-events-none' : ''}`}>
                    <HiUpload size={14} />
                    {cat.image_url ? 'Replace Photo' : 'Upload Photo'}
                    <input type="file" accept="image/*" className="hidden" ref={(el) => { fileRefs.current[cat.id] = el }} onChange={(e) => handleImage(cat, e)} />
                  </label>
                  <button
                    onClick={() => handleToggle(cat)}
                    disabled={savingId === cat.id}
                    title={cat.active !== false ? 'Hide from site' : 'Show on site'}
                    className={`p-2 rounded-xl border transition disabled:opacity-50 ${cat.active !== false ? 'text-green-600 border-green-200 dark:border-green-500/30 hover:bg-green-50 dark:hover:bg-green-500/10' : 'text-gray-400 border-gray-200 dark:border-[#2f2f2f] hover:bg-gray-50 dark:hover:bg-white/5'}`}
                  >
                    <HiOutlineCheck size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    disabled={savingId === cat.id}
                    className="p-2 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition disabled:opacity-50"
                    title="Delete category"
                  >
                    <HiTrash size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <button onClick={() => handleMove(cat, -1)} disabled={i === 0 || savingId === cat.id} className="text-xs font-semibold text-gray-500 hover:text-primary disabled:opacity-30 transition">↑ Move Up</button>
                  <span className="text-xs text-gray-400">{i + 1} of {sorted.length}</span>
                  <button onClick={() => handleMove(cat, 1)} disabled={i === sorted.length - 1 || savingId === cat.id} className="text-xs font-semibold text-gray-500 hover:text-primary disabled:opacity-30 transition">Move Down ↓</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
