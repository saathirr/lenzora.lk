import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { HiTrendingUp, HiCash, HiChartBar } from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function AdminProfit() {
  const { orders, sales, frames, dataLoading } = useApp()

  const monthly = useMemo(() => {
    const map = new Map()

    const add = (dateStr, salesAmt, profitAmt) => {
      const d = dateStr ? new Date(dateStr) : new Date()
      if (isNaN(d.getTime())) return
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`
      if (!map.has(key)) {
        map.set(key, { key, year: d.getFullYear(), month: d.getMonth(), sales: 0, profit: 0, count: 0 })
      }
      const entry = map.get(key)
      entry.sales += salesAmt
      entry.profit += profitAmt
      entry.count += 1
    }

    orders.forEach((o) => add(o.created_at, Number(o.amount || 0), Number(o.amount || 0)))
    sales.forEach((s) => add(s.created_at, Number(s.amount || 0), 0))
    frames.forEach((f) => add(f.created_at, Number(f.price || 0), Number(f.profit || 0)))

    const list = Array.from(map.values())
    list.sort((a, b) => b.year - a.year || b.month - a.month)
    return list
  }, [orders, sales, frames])

  const totals = useMemo(() => {
    const sales = monthly.reduce((s, m) => s + m.sales, 0)
    const profit = monthly.reduce((s, m) => s + m.profit, 0)
    return { sales, profit, count: monthly.reduce((s, m) => s + m.count, 0) }
  }, [monthly])

  const maxSales = Math.max(1, ...monthly.map((m) => m.sales))

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, type: 'spring', stiffness: 220, damping: 24 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-dark">Profit</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Monthly sales and profit breakdown.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-sky-700 text-white shadow-lg shadow-indigo-500/25">
          <p className="text-sm text-indigo-100">Total Sales</p>
          <p className="text-3xl font-extrabold mt-1 tabular-nums">LKR {Math.round(totals.sales).toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-500/25">
          <p className="text-sm text-emerald-100">Total Profit</p>
          <p className="text-3xl font-extrabold mt-1 tabular-nums">LKR {Math.round(totals.profit).toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-700 text-white shadow-lg shadow-violet-500/25">
          <p className="text-sm text-violet-100">Total Records</p>
          <p className="text-3xl font-extrabold mt-1 tabular-nums">{totals.count.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-dark dark:text-white flex items-center gap-2 mb-6">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md">
            <HiChartBar size={17} />
          </span>
          Monthly Performance
        </h2>

        {monthly.length === 0 ? (
          <div className="py-10 text-center text-gray-400 dark:text-slate-500">No sales data yet.</div>
        ) : (
          <div className="space-y-5">
            {monthly.map((m, i) => (
              <motion.div
                key={m.key}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <HiTrendingUp className="text-primary" size={18} />
                    <span className="font-bold text-dark dark:text-white">{monthNames[m.month]} {m.year}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
                        <HiCash className="text-indigo-500" size={13} /> Sales
                      </p>
                      <p className="font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">LKR {Math.round(m.sales).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-slate-500">Profit</p>
                      <p className="font-bold text-green-600 dark:text-green-400 tabular-nums">LKR {Math.round(m.profit).toLocaleString()}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white dark:bg-white/10 text-gray-500 dark:text-slate-400">
                      {m.count} records
                    </span>
                  </div>
                </div>
                <div className="relative h-2.5 rounded-full bg-white dark:bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(m.sales / maxSales) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.05, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-600"
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-400 dark:text-slate-500">
                  <span>Monthly sales</span>
                  <span className="font-semibold text-indigo-500">{m.sales > 0 ? Math.round((m.profit / m.sales) * 100) : 0}% profit margin</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
