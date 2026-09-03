import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { HiCash, HiPlus, HiPencil, HiX, HiTrash, HiChartBar, HiTag, HiCalendar, HiCreditCard, HiArrowDown, HiArrowUp } from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'

const CATEGORIES = [
  'Rent', 'Utilities', 'Transport', 'Food', 'Materials', 'Software', 'Marketing', 'Salary', 'Other',
]

const fmt = (n) => Math.round(Number(n)).toLocaleString()

export default function AdminExpenses() {
  const { expenses, setExpenses, createExpense, updateExpense, deleteExpense, settings, setSettings, updateSiteSettings, dataLoading } = useApp()
  const [bankModal, setBankModal] = useState(false)
  const [bankAction, setBankAction] = useState('deposit')
  const [bankAmount, setBankAmount] = useState('')
  const [bankSaving, setBankSaving] = useState(false)
  const [form, setForm] = useState({ title: '', amount: '', category: 'Other', notes: '', expense_date: new Date().toISOString().slice(0, 10) })
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', amount: '', category: 'Other', notes: '', expense_date: '' })
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [monthFilter, setMonthFilter] = useState('all')

  const bankBalance = Number(settings.bank_balance || 0)

  const adjustBank = async (delta) => {
    const next = Math.round((bankBalance + delta) * 100) / 100
    setSettings((prev) => ({ ...prev, bank_balance: next }))
    try {
      await updateSiteSettings(1, { bank_balance: next })
    } catch (err) {
      console.error('Failed to update bank balance:', err)
      setSettings((prev) => ({ ...prev, bank_balance: bankBalance }))
    }
  }

  const handleBankModal = async () => {
    const amt = Number(bankAmount)
    if (!amt || amt <= 0) return
    setBankSaving(true)
    if (bankAction === 'withdraw') {
      await adjustBank(-amt)
    } else {
      await adjustBank(amt)
    }
    setBankSaving(false)
    setBankAmount('')
    setBankModal(false)
  }

  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const isToday = (d) => {
    const n = new Date()
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()
  }

  const todayExpenses = expenses.filter((e) => isToday(new Date(e.expense_date || e.created_at)))
  const todayTotal = todayExpenses.reduce((s, e) => s + Number(e.amount || 0), 0)
  const allTimeTotal = expenses.reduce((s, e) => s + Number(e.amount || 0), 0)

  const monthOptions = useMemo(() => {
    const set = new Set(expenses.map((e) => {
      const d = new Date(e.expense_date || e.created_at)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }))
    return [...set].sort().reverse()
  }, [expenses])

  const monthLabel = (key) => {
    if (key === 'all') return 'All Time'
    const [y, m] = key.split('-').map(Number)
    return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  }

  const filtered = useMemo(() => {
    if (monthFilter === 'all') return expenses
    return expenses.filter((e) => {
      const d = new Date(e.expense_date || e.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      return key === monthFilter
    })
  }, [expenses, monthFilter])

  const filteredTotal = filtered.reduce((s, e) => s + Number(e.amount || 0), 0)

  const byCategory = useMemo(() => {
    const map = {}
    filtered.forEach((e) => {
      const c = e.category || 'Other'
      map[c] = (map[c] || 0) + Number(e.amount || 0)
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [filtered])

  const maxCat = byCategory[0]?.[1] || 1

  const startEdit = (e) => {
    setEditing(e.id)
    setEditForm({
      title: e.title || '',
      amount: e.amount != null ? String(e.amount) : '',
      category: e.category || 'Other',
      notes: e.notes || '',
      expense_date: (e.expense_date || e.created_at || '').slice(0, 10),
    })
  }

  const cancelEdit = () => {
    setEditing(null)
    setEditForm({ title: '', amount: '', category: 'Other', notes: '', expense_date: '' })
  }

  const handleAdd = async () => {
    if (!form.title.trim() || !form.amount) return
    setSaving(true)
    try {
      const created = await createExpense({
        title: form.title.trim(),
        amount: Number(form.amount),
        category: form.category,
        notes: form.notes.trim() || null,
        expense_date: form.expense_date || new Date().toISOString().slice(0, 10),
      })
      setExpenses((prev) => [created, ...prev])
      await adjustBank(-Number(form.amount))
      setForm({ title: '', amount: '', category: 'Other', notes: '', expense_date: new Date().toISOString().slice(0, 10) })
      setShowForm(false)
    } catch (err) {
      console.error('Failed to add expense:', err)
      alert('Failed to add expense.')
    }
    setSaving(false)
  }

  const handleEdit = async () => {
    if (!editing || !editForm.title.trim() || !editForm.amount) return
    const original = expenses.find((e) => e.id === editing)
    const oldAmount = original ? Number(original.amount) : 0
    const newAmount = Number(editForm.amount)
    setSaving(true)
    try {
      const updated = await updateExpense(editing, {
        title: editForm.title.trim(),
        amount: newAmount,
        category: editForm.category,
        notes: editForm.notes.trim() || null,
        expense_date: editForm.expense_date || new Date().toISOString().slice(0, 10),
      })
      setExpenses((prev) => prev.map((e) => (e.id === editing ? { ...e, ...updated } : e)))
      await adjustBank(oldAmount - newAmount)
      cancelEdit()
    } catch (err) {
      console.error('Failed to update expense:', err)
      alert('Failed to update expense.')
    }
    setSaving(false)
  }

  const handleDelete = async (e) => {
    if (!confirm(`Delete expense "${e.title}"?`)) return
    try {
      await deleteExpense(e.id)
      setExpenses((prev) => prev.filter((x) => x.id !== e.id))
      await adjustBank(Number(e.amount || 0))
      if (editing === e.id) cancelEdit()
    } catch (err) {
      console.error('Failed to delete expense:', err)
      alert('Failed to delete expense.')
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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-dark flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <HiCash size={20} />
            </span>
            Expenses
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Track your day-to-day expenses — {todayLabel}.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition"
        >
          <HiPlus />
          Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/80 flex items-center gap-1.5">
              <HiCreditCard size={15} /> Bank Balance
            </p>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => { setBankAction('deposit'); setBankModal(true) }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition text-xs font-semibold"
              >
                <HiArrowDown size={13} /> Deposit
              </button>
              <button
                onClick={() => { setBankAction('withdraw'); setBankModal(true) }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition text-xs font-semibold"
              >
                <HiArrowUp size={13} /> Withdraw
              </button>
            </div>
          </div>
          <p className="text-3xl font-bold mt-1 tabular-nums">LKR {fmt(bankBalance)}</p>
          <p className="text-xs text-white/80 mt-1">Auto-deducts when you add an expense</p>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-sm">
          <p className="text-sm text-white/80">Today's Total</p>
          <p className="text-3xl font-bold mt-1">LKR {fmt(todayTotal)}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">{monthFilter === 'all' ? 'All Time' : monthLabel(monthFilter)}</p>
          <p className="text-3xl font-bold text-dark mt-1">LKR {fmt(filteredTotal)}</p>
          <p className="text-sm text-gray-500">{filtered.length} expense(s)</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">All Time Total</p>
          <p className="text-3xl font-bold text-dark mt-1">LKR {fmt(allTimeTotal)}</p>
          <p className="text-sm text-gray-500">{expenses.length} expense(s)</p>
        </div>
      </div>

      {bankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setBankModal(false)}>
          <div className="w-full max-w-sm bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-dark dark:text-white mb-1 flex items-center gap-2">
              <HiCreditCard size={18} className="text-emerald-500" />
              {bankAction === 'deposit' ? 'Deposit to Bank' : 'Withdraw from Bank'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              Current balance: <strong className="text-dark dark:text-white">LKR {fmt(bankBalance)}</strong>
            </p>
            <input
              type="number"
              min="0"
              autoFocus
              value={bankAmount}
              onChange={(e) => setBankAmount(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBankModal()}
              placeholder="Amount (LKR)"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-white/10 text-dark dark:text-slate-200 focus:border-primary outline-none"
            />
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={handleBankModal}
                disabled={bankSaving || !Number(bankAmount)}
                className="flex-1 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition disabled:opacity-50"
              >
                {bankSaving ? 'Saving...' : bankAction === 'deposit' ? 'Deposit' : 'Withdraw'}
              </button>
              <button
                onClick={() => { setBankModal(false); setBankAmount('') }}
                className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="mb-6 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <h3 className="font-bold text-dark mb-4 flex items-center gap-2">
            <HiPlus size={16} className="text-primary" />
            Add Expense
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Expense title"
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
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="date"
              value={form.expense_date}
              onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none"
            />
            <div className="flex items-center gap-2">
              <button onClick={handleAdd} disabled={saving || !form.title.trim() || !form.amount} className="px-4 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary-dark disabled:opacity-50">
                {saving ? 'Saving...' : 'Add'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
          </div>
          <input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes (optional)"
            className="mt-3 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none"
          />
        </div>
      )}

      {editing && (
        <div className="mb-6 p-6 bg-white border border-primary/30 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-dark">Edit Expense #{editing}</h3>
            <button onClick={cancelEdit} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
              <HiX size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              placeholder="Expense title"
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none"
            />
            <input
              type="number"
              min="0"
              value={editForm.amount}
              onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
              placeholder="Amount (LKR)"
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none"
            />
            <select
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="date"
              value={editForm.expense_date}
              onChange={(e) => setEditForm({ ...editForm, expense_date: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none"
            />
            <div className="flex items-center gap-2">
              <button onClick={handleEdit} disabled={saving || !editForm.title.trim() || !editForm.amount} className="px-4 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary-dark disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={cancelEdit} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
          </div>
          <input
            value={editForm.notes}
            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
            placeholder="Notes (optional)"
            className="mt-3 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-[#262626]">
            <h2 className="text-lg font-bold text-dark dark:text-white flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-md">
                <HiChartBar size={17} />
              </span>
              Expense List
            </h2>
            <div className="flex gap-1 bg-gray-100 dark:bg-white/5 rounded-full p-1 border border-gray-100 dark:border-white/5">
              <button
                onClick={() => setMonthFilter('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition ${monthFilter === 'all' ? 'bg-white dark:bg-white/15 text-primary shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'}`}
              >
                All
              </button>
              {monthOptions.slice(0, 4).map((m) => (
                <button
                  key={m}
                  onClick={() => setMonthFilter(m)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition ${monthFilter === m ? 'bg-white dark:bg-white/15 text-primary shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'}`}
                >
                  {new Date(m + '-01').toLocaleDateString(undefined, { month: 'short' })}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#262626] text-left text-gray-500 dark:text-slate-400">
                  <th className="p-4 font-medium">Expense</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-b border-gray-50 dark:border-[#1d1d24] hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-dark dark:text-white">{e.title}</div>
                      {e.notes && <div className="text-xs text-gray-500 dark:text-slate-400">{e.notes}</div>}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
                        <HiTag size={11} />
                        {e.category || 'Other'}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-red-600 dark:text-red-400 tabular-nums">LKR {Number(e.amount).toLocaleString()}</td>
                    <td className="p-4 text-gray-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <HiCalendar size={13} />
                        {new Date(e.expense_date || e.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(e)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit expense">
                          <HiPencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(e)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete expense">
                          <HiTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-gray-400 dark:text-slate-500">No expenses recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold text-dark dark:text-white flex items-center gap-2 mb-5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
              <HiTag size={17} />
            </span>
            {monthFilter === 'all' ? 'All Time' : monthLabel(monthFilter)} by Category
          </h2>
          {byCategory.length === 0 ? (
            <p className="text-sm text-gray-400">No expenses to show.</p>
          ) : (
            <div className="space-y-4">
              {byCategory.map(([cat, amt]) => (
                <div key={cat}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-dark dark:text-slate-200">{cat}</span>
                    <span className="font-bold text-dark dark:text-white tabular-nums">LKR {fmt(amt)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(amt / maxCat) * 100}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-600"
                    />
                  </div>
                </div>
              ))}
              <div className="pt-3 mt-3 border-t border-gray-100 dark:border-[#262626] flex items-center justify-between">
                <span className="font-semibold text-dark dark:text-white">Total</span>
                <span className="font-extrabold text-dark dark:text-white tabular-nums">LKR {fmt(filteredTotal)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}