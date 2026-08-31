import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { HiTrendingUp, HiCash, HiChartBar, HiCalendar } from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const fmt = (n) => Math.round(Number(n)).toLocaleString()

export default function AdminProfit() {
  const { orders, sales, frames, dataLoading } = useApp()
  const [selectedKey, setSelectedKey] = useState('__all__')

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
    sales.forEach((s) => add(s.created_at, Number(s.amount || 0), Number(s.amount || 0)))
    frames.forEach((f) => add(f.created_at, Number(f.price || 0), Number(f.profit || 0)))

    const list = Array.from(map.values())
    list.sort((a, b) => b.year - a.year || b.month - a.month)
    return list
  }, [orders, sales, frames])

  const totals = useMemo(() => {
    return {
      sales: monthly.reduce((s, m) => s + m.sales, 0),
      profit: monthly.reduce((s, m) => s + m.profit, 0),
      count: monthly.reduce((s, m) => s + m.count, 0),
    }
  }, [monthly])

  const selected = selectedKey === '__all__'
    ? null
    : monthly.find((m) => m.key === selectedKey)

  const shownMonths = selected ? [selected] : monthly
  const shownTotals = selected
    ? { sales: selected.sales, profit: selected.profit, count: selected.count }
    : totals

  const monthOptions = useMemo(() => {
    const opts = [...monthly].sort((a, b) => a.year - b.year || a.month - b.month)
    return [{ key: '__all__', label: 'All Months' }, ...opts.map((m) => ({ key: m.key, label: `${monthNames[m.month]} ${m.year}` }))]
  }, [monthly])

  const chartMax = Math.max(1, ...monthly.reduce((acc, m) => acc.concat([m.sales, m.profit]), []))
  const chart = [...monthly].sort((a, b) => a.year - b.year || a.month - b.month)

  const profitChange = useMemo(() => {
    if (monthly.length < 2) return null
    const cur = monthly[0].profit
    const prev = monthly[1].profit
    if (!prev) return { value: cur > 0 ? 100 : 0, up: cur >= 0 }
    const diff = ((cur - prev) / Math.abs(prev)) * 100
    return { value: Math.round(diff), up: diff >= 0 }
  }, [monthly])

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-dark dark:text-white">Profit</h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1">Monthly sales and profit breakdown with comparison.</p>
          </div>
          <div className="relative">
            <HiCalendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2f2f2f] bg-white dark:bg-[#141414] text-sm font-semibold text-gray-700 dark:text-slate-200 focus:border-primary outline-none"
            >
              {monthOptions.map((o) => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-sky-700 text-white shadow-lg shadow-indigo-500/25">
          <p className="text-sm text-indigo-100">Total Sales {selected ? `· ${monthNames[selected.month]} ${selected.year}` : ''}</p>
          <p className="text-3xl font-extrabold mt-1 tabular-nums">LKR {fmt(shownTotals.sales)}</p>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-500/25">
          <p className="text-sm text-emerald-100">Total Profit {selected ? `· ${monthNames[selected.month]} ${selected.year}` : ''}</p>
          <p className="text-3xl font-extrabold mt-1 tabular-nums">LKR {fmt(shownTotals.profit)}</p>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-700 text-white shadow-lg shadow-violet-500/25">
          <p className="text-sm text-violet-100">Total Records{selected ? ` · ${monthNames[selected.month]}` : ''}</p>
          <p className="text-3xl font-extrabold mt-1 tabular-nums">{shownTotals.count.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-dark dark:text-white flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center text-white shadow-md">
                <HiChartBar size={17} />
              </span>
              Sales vs Profit
            </h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
                <span className="w-3 h-3 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 inline-block" /> Sales
              </span>
              <span className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
                <span className="w-3 h-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 inline-block" /> Profit
              </span>
            </div>
          </div>

          {chart.length === 0 ? (
            <div className="py-10 text-center text-gray-400 dark:text-slate-500">No sales data yet.</div>
          ) : (
            <div className="flex items-end justify-between gap-2 sm:gap-4 h-64">
              {chart.map((m) => {
                const salesH = Math.round((m.sales / chartMax) * 100)
                const profitH = Math.round((m.profit / chartMax) * 100)
                return (
                  <div key={m.key} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
                    <motion.div className="flex items-end justify-center gap-1 sm:gap-1.5 flex-1 w-full" initial="hidden" animate="show">
                      <motion.div
                        variants={{ hidden: { height: 0 }, show: { height: `${Math.max(salesH, 2)}%` } }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        title={`Sales ${monthNames[m.month]}: LKR ${fmt(m.sales)}`}
                        className="w-full max-w-[22px] sm:max-w-[30px] rounded-t-md bg-gradient-to-b from-indigo-500 to-blue-600"
                      />
                      <motion.div
                        variants={{ hidden: { height: 0 }, show: { height: `${Math.max(profitH, 2)}%` } }}
                        transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
                        title={`Profit ${monthNames[m.month]}: LKR ${fmt(m.profit)}`}
                        className="w-full max-w-[22px] sm:max-w-[30px] rounded-t-md bg-gradient-to-b from-green-500 to-emerald-600"
                      />
                    </motion.div>
                    <span className="mt-2 text-[10px] font-semibold text-gray-400 dark:text-slate-500 truncate w-full text-center">
                      {monthNames[m.month].slice(0, 3)} {String(m.year).slice(2)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {chart.length >= 2 && selectedKey === '__all__' && (
            <div className="mt-6 flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
              <HiTrendingUp className={`shrink-0 ${profitChange.up ? 'text-green-500' : 'text-red-500'}`} size={20} />
              <p className="text-sm text-gray-600 dark:text-slate-300">
                Profit {profitChange.up ? 'increased' : 'decreased'} by{' '}
                <span className={`font-bold ${profitChange.up ? 'text-green-600' : 'text-red-500'}`}>
                  {Math.abs(profitChange.value)}%
                </span>{' '}
                compared to {monthNames[monthly[1].month]} {monthly[1].year}.
              </p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm p-6"
        >
          <h2 className="text-lg font-bold text-dark dark:text-white flex items-center gap-2 mb-6">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <HiCash size={17} />
            </span>
            {selected ? `${monthNames[selected.month]} ${selected.year}` : 'Monthly Performance'}
          </h2>

          {shownMonths.length === 0 ? (
            <div className="py-10 text-center text-gray-400 dark:text-slate-500">No sales data yet.</div>
          ) : (
            <div className="space-y-4">
              {shownMonths.map((m, i) => (
                <motion.div
                  key={m.key}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5"
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="font-bold text-dark dark:text-white">{monthNames[m.month]} {m.year}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                        <HiCash className="text-indigo-500" size={13} /> LKR {fmt(m.sales)}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-green-600 dark:text-green-400">
                        Profit LKR {fmt(m.profit)}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2.5 rounded-full bg-white dark:bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(m.sales / Math.max(chartMax, 1)) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.05, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-600"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400 dark:text-slate-500">
                    <span>{m.count} records</span>
                    <span className="font-semibold text-indigo-500">{m.sales > 0 ? Math.round((m.profit / m.sales) * 100) : 0}% profit margin</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
