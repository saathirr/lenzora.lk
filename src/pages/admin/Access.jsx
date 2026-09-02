import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  HiUserGroup, HiShieldCheck, HiUserAdd, HiSearch, HiLockOpen,
  HiCheckCircle, HiExclamation, HiKey, HiUser,
} from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'
import { listUsers, grantAdminAccess, grantSuperAdmin, revokeAdminAccess } from '../../lib/db'

const roleStyles = {
  super_admin: 'bg-accent2/20 text-accent3 border-accent3/20',
  admin: 'bg-primary/10 text-primary border-primary/20',
  customer: 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-slate-400 border-gray-200 dark:border-white/10',
}

const roleLabels = { super_admin: 'Super Admin', admin: 'Admin', customer: 'Customer' }

export default function AdminAccess() {
  const { dataLoading } = useApp()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(null)
  const [grantEmail, setGrantEmail] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const data = await listUsers()
      setUsers(data || [])
      setError('')
    } catch (err) {
      setError(err?.message || 'Failed to load users.')
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const stats = useMemo(() => {
    const admins = users.filter((u) => u.role === 'admin').length
    const superAdmins = users.filter((u) => u.role === 'super_admin').length
    const dashboardAccess = users.filter((u) => u.role === 'admin' || u.role === 'super_admin')
    return { total: users.length, admins, superAdmins, dashboardAccess }
  }, [users])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) =>
      (u.email || '').toLowerCase().includes(q) ||
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    )
  }, [users, search])

  const runAction = async (fn, email, label, confirmMsg) => {
    if (confirmMsg && !confirm(confirmMsg)) return
    setWorking(email + label)
    setNotice('')
    setError('')
    try {
      await fn(email)
      setNotice(`${label} done for ${email}`)
      await load()
    } catch (err) {
      setError(err?.message || `Failed: ${label}`)
    }
    setWorking(null)
  }

  const handleGrant = (e) => {
    e.preventDefault()
    if (!grantEmail.trim()) {
      setError('Enter an email address first.')
      return
    }
    runAction(grantAdminAccess, grantEmail.trim(), 'Granted admin access')
    setGrantEmail('')
  }

  const canManage = (u) => u.role !== 'super_admin'

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
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-dark flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent2 to-accent3 flex items-center justify-center text-white shadow-lg shadow-accent2/30">
            <HiUserGroup size={20} />
          </span>
          Admin Access
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Control who can sign in to the admin dashboard. Only you (super admin) can see this page.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: stats.total, icon: HiUser, grad: 'from-gray-600 to-gray-800' },
          { label: 'Dashboard Access', value: stats.dashboardAccess.length, icon: HiKey, grad: 'from-primary to-primary-dark' },
          { label: 'Admins', value: stats.admins, icon: HiShieldCheck, grad: 'from-indigo-500 to-blue-600' },
          { label: 'Super Admins', value: stats.superAdmins, icon: HiLockOpen, grad: 'from-accent2 to-accent3' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 240, damping: 24 }}
              className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] shadow-sm"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center text-white shadow-md mb-3`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-extrabold text-dark dark:text-white tabular-nums">{s.value}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">{s.label}</p>
            </motion.div>
          )
        })}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-2xl flex items-center gap-2">
          <HiExclamation size={18} className="shrink-0" />
          {error}
        </div>
      )}
      {notice && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 text-sm rounded-2xl flex items-center gap-2">
          <HiCheckCircle size={18} className="shrink-0" />
          {notice}
        </div>
      )}

      <div className="mb-6 p-6 bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm">
        <h3 className="font-bold text-dark dark:text-white flex items-center gap-2 mb-1">
          <HiUserAdd size={18} className="text-primary" />
          Grant admin dashboard access
        </h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Enter the account email of the user who should be able to access the admin dashboard.</p>
        <form onSubmit={handleGrant} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={grantEmail}
            onChange={(e) => setGrantEmail(e.target.value)}
            placeholder="user@example.com"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-white/10 text-dark dark:text-slate-200 focus:border-primary outline-none"
          />
          <button
            type="submit"
            disabled={working !== null || !grantEmail.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition disabled:opacity-50"
          >
            <HiKey size={15} />
            Give Admin Access
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-[#262626]">
          <div>
            <h2 className="text-lg font-bold text-dark dark:text-white">Dashboard access emails</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {stats.dashboardAccess.length} account(s) currently have admin dashboard access.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <HiSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name / email / role"
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-white/10 text-sm text-dark dark:text-slate-200 focus:border-primary outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#262626] text-left text-gray-500 dark:text-slate-400">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium hidden md:table-cell">Joined</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 dark:border-[#1d1d24] hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(u.full_name || u.email || '?').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-dark dark:text-white truncate">{u.full_name || '—'}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${roleStyles[u.role] || roleStyles.customer}`}>
                      {roleLabels[u.role] || 'Customer'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 dark:text-slate-400 hidden md:table-cell">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {u.role === 'customer' && (
                        <button
                          onClick={() => runAction(grantAdminAccess, u.email, 'Granted admin access')}
                          disabled={working !== null}
                          className="px-3 py-1.5 text-xs font-semibold rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition disabled:opacity-50"
                        >
                          Give Admin
                        </button>
                      )}
                      {u.role === 'admin' && (
                        <button
                          onClick={() => runAction(grantSuperAdmin, u.email, 'Granted super admin', `Promote ${u.email} to super admin?`)}
                          disabled={working !== null}
                          className="px-3 py-1.5 text-xs font-semibold rounded-full bg-accent2/15 text-accent3 hover:bg-accent2 hover:text-white transition disabled:opacity-50"
                        >
                          Make Super Admin
                        </button>
                      )}
                      {u.role === 'admin' && (
                        <button
                          onClick={() => runAction(revokeAdminAccess, u.email, 'Revoked admin access', `Revoke admin access for ${u.email}? They will lose dashboard access.`)}
                          disabled={working !== null}
                          className="px-3 py-1.5 text-xs font-semibold rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition disabled:opacity-50"
                        >
                          Revoke
                        </button>
                      )}
                      {u.role === 'super_admin' && (
                        <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">
                          {canManage(u) ? '' : 'Protected'}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-400 dark:text-slate-500">
                    No users found{search ? ' for your search' : ''}.
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