import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  HiScale, HiPlus, HiPencil, HiX, HiTrash, HiCheckCircle, HiClock,
  HiCalendar, HiUser, HiSearch, HiReceiptRefund,
} from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'

const today = () => new Date().toISOString().slice(0, 10)

const fmt = (n) => Math.round(Number(n)).toLocaleString()

const startOfDay = (d) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

// Whole days between today and the due date. Negative = overdue.
const daysLeft = (dueDate) => {
  if (!dueDate) return null
  return Math.round((startOfDay(dueDate) - startOfDay(new Date())) / 86400000)
}

const daysMeta = (days) => {
  if (days === null) return { label: 'No due date', tone: 'gray' }
  if (days < 0) return { label: `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`, tone: 'red' }
  if (days === 0) return { label: 'Due today', tone: 'red' }
  if (days <= 7) return { label: `${days} day${days === 1 ? '' : 's'} left`, tone: 'amber' }
  return { label: `${days} days left`, tone: 'green' }
}

const toneClass = {
  gray: 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-slate-400',
  green: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  red: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
}

const emptyForm = { name: '', amount: '', description: '', credit_date: today(), due_date: '' }

export default function AdminCredit() {
  const { credits, setCredits, createCredit, updateCredit, deleteCredit, createSale, deleteSale, setSales, dataLoading } = useApp()
  const [form, setForm] = useState(emptyForm)
  const [editForm, setEditForm] = useState({ ...emptyForm })
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [query, setQuery] = useState('')

  const sum = (list) => list.reduce((s, c) => s + Number(c.amount || 0), 0)

  const unpaid = credits.filter((c) => c.status !== 'paid')
  const paid = credits.filter((c) => c.status === 'paid')
  const outstanding = sum(unpaid)
  const collected = sum(paid)
  const overdueCount = unpaid.filter((c) => {
    const d = daysLeft(c.due_date)
    return d !== null && d <= 0
  }).length

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return credits.filter((c) => {
      if (statusFilter === 'unpaid' && c.status === 'paid') return false
      if (statusFilter === 'paid' && c.status !== 'paid') return false
      if (statusFilter === 'overdue') {
        const d = daysLeft(c.due_date)
        if (c.status === 'paid' || d === null || d > 0) return false
      }
      if (!q) return true
      return (
        (c.name || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
      )
    })
  }, [credits, statusFilter, query])

  const startEdit = (c) => {
    setEditing(c.id)
    setEditForm({
      name: c.name || '',
      amount: c.amount != null ? String(c.amount) : '',
      description: c.description || '',
      credit_date: (c.credit_date || c.created_at || '').slice(0, 10),
      due_date: c.due_date ? String(c.due_date).slice(0, 10) : '',
    })
  }

  const cancelEdit = () => {
    setEditing(null)
    setEditForm({ ...emptyForm })
  }

  const handleAdd = async () => {
    if (!form.name.trim() || !form.amount) return
    setSaving(true)
    try {
      const created = await createCredit({
        name: form.name.trim(),
        amount: Number(form.amount),
        description: form.description.trim() || null,
        credit_date: form.credit_date || today(),
        due_date: form.due_date || null,
        status: 'unpaid',
      })
      setCredits((prev) => [created, ...prev])
      setForm({ ...emptyForm })
      setShowForm(false)
    } catch (err) {
      console.error('Failed to add credit:', err)
      alert('Failed to add credit.')
    }
    setSaving(false)
  }

  const handleEdit = async () => {
    if (!editing || !editForm.name.trim() || !editForm.amount) return
    setSaving(true)
    try {
      const updated = await updateCredit(editing, {
        name: editForm.name.trim(),
        amount: Number(editForm.amount),
        description: editForm.description.trim() || null,
        credit_date: editForm.credit_date || today(),
        due_date: editForm.due_date || null,
      })
      setCredits((prev) => prev.map((c) => (c.id === editing ? { ...c, ...updated } : c)))
      cancelEdit()
    } catch (err) {
      console.error('Failed to update credit:', err)
      alert('Failed to update credit.')
    }
    setSaving(false)
  }

  const handleDelete = async (c) => {
    if (!confirm(`Delete credit "${c.name}"?`)) return
    try {
      await deleteCredit(c.id)
      setCredits((prev) => prev.filter((x) => x.id !== c.id))
      if (editing === c.id) cancelEdit()
    } catch (err) {
      console.error('Failed to delete credit:', err)
      alert('Failed to delete credit.')
    }
  }

  // Toggling to "paid" writes the amount into Sales automatically.
  // Toggling back to "unpaid" removes that sales entry again.
  const togglePaid = async (c) => {
    if (busyId) return
    setBusyId(c.id)
    setSaving(true)
    try {
      if (c.status === 'paid') {
        const updated = await updateCredit(c.id, { status: 'unpaid', paid_date: null, sale_id: null })
        setCredits((prev) => prev.map((x) => (x.id === c.id ? { ...x, ...updated } : x)))
        if (c.sale_id) {
          try {
            await deleteSale(c.sale_id)
            setSales((prev) => prev.filter((s) => s.id !== c.sale_id))
          } catch (saleErr) {
            console.error('Failed to remove linked sale:', saleErr)
            alert('Credit marked unpaid, but its sales entry could not be removed. Delete it from the Sales page manually.')
          }
        }
        return
      }

      const created = await createSale({
        item_name: c.name,
        amount: Number(c.amount),
        notes: `Credit payment${c.description ? ` - ${c.description}` : ''} · Credit #${c.id}`,
      })
      setSales((prev) => [created, ...prev])
      const updated = await updateCredit(c.id, { status: 'paid', paid_date: today(), sale_id: created.id })
      setCredits((prev) => prev.map((x) => (x.id === c.id ? { ...x, ...updated } : x)))
    } catch (err) {
      console.error('Failed to update credit status:', err)
      alert('Failed to update credit status.')
    }
    setSaving(false)
    setBusyId(null)
  }

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'unpaid', label: 'Unpaid' },
    { key: 'paid', label: 'Paid' },
    { key: 'overdue', label: 'Overdue' },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-dark dark:text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <HiScale size={20} />
            </span>
            Credit
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Track cash credit given to customers. Marking one as paid adds it to Sales automatically.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition"
        >
          <HiPlus />
          Add Credit
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-sm">
          <p className="text-sm text-white/80 flex items-center gap-1.5"><HiScale size={15} /> Outstanding</p>
          <p className="text-3xl font-bold mt-1 tabular-nums">LKR {fmt(outstanding)}</p>
          <p className="text-xs text-white/80 mt-1">{unpaid.length} unpaid credit(s)</p>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
          <p className="text-sm text-white/80 flex items-center gap-1.5"><HiCheckCircle size={15} /> Collected</p>
          <p className="text-3xl font-bold mt-1 tabular-nums">LKR {fmt(collected)}</p>
          <p className="text-xs text-white/80 mt-1">{paid.length} paid credit(s)</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] shadow-sm">
          <p className="text-sm text-gray-500 dark:text-slate-400">Total Credited</p>
          <p className="text-3xl font-bold text-dark dark:text-white mt-1 tabular-nums">LKR {fmt(outstanding + collected)}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400">{credits.length} credit(s)</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] shadow-sm">
          <p className="text-sm text-gray-500 dark:text-slate-400">Overdue</p>
          <p className={`text-3xl font-bold mt-1 tabular-nums ${overdueCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-dark dark:text-white'}`}>{overdueCount}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400">past due date</p>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 p-6 bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm">
          <h3 className="font-bold text-dark dark:text-white mb-4 flex items-center gap-2">
            <HiPlus size={16} className="text-primary" />
            Add Credit
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Customer name"
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-white/10 text-dark dark:text-slate-200 focus:border-primary outline-none"
            />
            <input
              type="number"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="Amount (LKR)"
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-white/10 text-dark dark:text-slate-200 focus:border-primary outline-none"
            />
            <input
              type="date"
              value={form.credit_date}
              onChange={(e) => setForm({ ...form, credit_date: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-white/10 text-dark dark:text-slate-200 focus:border-primary outline-none"
            />
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-white/10 text-dark dark:text-slate-200 focus:border-primary outline-none"
            />
          </div>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description (optional)"
            className="mt-3 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-white/10 text-dark dark:text-slate-200 focus:border-primary outline-none resize-none"
          />
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleAdd}
              disabled={saving || !form.name.trim() || !form.amount}
              className="px-4 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary-dark disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Add'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            {form.due_date && (
              <span className={`ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${toneClass[daysMeta(daysLeft(form.due_date)).tone]}`}>
                <HiClock size={11} />
                {daysMeta(daysLeft(form.due_date)).label}
              </span>
            )}
          </div>
        </div>
      )}

      {editing && (
        <div className="mb-6 p-6 bg-white dark:bg-[#141414] border border-primary/30 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-dark dark:text-white">Edit Credit #{editing}</h3>
            <button onClick={cancelEdit} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
              <HiX size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="Customer name"
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-white/10 text-dark dark:text-slate-200 focus:border-primary outline-none"
            />
            <input
              type="number"
              min="0"
              value={editForm.amount}
              onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
              placeholder="Amount (LKR)"
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-white/10 text-dark dark:text-slate-200 focus:border-primary outline-none"
            />
            <input
              type="date"
              value={editForm.credit_date}
              onChange={(e) => setEditForm({ ...editForm, credit_date: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-white/10 text-dark dark:text-slate-200 focus:border-primary outline-none"
            />
            <input
              type="date"
              value={editForm.due_date}
              onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-white/10 text-dark dark:text-slate-200 focus:border-primary outline-none"
            />
          </div>
          <textarea
            rows={2}
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            placeholder="Description (optional)"
            className="mt-3 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-white/10 text-dark dark:text-slate-200 focus:border-primary outline-none resize-none"
          />
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleEdit}
              disabled={saving || !editForm.name.trim() || !editForm.amount}
              className="px-4 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary-dark disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={cancelEdit} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            {editForm.due_date && (
              <span className={`ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${toneClass[daysMeta(daysLeft(editForm.due_date)).tone]}`}>
                <HiClock size={11} />
                {daysMeta(daysLeft(editForm.due_date)).label}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-gray-100 dark:border-[#262626]">
          <h2 className="text-lg font-bold text-dark dark:text-white flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-md">
              <HiReceiptRefund size={17} />
            </span>
            Credit List
          </h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <HiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or description"
                className="w-full sm:w-60 pl-9 pr-3 py-2 text-sm rounded-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-white/10 text-dark dark:text-slate-200 focus:border-primary outline-none"
              />
            </div>
            <div className="flex gap-1 bg-gray-100 dark:bg-white/5 rounded-full p-1 border border-gray-100 dark:border-white/5">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition ${statusFilter === f.key ? 'bg-white dark:bg-white/15 text-primary shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#262626] text-left text-gray-500 dark:text-slate-400">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium hidden md:table-cell">Description</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Days</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const isPaid = c.status === 'paid'
                const meta = daysMeta(isPaid ? null : daysLeft(c.due_date))
                return (
                  <tr key={c.id} className="border-b border-gray-50 dark:border-[#1d1d24] hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-medium text-dark dark:text-white">
                        <HiUser size={14} className="text-gray-400" />
                        {c.name}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-red-600 dark:text-red-400 tabular-nums">LKR {fmt(c.amount)}</td>
                    <td className="p-4 text-gray-600 dark:text-slate-400 hidden md:table-cell">{c.description || '-'}</td>
                    <td className="p-4 text-gray-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        <HiCalendar size={13} />
                        {new Date(c.credit_date || c.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      {isPaid ? (
                        <span className="text-xs text-gray-400 dark:text-slate-500">-</span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${toneClass[meta.tone]}`}>
                          <HiClock size={11} />
                          {meta.label}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => togglePaid(c)}
                        disabled={saving || busyId === c.id}
                        title={isPaid ? 'Mark as unpaid (removes the sales entry)' : 'Mark as paid (adds to Sales)'}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition disabled:opacity-50 ${
                          isPaid
                            ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 hover:bg-green-100'
                            : 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 hover:bg-orange-100'
                        }`}
                      >
                        {busyId === c.id ? <HiClock size={12} className="animate-spin" /> : isPaid ? <HiCheckCircle size={12} /> : <HiClock size={12} />}
                        {busyId === c.id ? 'Saving' : isPaid ? 'Paid' : 'Unpaid'}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit credit">
                          <HiPencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(c)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete credit">
                          <HiTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-400 dark:text-slate-500">No credit records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-[#262626] flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-slate-400">{filtered.length} of {credits.length} credit(s)</span>
          <motion.span
            key={filtered.length}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-extrabold text-dark dark:text-white tabular-nums"
          >
            LKR {fmt(sum(filtered))}
          </motion.span>
        </div>
      </div>
    </div>
  )
}