import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  HiClock, HiCheckCircle, HiXCircle, HiSearch, HiRefresh, HiUserGroup, HiChartBar,
} from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'
import { fetchLoginLogs } from '../../lib/db'

export default function AdminLoginLogs() {
  const { dataLoading } = useApp()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchLoginLogs()
      setLogs(data || [])
    } catch (err) {
      setError(err?.message || 'Failed to load login logs.')
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const isToday = (d) => {
    const n = new Date()
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()
  }

  const stats = useMemo(() => {
    const todayLogs = logs.filter((l) => isToday(new Date(l.logged_in_at)))
    const uniqueToday = new Set(todayLogs.filter((l) => l.success).map((l) => l.email.toLowerCase())).size
    return {
      total: logs.length,
      success: logs.filter((l) => l.success).length,
      failed: logs.filter((l) => !l.success).length,
      today: todayLogs.length,
      uniqueToday,
    }
  }, [logs])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return logs.filter((l) => {
      if (status === 'success' && !l.success) return false
      if (status === 'failed' && l.success) return false
      if (q && !(l.email || '').toLowerCase().includes(q)) return false
      const d = new Date(l.logged_in_at)
      if (from && d < new Date(from)) return false
      if (to && d > new Date(to + 'T23:59:59')) return false
      return true
    })
  }, [logs, search, status, from, to])

  const topUsers = useMemo(() => {
    const map = {}
    logs.filter((l) => l.success && l.email).forEach((l) => {
      const k = l.email.toLowerCase()
      map[k] = map[k] || { email: l.email, count: 0, last: l.logged_in_at }
      map[k].count += 1
      if (new Date(l.logged_in_at) > new Date(map[k].last)) map[k].last = l.logged_in_at
    })
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5)
  }, [logs])

  const maxTop = topUsers[0]?.count || 1
  const mostLoggedIn = topUsers[0]

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
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <HiClock size={20} />
            </span>
            Login Activity
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Who logged in, when, and from which device — {todayLabel}.</p>
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Attempts', value: stats.total, grad: 'from-slate-600 to-slate-800' },
          { label: 'Successful', value: stats.success, grad: 'from-emerald-500 to-green-600' },
          { label: 'Failed', value: stats.failed, grad: 'from-red-500 to-rose-600' },
          { label: 'Logins Today', value: stats.today, grad: 'from-indigo-500 to-blue-600' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 240, damping: 24 }}
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

      {mostLoggedIn && (
        <div className="mb-6 p-6 bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-dark dark:text-white mb-4 flex items-center gap-2">
            <HiUserGroup size={16} className="text-primary" />
            Most frequent sign-ins
          </h3>
          <div className="space-y-3">
            {topUsers.map((u, i) => (
              <div key={u.email} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent2 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                  {String(i + 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-dark dark:text-white truncate">{u.email}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Last: {new Date(u.last).toLocaleString()}</p>
                </div>
                <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden max-w-[240px]">
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
      )}

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
              placeholder="Search email..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-white/10 text-sm text-dark dark:text-slate-200 focus:border-primary outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 bg-gray-100 dark:bg-white/5 rounded-full p-1 border border-gray-100 dark:border-white/5">
              {['all', 'success', 'failed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition ${status === s ? 'bg-white dark:bg-white/15 text-primary shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'}`}
                >
                  {s === 'all' ? 'All' : s === 'success' ? 'Successful' : 'Failed'}
                </button>
              ))}
            </div>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-white/10 text-gray-700 dark:text-slate-200 outline-none focus:border-primary" />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-white/10 text-gray-700 dark:text-slate-200 outline-none focus:border-primary" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#262626] text-left text-gray-500 dark:text-slate-400">
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Date &amp; Time</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium hidden lg:table-cell">Device</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-b border-gray-50 dark:border-[#1d1d24] hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 font-semibold text-dark dark:text-white">
                    {l.email || <span className="italic text-gray-400">unknown</span>}
                  </td>
                  <td className="p-4 text-gray-600 dark:text-slate-300 tabular-nums">
                    {new Date(l.logged_in_at).toLocaleString()}
                  </td>
                  <td className="p-4">
                    {l.success ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-400">
                        <HiCheckCircle size={13} />
                        Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400">
                        <HiXCircle size={13} />
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-gray-500 dark:text-slate-400 hidden lg:table-cell">
                    {l.user_agent ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        {l.user_agent.split(' ')[0]} · {l.ip_address || 'IP not captured'}
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-400 dark:text-slate-500">
                    No login activity found{search || status !== 'all' || from || to ? ' for these filters' : ' yet'}.
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
      </div>
    </div>
  )
}