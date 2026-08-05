import { useState } from 'react'
import { HiPlus, HiTrash } from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'

export default function AdminSales() {
  const { sales, setSales, createSale, deleteSale, dataLoading } = useApp()
  const [form, setForm] = useState({ item_name: '', amount: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const todaySales = sales.filter((s) => {
    const d = new Date(s.created_at)
    const now = new Date()
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
  })

  const totalToday = todaySales.reduce((sum, s) => sum + Number(s.amount), 0)

  const handleAdd = async () => {
    if (!form.item_name.trim() || !form.amount) return
    setSaving(true)
    try {
      const created = await createSale({
        item_name: form.item_name.trim(),
        amount: Number(form.amount),
        notes: form.notes.trim() || null,
      })
      setSales((prev) => [created, ...prev])
      setForm({ item_name: '', amount: '', notes: '' })
      setShowForm(false)
    } catch (err) {
      console.error('Failed to add sale:', err)
      alert('Failed to add sale.')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this sale entry?')) return
    try {
      await deleteSale(id)
      setSales((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      console.error('Failed to delete sale:', err)
      alert('Failed to delete sale.')
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
          <h1 className="text-2xl font-bold text-dark">Today's Sales</h1>
          <p className="text-gray-500">Manually record items sold today. Total updates automatically.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition"
        >
          <HiPlus />
          Add Sale
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-sm">
          <p className="text-sm text-white/80">Today's Total</p>
          <p className="text-3xl font-bold mt-1">LKR {totalToday.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">{todayLabel}</p>
          <p className="text-3xl font-bold text-dark mt-1">{todaySales.length}</p>
          <p className="text-sm text-gray-500">items sold</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">All Time Sales</p>
          <p className="text-3xl font-bold text-dark mt-1">LKR {sales.reduce((sum, s) => sum + Number(s.amount), 0).toLocaleString()}</p>
          <p className="text-sm text-gray-500">{sales.length} entries</p>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <h3 className="font-bold text-dark mb-4">Add Today's Sale</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              value={form.item_name}
              onChange={(e) => setForm({ ...form, item_name: e.target.value })}
              placeholder="Design / item name"
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none"
            />
            <input
              type="number"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="Amount (LKR)"
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none"
            />
            <input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Notes (optional)"
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none"
            />
            <div className="flex items-center gap-2">
              <button onClick={handleAdd} disabled={saving || !form.item_name.trim() || !form.amount} className="px-4 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary-dark disabled:opacity-50">
                {saving ? 'Saving...' : 'Add'}
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
                <th className="p-4 font-medium">Item</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium hidden sm:table-cell">Notes</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4 font-medium text-dark">{s.item_name}</td>
                  <td className="p-4 font-medium text-green-600">LKR {Number(s.amount).toLocaleString()}</td>
                  <td className="p-4 text-gray-600 hidden sm:table-cell">{s.notes || '-'}</td>
                  <td className="p-4 text-gray-500">{s.created_at ? new Date(s.created_at).toLocaleDateString() : '-'}</td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(s.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                      <HiTrash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400">No sales recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
