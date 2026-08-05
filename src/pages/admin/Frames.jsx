import { useState } from 'react'
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'

export default function AdminFrames() {
  const { frames, setFrames, createFrame, updateFrame, deleteFrame, dataLoading } = useApp()
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ frame_size: '', price: '', cost: '', notes: '' })

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
    setForm({ frame_size: '', price: '', cost: '', notes: '' })
    setShowForm(true)
  }

  const openEdit = (f) => {
    setEditing(f.id)
    setForm({ frame_size: f.frame_size, price: f.price, cost: f.cost, notes: f.notes || '' })
    setShowForm(true)
  }

  const computeProfit = () => Number(form.price || 0) - Number(form.cost || 0)

  const handleSave = async () => {
    if (!form.frame_size.trim()) return
    const payload = {
      frame_size: form.frame_size.trim(),
      price: Number(form.price || 0),
      cost: Number(form.cost || 0),
      profit: computeProfit(),
      notes: form.notes.trim() || null,
    }
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateFrame(editing, payload)
        setFrames((prev) => prev.map((f) => (f.id === editing ? updated : f)))
      } else {
        const created = await createFrame(payload)
        setFrames((prev) => [created, ...prev])
      }
      setShowForm(false)
    } catch (err) {
      console.error('Failed to save frame:', err)
      alert('Failed to save frame.')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this frame?')) return
    try {
      await deleteFrame(id)
      setFrames((prev) => prev.filter((f) => f.id !== id))
    } catch (err) {
      console.error('Failed to delete frame:', err)
      alert('Failed to delete frame.')
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">Frames</h1>
          <p className="text-gray-500">Track frame income and sales. Profit feeds into daily income.</p>
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
        <div className="mb-6 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-dark">{editing ? 'Edit Frame' : 'Add Frame'}</h3>
            <span className={`text-sm font-semibold ${computeProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Profit: LKR {computeProfit().toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <input value={form.frame_size} onChange={(e) => setForm({ ...form, frame_size: e.target.value })} placeholder="Frame size (e.g. 12x16)" className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white text-dark" />
            <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price (LKR)" className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white text-dark" />
            <input type="number" min="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="Cost (LKR)" className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white text-dark" />
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optional)" className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white text-dark" />
            <div className="flex items-center gap-2">
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary-dark disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500 bg-gray-50">
                <th className="p-4 font-medium">Size</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Cost</th>
                <th className="p-4 font-medium">Profit</th>
                <th className="p-4 font-medium hidden sm:table-cell">Notes</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {frames.map((f) => (
                <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4 font-medium text-dark">{f.frame_size}</td>
                  <td className="p-4 text-gray-600">LKR {Number(f.price).toLocaleString()}</td>
                  <td className="p-4 text-gray-600">LKR {Number(f.cost).toLocaleString()}</td>
                  <td className="p-4 font-medium text-green-600">LKR {Number(f.profit).toLocaleString()}</td>
                  <td className="p-4 text-gray-600 hidden sm:table-cell">{f.notes || '-'}</td>
                  <td className="p-4 text-gray-500">{f.created_at ? new Date(f.created_at).toLocaleDateString() : '-'}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(f)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><HiPencil size={16} /></button>
                      <button onClick={() => handleDelete(f.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><HiTrash size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {frames.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-400">No frames yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}