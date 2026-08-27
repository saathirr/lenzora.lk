import { useState } from 'react'
import { HiPlus, HiCheckCircle } from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'

export default function AdminSales() {
  const { sales, setSales, frames, setFrames, createSale, dataLoading } = useApp()
  const [form, setForm] = useState({ item_name: '', amount: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const isToday = (d) => { const n = new Date(); return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate() }

  const todaySales = sales.filter((s) => isToday(new Date(s.created_at)))
  const todayFrames = frames.filter((f) => isToday(new Date(f.created_at)))

  const sumAmount = (list) => list.reduce((sum, s) => sum + Number(s.amount), 0)
  const sumProfit = (list) => list.reduce((sum, f) => sum + Number(f.profit), 0)

  const totalToday = sumAmount(todaySales) + sumProfit(todayFrames)
  const allTimeSales = sumAmount(sales) + sumProfit(frames)

  const combined = [
    ...frames.map((f) => ({
      key: `frame-${f.id}`,
      id: f.id,
      type: 'frame',
      item: f.frame_size,
      amount: Number(f.profit),
      notes: `Price LKR ${Number(f.price).toLocaleString()} · Cost LKR ${Number(f.cost).toLocaleString()} · Profit LKR ${Number(f.profit).toLocaleString()}`,
      created_at: f.created_at,
    })),
    ...sales.map((s) => ({
      key: `sale-${s.id}`,
      id: s.id,
      type: 'sale',
      item: s.item_name,
      amount: Number(s.amount),
      notes: s.notes || '',
      created_at: s.created_at,
    })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

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
          <p className="text-3xl font-bold text-dark mt-1">{todaySales.length + todayFrames.length}</p>
          <p className="text-sm text-gray-500">items sold</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">All Time Sales</p>
          <p className="text-3xl font-bold text-dark mt-1">LKR {allTimeSales.toLocaleString()}</p>
          <p className="text-sm text-gray-500">{sales.length + frames.length} entries</p>
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
                <th className="p-4 font-medium hidden sm:table-cell">Details</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {combined.map((e) => (
                <tr key={e.key} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${e.type === 'frame' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                        {e.type}
                      </span>
                      <span className="font-medium text-dark">{e.item}</span>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-green-600">LKR {e.amount.toLocaleString()}</td>
                  <td className="p-4 text-gray-600 hidden sm:table-cell">{e.notes || '-'}</td>
                  <td className="p-4 text-gray-500">{e.created_at ? new Date(e.created_at).toLocaleDateString() : '-'}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400" title="Sales history is protected">
                      <HiCheckCircle size={13} />
                      Kept
                    </span>
                  </td>
                </tr>
              ))}
              {combined.length === 0 && (
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
