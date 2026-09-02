import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  HiUserGroup, HiClock, HiShieldCheck, HiShoppingCart, HiCash,
  HiChartBar, HiKey, HiUserAdd, HiRefresh, HiUsers, HiSparkles,
} from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'
import { fetchLoginLogs, fetchAuditLogs, listUsers } from '../../lib/db'

function Stat({ label, value, icon: Icon, grad, delay, suffix }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 240, damping: 24 }}
      className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] shadow-sm"
    >
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white shadow-lg mb-3`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold text-dark dark:text-white tabular-nums">
        {value?.toLocaleString() || 0}
        {suffix && <span className="text-base font-semibold text-gray-400 ml-1">{suffix}</span>}
      </p>
      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{label}</p>
    </motion.div>
  )
}

export default function SuperDashboard() {
  const { orders, sales, frames, profile, dataLoading } = useApp()
  const [loginLogs, setLoginLogs] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [ll, al, us] = await Promise.all([
      fetchLoginLogs().catch(() => []),
      fetchAuditLogs().catch(() => []),
      listUsers().catch(() => []),
    ])
    setLoginLogs(ll)
    setAuditLogs(al)
    setUsers(us)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const fmt = (n) => Math.round(Number(n)).toLocaleString()

  const isToday = (d) => {
    const n = new Date()
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()
  }

  const loginToday = loginLogs.filter((l) => isToday(new Date(l.logged_in_at))).length
  const loginsToday = loginLogs.filter((l) => l.success && isToday(new Date(l.logged_in_at))).length

  const todayAudit = auditLogs.filter((l) => isToday(new Date(l.created_at))).length

  const last7Days = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toLocaleDateString('en-US', { weekday: 'short' })
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
      const logins = loginLogs.filter((l) => {
        const t = new Date(l.logged_in_at)
        return l.success && t >= dayStart && t < dayEnd
      }).length
      const changes = auditLogs.filter((l) => {
        const t = new Date(l.created_at)
        return t >= dayStart && t < dayEnd
      }).length
      days.push({ key, logins, changes })
    }
    return days
  }, [loginLogs, auditLogs])

  const allTimeSales = useMemo(
    () => orders.reduce((s, o) => s + Number(o.amount || 0), 0) + sales.reduce((s, x) => s + Number(x.amount || 0), 0) + frames.reduce((s, f) => s + Number(f.price || 0), 0),
    [orders, sales, frames]
  )

  const maxBar = Math.max(...last7Days.map((d) => d.logins), ...last7Days.map((d) => d.changes), 1)

  const recentLogins = loginLogs.slice(0, 6)
  const recentChanges = auditLogs.slice(0, 6)
  const admins = users.filter((u) => u.role === 'admin').length
  const superAdmins = users.filter((u) => u.role === 'super_admin').length
  const dashAccess = users.filter((u) => u.role === 'admin' || u.role === 'super_admin')

  const actionStyles = {
    INSERT: 'bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-400',
    UPDATE: 'bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400',
    DELETE: 'bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400',
  }

  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  if (dataLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-dark flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent2 to-accent3 flex items-center justify-center text-white shadow-lg shadow-accent2/30">
              <HiShieldCheck size={20} />
            </span>
            Super Admin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            Full control &amp; oversight — {todayLabel}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-accent2/20 text-accent3 border border-accent3/20">
              <HiSparkles size={10} />
              Super Admin
            </span>
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#262626] text-sm font-semibold rounded-full hover:border-primary/40 transition disabled:opacity-50"
        >
          <HiRefresh size={15} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Dashboard Access" value={dashAccess.length} icon={HiKey} grad="from-primary to-primary-dark" delay={0} />
        <Stat label="Admins" value={admins} icon={HiUserAdd} grad="from-indigo-500 to-blue-600" delay={0.06} />
        <Stat label="Super Admins" value={superAdmins} icon={HiUserGroup} grad="from-accent2 to-accent3" delay={0.12} />
        <Stat label="Login Today" value={loginsToday} icon={HiClock} grad="from-emerald-500 to-green-600" delay={0.18} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 p-6 bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-dark dark:text-white flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                <HiChartBar size={17} />
              </span>
              Activity — last 7 days
            </h2>
          </div>
          <div className="flex items-end justify-between gap-2 h-40">
            {last7Days.map((d) => (
              <div key={d.key} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold text-indigo-600 tabular-nums">{d.logins || ''}</span>
                <div className="flex flex-col items-center gap-1 w-full">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.logins / maxBar) * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="w-3/5 rounded-t-lg bg-gradient-to-t from-indigo-500 to-blue-500"
                    title={`${d.logins} logins`}
                  />
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: d.changes / maxBar }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="w-3/5 rounded-t-lg bg-gradient-to-t from-accent2 to-accent3 origin-bottom"
                    title={`${d.changes} changes`}
                  />
                </div>
                <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">{d.key}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-500" /> Logins</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-accent3" /> Changes</span>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold text-dark dark:text-white flex items-center gap-2 mb-5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent2 to-accent3 flex items-center justify-center text-white shadow-md">
              <HiCash size={17} />
            </span>
            Revenue Snapshot
          </h2>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-sky-700 text-white">
              <p className="text-sm text-indigo-100">All Time Sales</p>
              <p className="text-2xl font-extrabold mt-1 tabular-nums">LKR {fmt(allTimeSales)}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
              <p className="text-sm text-gray-500 dark:text-slate-400">Sales entries</p>
              <p className="text-xl font-extrabold text-dark dark:text-white tabular-nums">{sales.length + frames.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
              <p className="text-sm text-gray-500 dark:text-slate-400">Client orders</p>
              <p className="text-xl font-extrabold text-dark dark:text-white tabular-nums">{orders.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-[#262626] flex items-center justify-between">
            <h2 className="text-lg font-bold text-dark dark:text-white flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-md">
                <HiClock size={17} />
              </span>
              Recent Logins
            </h2>
            <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2.5 py-1 rounded-full">{loginToday} today</span>
          </div>
          {recentLogins.length === 0 ? (
            <p className="p-6 text-sm text-gray-400">No login activity recorded yet.</p>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-[#1d1d24]">
              {recentLogins.map((l) => (
                <div key={l.id} className="px-5 sm:px-6 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-dark dark:text-white truncate">{l.email || 'Unknown'}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{new Date(l.logged_in_at).toLocaleString()}</p>
                  </div>
                  {l.success ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-400">Success</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400">Failed</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-[#262626] flex items-center justify-between">
            <h2 className="text-lg font-bold text-dark dark:text-white flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent2 to-accent3 flex items-center justify-center text-white shadow-md">
                <HiShieldCheck size={17} />
              </span>
              Recent Changes
            </h2>
            <span className="text-xs font-bold text-accent3 bg-accent2/15 px-2.5 py-1 rounded-full">{todayAudit} today</span>
          </div>
          {recentChanges.length === 0 ? (
            <p className="p-6 text-sm text-gray-400">No changes recorded yet.</p>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-[#1d1d24]">
              {recentChanges.map((l) => (
                <div key={l.id} className="px-5 sm:px-6 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-dark dark:text-white truncate">{l.user_email || 'System'} · {l.table_name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{new Date(l.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shrink-0 ${actionStyles[l.action] || actionStyles.UPDATE}`}>
                    {l.action}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-[#262626] flex items-center justify-between">
          <h2 className="text-lg font-bold text-dark dark:text-white flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent2 flex items-center justify-center text-white shadow-md">
              <HiUsers size={17} />
            </span>
            Dashboard Access List
          </h2>
          <button
            onClick={load}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-full hover:bg-primary hover:text-white transition"
          >
            <HiRefresh size={13} />
            Refresh
          </button>
        </div>
        {dashAccess.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">No users have dashboard access yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#262626] text-left text-gray-500 dark:text-slate-400">
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {dashAccess.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 dark:border-[#1d1d24] hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 font-semibold text-dark dark:text-white">{u.email || '-'}</td>
                    <td className="p-4 text-gray-600 dark:text-slate-300">{u.full_name || '-'}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${u.role === 'super_admin' ? 'bg-accent2/20 text-accent3 border-accent3/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                        {u.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}