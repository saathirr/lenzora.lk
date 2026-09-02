import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  HiShieldCheck, HiRefresh, HiSearch, HiPlus, HiPencilAlt, HiTrash,
  HiChevronDown, HiChartBar, HiUserGroup, HiDatabase,
} from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'
import { fetchAuditLogs } from '../../lib/db'

const actionStyles = {
  INSERT: 'bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-400',
  UPDATE: 'bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400',
  DELETE: 'bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400',
}

const actionIcons = { INSERT: HiPlus, UPDATE: HiPencilAlt, DELETE: HiTrash }

export default function AdminAuditLogs() {
  const { dataLoading } = useApp()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('ALL')
  const [table, setTable] = useState('ALL')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [expanded, setExpanded] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchAuditLogs()
      setLogs(data || [])
    } catch (err) {
      setError(err?.message || 'Failed to load change log.')
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const tables = useMemo(() => {
    const set = new Set(logs.map((l) => l.table_name).filter(Boolean))
    return ['ALL', ...[...set].sort()]
  }, [logs])

  const stats = useMemo(() => {
    const today = logs.filter((l) => {
      const d = new Date(l.created_at)
      const n = new Date()
      return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()
    }).length
    return {
      total: logs.length,
      insert: logs.filter((l) => l.action === 'INSERT').length,
      update: logs.filter((l) => l.action === 'UPDATE').length,
      delete: logs.filter((l) => l.action === 'DELETE').length,
      today,
    }
  }, [logs])

  const topContributors = useMemo(() => {
    const map = {}
    logs.forEach((l) => {
      const k = l.user_email || 'System / public'
      map[k] = map[k] || { email: k, count: 0, tables: new Set() }
      map[k].count += 1
      map[k].tables.add(l.table_name)
    })
    return Object.values(map)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((u) => ({ ...u, tables: [...u.tables].join(', ') }))
  }, [logs])

  const maxTop = topContributors[0]?.count || 1

  const byTable = useMemo(() => {
    const map = {}
    logs.forEach((l) => {
      map[l.table_name] = (map[l.table_name] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [logs])

  const maxTable = byTable[0]?.[1] || 1

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return logs.filter((l) => {
      if (action !== 'ALL' && l.action !== action) return false
      if (table !== 'ALL' && l.table_name !== table) return false
      if (q && !(l.user_email || '').toLowerCase().includes(q)) return false
      const d = new Date(l.created_at)
      if (from && d < new Date(from)) return false
      if (to && d > new Date(to + 'T23:59:59')) return false
      return true
    })
  }, [logs, action, table, search, from, to])

  const diffOf = (log) => {
    const c = log.changes
    if (!c) return []
    if (log.action === 'UPDATE' && c.old && c.new) {
      const changed = []
      Object.keys(c.new || {}).forEach((k) => {
        const a = JSON.stringify(c.old[k])
        const b = JSON.stringify(c.new[k])
        if (a !== b) changed.push({ field: k, old: c.old[k], new: c.new[k] })
      })
      return changed
    }
    const payload = c.new || c.old
    if (payload && typeof payload === 'object') {
      const keys = Object.keys(payload)
        .filter((k) => !['id', 'created_at', 'updated_at'].includes(k))
        .slice(0, 6)
      return keys.map((k) => ({ field: k, old: undefined, new: payload[k] }))
    }
    return []
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
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-dark flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent2 to-accent3 flex items-center justify-center text-white shadow-lg shadow-accent2/30">
              <HiShieldCheck size={20} />
            </span>
            Change Log
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Audit trail of every change made in the system and who made it.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#262626] text-sm font-semibold rounded-full hover:border-primary/40 transition disabled:opacity-50"
        >
          <HiRefresh size={15} />
          Refresh
        </button>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Changes', value: stats.total, grad: 'from-slate-600 to-slate-800' },
          { label: 'Added', value: stats.insert, grad: 'from-emerald-500 to-green-600' },
          { label: 'Updated', value: stats.update, grad: 'from-blue-500 to-indigo-600' },
          { label: 'Deleted', value: stats.delete, grad: 'from-red-500 to-rose-600' },
          { label: 'Changes Today', value: stats.today, grad: 'from-indigo-500 to-blue-600' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 240, damping: 24 }}
            className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center text-white shadow-md mb-3`}>
              <HiChartBar size={18} />
            </div>
            <p className="text-2xl font-extrabold text-dark dark:text-white tabular-nums">{s.value}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="p-6 bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-dark dark:text-white mb-4 flex items-center gap-2">
            <HiUserGroup size={16} className="text-primary" />
            Most active contributors
          </h3>
          {topContributors.length === 0 && <p className="text-sm text-gray-400">No changes recorded yet.</p>}
          <div className="space-y-3">
            {topContributors.map((u) => (
              <div key={u.email} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-dark dark:text-white truncate">{u.email}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{u.tables}</p>
                </div>
                <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden max-w-[200px]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(u.count / maxTop) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent2"
                  />
                </div>
                <span className="w-10 text-right text-sm font-bold text-dark dark:text-white tabular-nums">{u.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-dark dark:text-white mb-4 flex items-center gap-2">
            <HiDatabase size={16} className="text-primary" />
            Changes by area (top tables)
          </h3>
          {byTable.length === 0 && <p className="text-sm text-gray-400">No changes recorded yet.</p>}
          <div className="space-y-3">
            {byTable.map(([tbl, count]) => (
              <div key={tbl} className="flex items-center gap-3">
                <span className="w-32 truncate text-sm font-medium text-dark dark:text-slate-200">{tbl}</span>
                <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxTable) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-accent2 to-accent3"
                  />
                </div>
                <span className="w-10 text-right text-sm font-bold text-dark dark:text-white tabular-nums">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-2xl">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-gray-100 dark:border-[#262626]">
          <div className="relative w-full lg:w-72">
            <HiSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user email..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-white/10 text-sm text-dark dark:text-slate-200 focus:border-primary outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 bg-gray-100 dark:bg-white/5 rounded-full p-1 border border-gray-100 dark:border-white/5">
              {['ALL', 'INSERT', 'UPDATE', 'DELETE'].map((a) => (
                <button
                  key={a}
                  onClick={() => setAction(a)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition ${action === a ? 'bg-white dark:bg-white/15 text-primary shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'}`}
                >
                  {a === 'ALL' ? 'All' : a.toLowerCase()}
                </button>
              ))}
            </div>
            <select
              value={table}
              onChange={(e) => setTable(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-white/10 text-gray-700 dark:text-slate-200 outline-none focus:border-primary"
            >
              {tables.map((t) => (
                <option key={t} value={t}>{t === 'ALL' ? 'All tables' : t}</option>
              ))}
            </select>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-white/10 text-gray-700 dark:text-slate-200 outline-none focus:border-primary" />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-white/10 text-gray-700 dark:text-slate-200 outline-none focus:border-primary" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#262626] text-left text-gray-500 dark:text-slate-400">
                <th className="p-4 font-medium">When</th>
                <th className="p-4 font-medium">Who</th>
                <th className="p-4 font-medium">Action</th>
                <th className="p-4 font-medium">Area</th>
                <th className="p-4 font-medium">Record</th>
                <th className="p-4 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => {
                const Icon = actionIcons[l.action] || HiPencilAlt
                const diff = diffOf(l)
                const isOpen = expanded === l.id
                return (
                  <motion.tr
                    key={l.id}
                    layout={false}
                    onClick={() => setExpanded(isOpen ? null : l.id)}
                    className="border-b border-gray-50 dark:border-[#1d1d24] hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="p-4 text-gray-600 dark:text-slate-300 tabular-nums whitespace-nowrap">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-dark dark:text-white">{l.user_email || 'System / public'}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${actionStyles[l.action] || actionStyles.UPDATE}`}>
                        <Icon size={13} />
                        {l.action}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-slate-300">{l.table_name}</td>
                    <td className="p-4 text-gray-500 dark:text-slate-400 tabular-nums">#{l.record_id || '-'}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end">
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          className="inline-flex w-8 h-8 items-center justify-center rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-white/10 transition"
                        >
                          <HiChevronDown size={18} />
                        </motion.span>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400 dark:text-slate-500">
                    No changes found{search || action !== 'ALL' || table !== 'ALL' || from || to ? ' for these filters' : ' yet'}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {loading && (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {expanded !== null && (
          <div className="border-t border-gray-100 dark:border-[#262626] p-4 sm:p-6 bg-gray-50/50 dark:bg-white/5">
            {(() => {
              const l = logs.find((x) => x.id === expanded)
              if (!l) return null
              const diff = diffOf(l)
              return (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    What changed · {l.table_name} #{l.record_id}
                  </p>
                  {diff.length === 0 && <p className="text-sm text-gray-400">No field-level details recorded.</p>}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    {diff.map((d) => (
                      <div key={d.field} className="p-3 rounded-xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626]">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">{d.field}</p>
                        <div className="flex items-start gap-2 text-xs">
                          {d.old !== undefined && (
                            <span className="flex-1 min-w-0 p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 break-all">
                              <span className="font-semibold">old: </span>
                              {String(d.old)}
                            </span>
                          )}
                          <span className="flex-1 min-w-0 p-1.5 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 break-all">
                            <span className="font-semibold">new: </span>
                            {String(d.new)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}