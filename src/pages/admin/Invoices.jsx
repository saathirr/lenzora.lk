import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiPlus, HiTrash, HiEye, HiRefresh, HiDocumentDownload, HiPrinter,
  HiX, HiMail, HiPhone, HiGlobeAlt, HiDocumentText, HiUser,
  HiOfficeBuilding, HiCalendar, HiCollection, HiSparkles,
} from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas-pro'
import { useApp } from '../../lib/AppContext'
import defaultLogo from '../../assets/lenzora-logo.png'

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2f2f2f] bg-white dark:bg-[#141414] text-dark dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition placeholder:text-gray-400 dark:placeholder:text-slate-500 text-sm'
const cardCls = 'bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm p-5 sm:p-6'
const labelCls = 'text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1.5 block'

const PRINT_CSS = `
@media print {
  @page { size: A4; margin: 12mm; }
  html, body { background:#fff !important; height:auto !important; overflow:visible !important; }
  body > #root { display:none !important; }
  .lenzora-invoice-host{
    position:static !important; display:block !important; inset:auto !important;
    padding:0 !important; margin:0 !important; background:#fff !important;
    backdrop-filter:none !important; -webkit-backdrop-filter:none !important; overflow:visible !important;
  }
  .lenzora-invoice-backdrop{ display:none !important; }
  .lenzora-invoice-panel{
    max-width:none !important; width:100% !important; margin:0 !important;
    padding:0 !important; border:none !important; border-radius:0 !important;
    box-shadow:none !important; transform:none !important; opacity:1 !important;
    background:#fff !important;
  }
  .lenzora-invoice-sheet{ border-radius:0 !important; box-shadow:none !important; }
  .lenzora-invoice-sheet, .lenzora-invoice-sheet *{ -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
  .lenzora-invoice-sheet tr, .lenzora-invoice-sheet th, .lenzora-invoice-sheet td{ page-break-inside:avoid; }
}
`

const localISO = (d) => {
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}
const fmtDate = (s) => (s ? new Date(`${s}T00:00:00`).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-')
const fmtMoney = (n) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const makeInvNo = () => `INV-${String(Date.now()).slice(-6)}`
let itemSeq = 0
const nextItemId = () => ++itemSeq

function InvoiceSheet({ data, logoSrc }) {
  const { meta, from, billTo, items, totals, notes } = data
  return (
    <div className="lenzora-invoice-sheet relative bg-white text-gray-800 overflow-hidden rounded-xl shadow-2xl">
      <img
        src={logoSrc}
        alt=""
        aria-hidden
        className="pointer-events-none select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] max-w-[72%] opacity-[0.045]"
      />

      <div className="relative bg-[#1a1a1a] text-white px-7 sm:px-9 py-8">
        <div className="absolute inset-y-0 right-0 w-64 pointer-events-none" style={{ background: 'linear-gradient(115deg, rgba(255,107,0,0.22), transparent 60%)' }} />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-lg shadow-black/30 mb-4 flex items-center justify-center">
              <img src={logoSrc} alt="Lenzora logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">{from.name}</h1>
            {from.tagline && <p className="text-white/50 text-sm mt-0.5">{from.tagline}</p>}
          </div>
          <div className="sm:text-right">
            <p className="text-4xl font-black uppercase tracking-tight text-[#FF6B00]">Invoice</p>
            <p className="mt-1 font-mono text-sm text-white/80 tracking-widest">{meta.number}</p>
            <div className="mt-3 space-y-1 text-xs text-white/50">
              <p>Issue Date: <span className="text-white font-semibold">{fmtDate(meta.issueDate)}</span></p>
              <p>Due Date: <span className="text-white font-semibold">{fmtDate(meta.dueDate)}</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative grid sm:grid-cols-2 gap-6 px-7 sm:px-9 py-7">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF6B00] mb-2">Billed To</p>
          <p className="font-bold text-lg text-[#1a1a1a]">{billTo.name || '—'}</p>
          {billTo.address && <p className="text-sm text-gray-500 mt-1 leading-relaxed whitespace-pre-line">{billTo.address}</p>}
          {billTo.email && <p className="text-sm text-gray-500 mt-1">{billTo.email}</p>}
          {billTo.phone && <p className="text-sm text-gray-500">{billTo.phone}</p>}
        </div>
        <div className="sm:text-right">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF6B00] mb-2">Payable To</p>
          <p className="font-bold text-[#1a1a1a]">{from.name}</p>
          {from.address && <p className="text-sm text-gray-500 whitespace-pre-line">{from.address}</p>}
          {from.email && <p className="text-sm text-gray-500">{from.email}</p>}
          {from.phone && <p className="text-sm text-gray-500">{from.phone}</p>}
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#1a1a1a] text-white text-left">
            <th className="py-3 pl-7 sm:pl-9 pr-2 font-semibold w-10">#</th>
            <th className="py-3 px-2 font-semibold">Description</th>
            <th className="py-3 px-2 font-semibold text-right">Qty</th>
            <th className="py-3 px-2 font-semibold text-right">Rate (LKR)</th>
            <th className="py-3 pl-2 pr-7 sm:pr-9 font-semibold text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const amount = (Number(item.qty) || 0) * (Number(item.rate) || 0)
            return (
              <tr key={item.id} className={`border-b border-gray-100 ${i % 2 ? 'bg-gray-50/70' : ''}`}>
                <td className="py-3 pl-7 sm:pl-9 pr-2 text-gray-400 font-mono">{String(i + 1).padStart(2, '0')}</td>
                <td className="py-3 px-2 font-medium text-[#1a1a1a] whitespace-pre-line">{item.description || '—'}</td>
                <td className="py-3 px-2 text-right tabular-nums">{item.qty}</td>
                <td className="py-3 px-2 text-right tabular-nums">{fmtMoney(item.rate)}</td>
                <td className="py-3 pl-2 pr-7 sm:pr-9 text-right tabular-nums font-semibold text-[#1a1a1a]">{fmtMoney(amount)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="flex justify-end px-7 sm:px-9 py-6">
        <div className="w-full sm:w-96 space-y-2.5 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span className="tabular-nums font-medium text-[#1a1a1a]">LKR {fmtMoney(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Discount ({Number(data.discount) || 0}%)</span>
            <span className="tabular-nums font-medium text-red-500">− LKR {fmtMoney(totals.discountAmt)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Tax ({Number(data.tax) || 0}%)</span>
            <span className="tabular-nums font-medium text-[#1a1a1a]">+ LKR {fmtMoney(totals.taxAmt)}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-[#FF6B00] text-white px-4 py-3 mt-1 shadow-md shadow-orange-500/30">
            <span className="font-bold uppercase tracking-wide text-xs">Grand Total</span>
            <span className="text-xl font-extrabold tabular-nums">LKR {fmtMoney(totals.grand)}</span>
          </div>
          <p className="text-right text-[11px] text-gray-400 pt-1">Amount due by <span className="font-semibold text-gray-600">{fmtDate(meta.dueDate)}</span></p>
        </div>
      </div>

      {(notes || true) && (
        <div className="px-7 sm:px-9 pb-7">
          {notes && (
            <div className="rounded-xl border border-dashed border-gray-200 p-4 text-xs text-gray-500 leading-relaxed whitespace-pre-line">
              <span className="block font-bold text-gray-700 mb-1">Notes</span>
              {notes}
            </div>
          )}
          <p className="text-center text-xs text-gray-400 mt-5 italic">Thank you for choosing {from.name} — we appreciate your business!</p>
        </div>
      )}

      <div className="relative bg-[#1a1a1a] text-white px-7 sm:px-9 py-5">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FF6B00] via-[#ff8c33] to-transparent" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-extrabold tracking-tight">{from.name}<span className="text-[#FF6B00]">.</span></p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 mt-0.5">{from.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-white/70">
            {from.email && (
              <span className="inline-flex items-center gap-1.5">
                <HiMail size={13} className="text-[#FF6B00]" />
                {from.email}
              </span>
            )}
            {from.phone && (
              <span className="inline-flex items-center gap-1.5">
                <HiPhone size={13} className="text-[#FF6B00]" />
                {from.phone}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <HiGlobeAlt size={13} className="text-[#FF6B00]" />
              www.lenzora.lk
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminInvoices() {
  const { settings, orders } = useApp()
  const logoSrc = settings.logo_url || defaultLogo

  const [meta, setMeta] = useState(() => ({
    number: makeInvNo(),
    issueDate: localISO(new Date()),
    dueDate: localISO(new Date(Date.now() + 30 * 86400000)),
  }))
  const [from, setFrom] = useState(() => ({
    name: settings.site_name || 'Lenzora',
    tagline: settings.tagline || 'Premium digital graphics services.',
    email: settings.contact_email || '',
    phone: settings.whatsapp ? `+${settings.whatsapp}` : '',
    address: '',
  }))
  const [billTo, setBillTo] = useState({ name: '', address: '', email: '', phone: '' })
  const [items, setItems] = useState([{ id: nextItemId(), description: '', qty: 1, rate: '' }])
  const [discount, setDiscount] = useState('')
  const [tax, setTax] = useState('')
  const [notes, setNotes] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [sharing, setSharing] = useState(false)
  const sheetRef = useRef(null)

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.rate) || 0), 0)
    const discountAmt = subtotal * ((Number(discount) || 0) / 100)
    const taxable = subtotal - discountAmt
    const taxAmt = taxable * ((Number(tax) || 0) / 100)
    return { subtotal, discountAmt, taxAmt, grand: taxable + taxAmt }
  }, [items, discount, tax])

  useEffect(() => {
    if (!showPreview) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && setShowPreview(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [showPreview])

  const updateItem = (id, patch) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  const addItem = () => setItems((prev) => [...prev, { id: nextItemId(), description: '', qty: 1, rate: '' }])
  const removeItem = (id) => setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev))

  const regenerateNumber = () => setMeta((m) => ({ ...m, number: makeInvNo() }))

  const handleReset = () => {
    setMeta({
      number: makeInvNo(),
      issueDate: localISO(new Date()),
      dueDate: localISO(new Date(Date.now() + 30 * 86400000)),
    })
    setBillTo({ name: '', address: '', email: '', phone: '' })
    setItems([{ id: nextItemId(), description: '', qty: 1, rate: '' }])
    setDiscount('')
    setTax('')
    setNotes('')
  }

  const loadFromOrder = (id) => {
    if (!id) return
    const o = orders.find((x) => String(x.id) === id)
    if (!o) return
    setBillTo({
      name: o.customer_name || '',
      address: '',
      email: o.customer_email || '',
      phone: o.customer_phone || '',
    })
    setItems((prev) => {
      const filled = prev.some((i) => i.description.trim())
      const row = { id: nextItemId(), description: o.details?.trim() || 'Design services', qty: 1, rate: String(o.amount ?? '') }
      return filled ? [...prev, row] : [row]
    })
  }

  const sheetData = { meta, from, billTo, items, discount, tax, notes, totals }

  const invoiceMessage = () =>
    [
      `Hello ${billTo.name || 'there'}!`,
      '',
      `Here is your invoice ${meta.number} from ${from.name}.`,
      '',
      `Total Due: LKR ${fmtMoney(totals.grand)}`,
      `Due Date: ${fmtDate(meta.dueDate)}`,
      '',
      'Thank you for your business!',
    ].join('\n')

  const makeInvoicePdf = async () => {
    const canvas = await html2canvas(sheetRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const imgH = (canvas.height * pageW) / canvas.width
    let position = 0
    let heightLeft = imgH - pageH
    pdf.addImage(imgData, 'JPEG', 0, 0, pageW, imgH)
    while (heightLeft > 0) {
      position -= pageH
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, pageW, imgH)
      heightLeft -= pageH
    }
    return pdf
  }

  const handleWhatsApp = async () => {
    if (sharing) return
    setSharing(true)
    const fileName = `${meta.number || 'invoice'}.pdf`
    try {
      const pdf = await makeInvoicePdf()
      const message = invoiceMessage()
      const file = new File([pdf.output('blob')], fileName, { type: 'application/pdf' })
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: fileName, text: message })
          setSharing(false)
          return
        } catch (err) {
          if (err?.name === 'AbortError') {
            setSharing(false)
            return
          }
        }
      }
      pdf.save(fileName)
      const digits = (billTo.phone || '').replace(/\D/g, '')
      window.open(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`, '_blank', 'noopener')
    } catch (err) {
      console.error('Failed to prepare invoice PDF:', err)
      alert('Could not prepare the invoice PDF. Please try again.')
    }
    setSharing(false)
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-dark dark:text-white">Invoices</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Build professional invoices with live totals and instant PDF export.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#2f2f2f] text-gray-600 dark:text-slate-300 text-sm font-semibold rounded-full hover:border-primary/40 hover:text-primary transition"
          >
            <HiRefresh size={16} />
            Reset
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-semibold rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/45 hover:-translate-y-0.5 transition"
          >
            <HiEye size={17} />
            Preview Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 space-y-6">
          <div className={cardCls}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><HiDocumentText size={18} /></div>
              <h3 className="font-bold text-dark dark:text-white">Invoice Details</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Invoice #</label>
                <div className="flex gap-2">
                  <input value={meta.number} onChange={(e) => setMeta({ ...meta, number: e.target.value })} className={`${inputCls} font-mono`} />
                  <button onClick={regenerateNumber} title="Generate new number" className="shrink-0 w-11 h-11 flex items-center justify-center rounded-xl border border-gray-200 dark:border-[#2f2f2f] text-gray-400 hover:text-primary hover:border-primary/40 transition">
                    <HiRefresh size={16} />
                  </button>
                </div>
              </div>
              <div>
                <label className={labelCls}>Issue Date</label>
                <input type="date" value={meta.issueDate} onChange={(e) => setMeta({ ...meta, issueDate: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Due Date</label>
                <input type="date" value={meta.dueDate} onChange={(e) => setMeta({ ...meta, dueDate: e.target.value })} className={inputCls} />
              </div>
            </div>
          </div>

          <div className={cardCls}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center"><HiOfficeBuilding size={18} /></div>
              <h3 className="font-bold text-dark dark:text-white">From</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Business Name</label>
                <input value={from.name} onChange={(e) => setFrom({ ...from, name: e.target.value })} className={inputCls} placeholder="Lenzora" />
              </div>
              <div>
                <label className={labelCls}>Tagline</label>
                <input value={from.tagline} onChange={(e) => setFrom({ ...from, tagline: e.target.value })} className={inputCls} placeholder="Premium digital graphics services." />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input value={from.email} onChange={(e) => setFrom({ ...from, email: e.target.value })} className={inputCls} placeholder="hello@lenzora.lk" />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input value={from.phone} onChange={(e) => setFrom({ ...from, phone: e.target.value })} className={inputCls} placeholder="+94 71 234 5678" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Address</label>
                <textarea value={from.address} onChange={(e) => setFrom({ ...from, address: e.target.value })} rows={2} className={`${inputCls} resize-none`} placeholder="Business address (optional)" />
              </div>
            </div>
          </div>

          <div className={cardCls}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center"><HiUser size={18} /></div>
                <h3 className="font-bold text-dark dark:text-white">Bill To</h3>
              </div>
              <select
                value=""
                onChange={(e) => loadFromOrder(e.target.value)}
                className={`${inputCls} sm:w-auto max-w-full`}
              >
                <option value="">Load client from an order…</option>
                {orders.slice(0, 50).map((o) => (
                  <option key={o.id} value={o.id}>
                    #{o.id} · {o.customer_name} · LKR {Number(o.amount).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Client Name *</label>
                <input value={billTo.name} onChange={(e) => setBillTo({ ...billTo, name: e.target.value })} className={inputCls} placeholder="Client or company name" />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" value={billTo.email} onChange={(e) => setBillTo({ ...billTo, email: e.target.value })} className={inputCls} placeholder="client@email.com" />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input value={billTo.phone} onChange={(e) => setBillTo({ ...billTo, phone: e.target.value })} className={inputCls} placeholder="+94 …" />
              </div>
              <div>
                <label className={labelCls}>Address</label>
                <textarea value={billTo.address} onChange={(e) => setBillTo({ ...billTo, address: e.target.value })} rows={1} className={`${inputCls} resize-none`} placeholder="Client address (optional)" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between gap-3 p-5 sm:p-6 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center"><HiCollection size={18} /></div>
                <h3 className="font-bold text-dark dark:text-white">Line Items</h3>
              </div>
              <span className="text-xs text-gray-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-y border-gray-100 dark:border-[#262626] text-left text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-white/5 text-xs uppercase tracking-wider">
                    <th className="py-3 pl-5 sm:pl-6 pr-2 font-medium w-10">#</th>
                    <th className="py-3 px-2 font-medium">Description</th>
                    <th className="py-3 px-2 font-medium w-24 text-right">Qty</th>
                    <th className="py-3 px-2 font-medium w-36 text-right">Rate (LKR)</th>
                    <th className="py-3 px-2 font-medium w-32 text-right">Amount</th>
                    <th className="py-3 pl-2 pr-4 font-medium w-14"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id} className="border-b border-gray-50 dark:border-[#1d1d24]">
                      <td className="py-2.5 pl-5 sm:pl-6 pr-2 text-gray-300 dark:text-slate-600 font-mono text-xs">{String(i + 1).padStart(2, '0')}</td>
                      <td className="py-2.5 px-2">
                        <input value={item.description} onChange={(e) => updateItem(item.id, { description: e.target.value })} className={`${inputCls} !py-2`} placeholder="Service or product…" />
                      </td>
                      <td className="py-2.5 px-2">
                        <input type="number" min="0" step="any" value={item.qty} onChange={(e) => updateItem(item.id, { qty: e.target.value })} className={`${inputCls} !py-2 text-right`} />
                      </td>
                      <td className="py-2.5 px-2">
                        <input type="number" min="0" step="any" value={item.rate} onChange={(e) => updateItem(item.id, { rate: e.target.value })} className={`${inputCls} !py-2 text-right`} placeholder="0.00" />
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums font-semibold text-dark dark:text-white">
                        {fmtMoney((Number(item.qty) || 0) * (Number(item.rate) || 0))}
                      </td>
                      <td className="py-2.5 pl-2 pr-4">
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                          title="Remove item"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-30 disabled:pointer-events-none transition"
                        >
                          <HiTrash size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-5 sm:p-6 pt-4">
              <button
                onClick={addItem}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-[#2f2f2f] text-gray-500 dark:text-slate-400 hover:border-primary/50 hover:text-primary text-sm font-semibold transition"
              >
                <HiPlus size={16} />
                Add Item
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24">
          <div className={cardCls}>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center"><HiCalendar size={18} /></div>
              <h3 className="font-bold text-dark dark:text-white">Summary & Adjustments</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className={labelCls}>Discount (%)</label>
                <input type="number" min="0" max="100" step="any" value={discount} onChange={(e) => setDiscount(e.target.value)} className={inputCls} placeholder="0" />
              </div>
              <div>
                <label className={labelCls}>Tax (%)</label>
                <input type="number" min="0" step="any" value={tax} onChange={(e) => setTax(e.target.value)} className={inputCls} placeholder="0" />
              </div>
            </div>
            <div className="space-y-2.5 text-sm border-t border-gray-100 dark:border-[#262626] pt-4">
              <div className="flex justify-between text-gray-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium text-dark dark:text-white">LKR {fmtMoney(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-slate-400">
                <span>Discount ({Number(discount) || 0}%)</span>
                <span className="tabular-nums font-medium text-red-500">− LKR {fmtMoney(totals.discountAmt)}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-slate-400">
                <span>Tax ({Number(tax) || 0}%)</span>
                <span className="tabular-nums font-medium text-dark dark:text-white">+ LKR {fmtMoney(totals.taxAmt)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-3.5 mt-4 shadow-lg shadow-primary/30">
              <span className="text-xs font-bold uppercase tracking-wider opacity-90">Grand Total</span>
              <span className="text-xl font-extrabold tabular-nums">LKR {fmtMoney(totals.grand)}</span>
            </div>
            <div className="mt-5">
              <label className={labelCls}>Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="Payment instructions, bank details, thank-you note…" />
            </div>
            <button
              onClick={() => setShowPreview(true)}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-dark dark:bg-white text-white dark:text-dark text-sm font-bold rounded-full hover:opacity-90 transition"
            >
              <HiSparkles size={16} />
              Live Preview
            </button>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-5 text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
            <p><span className="font-bold text-dark dark:text-white">Tip:</span> Open the preview to <span className="font-semibold text-primary">send via WhatsApp</span> with the PDF attached, or use Save PDF / Print for an A4 export.</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPreview && createPortal(
          <div className="lenzora-invoice-host fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-6 lg:p-10">
            <style>{PRINT_CSS}</style>
            <div className="lenzora-invoice-backdrop fixed inset-0" onClick={() => setShowPreview(false)} />
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="lenzora-invoice-panel relative w-full max-w-4xl mx-auto"
            >
              <div className="print:hidden sticky top-0 z-10 -mx-1 px-1 pt-1 pb-3 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md rounded-t-2xl">
                <div className="flex items-center gap-2 text-white/90">
                  <HiEye size={18} />
                  <span className="text-sm font-bold">Invoice Preview</span>
                  <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-white/15 tracking-widest">{meta.number}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleWhatsApp}
                    disabled={sharing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white text-xs font-bold rounded-full shadow-lg shadow-[#25D366]/30 hover:-translate-y-0.5 transition disabled:opacity-60"
                  >
                    <FaWhatsapp size={15} />
                    {sharing ? 'Preparing…' : 'WhatsApp'}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white text-xs font-bold rounded-full shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition"
                  >
                    <HiDocumentDownload size={15} />
                    Save PDF
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-800 text-xs font-bold rounded-full hover:bg-gray-100 transition"
                  >
                    <HiPrinter size={15} />
                    Print
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    title="Close (Esc)"
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 transition"
                  >
                    <HiX size={17} />
                  </button>
                </div>
              </div>

              <div ref={sheetRef}>
                <InvoiceSheet data={sheetData} logoSrc={logoSrc} />
              </div>

              <p className="print:hidden text-center text-white/50 text-xs mt-4 pb-2">
                WhatsApp attaches the PDF automatically on phones. On desktop it downloads the PDF and opens the chat — just drag the file in.
              </p>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </div>
  )
}
