import { useState } from 'react'
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'

export default function AdminProducts() {
  const { products, setProducts } = useApp()
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', desc: '', price: '', stock: '' })

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', desc: '', price: '', stock: '' })
    setShowForm(true)
  }

  const openEdit = (p) => {
    setEditing(p.id)
    setForm({ name: p.name, desc: p.desc || '', price: p.price, stock: p.stock })
    setShowForm(true)
  }

  const handleSave = () => {
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) }
    if (editing) {
      setProducts((prev) => prev.map((p) => (p.id === editing ? { ...p, ...payload } : p)))
    } else {
      setProducts((prev) => [...prev, { id: Date.now(), ...payload }])
    }
    setShowForm(false)
  }

  const handleDelete = (id) => {
    if (confirm('Delete this product?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id))
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">Products</h1>
          <p className="text-gray-500">Manage your shop products.</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition"
        >
          <HiPlus />
          Add Product
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <h3 className="font-bold text-dark mb-4">{editing ? 'Edit Product' : 'New Product'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" />
            <input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Description" className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" />
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price (LKR)" className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" />
            <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock" className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" />
            <div className="flex items-center gap-2">
              <button onClick={handleSave} className="px-4 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary-dark">Save</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500 bg-gray-50">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4 font-medium text-dark">{p.name}</td>
                  <td className="p-4 font-medium text-dark">LKR {Number(p.price).toLocaleString()}</td>
                  <td className="p-4 text-gray-600">{p.stock}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><HiPencil size={16} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><HiTrash size={16} /></button>
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
