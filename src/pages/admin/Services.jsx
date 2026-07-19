import { useState } from 'react'
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'

export default function AdminServices() {
  const { services, setServices } = useApp()
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', desc: '', price: '', category: '', active: true })

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', desc: '', price: '', category: '', active: true })
    setShowForm(true)
  }

  const openEdit = (s) => {
    setEditing(s.id)
    setForm({ name: s.name, desc: s.desc || '', price: s.price, category: s.category, active: s.active })
    setShowForm(true)
  }

  const handleSave = () => {
    const payload = { ...form, price: Number(form.price) }
    if (editing) {
      setServices((prev) => prev.map((s) => (s.id === editing ? { ...s, ...payload } : s)))
    } else {
      setServices((prev) => [...prev, { id: Date.now(), icon: 'HiPhotograph', features: [], ...payload }])
    }
    setShowForm(false)
  }

  const handleDelete = (id) => {
    if (confirm('Delete this service?')) {
      setServices((prev) => prev.filter((s) => s.id !== id))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">Services</h1>
          <p className="text-gray-500">Manage your service offerings.</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition"
        >
          <HiPlus />
          Add Service
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <h3 className="font-bold text-dark mb-4">{editing ? 'Edit Service' : 'New Service'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Service name" className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" />
            <input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Description" className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" />
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price (LKR)" className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" />
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" />
          </div>
          <div className="flex items-center gap-4 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-primary" />
              <span className="text-sm text-gray-600">Active</span>
            </label>
            <button onClick={handleSave} className="px-4 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary-dark">Save</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500 bg-gray-50">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium hidden sm:table-cell">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4 font-medium text-dark">{s.name}</td>
                  <td className="p-4 text-gray-600 hidden sm:table-cell">{s.category}</td>
                  <td className="p-4 font-medium text-dark">LKR {Number(s.price).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${s.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {s.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><HiPencil size={16} /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><HiTrash size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
