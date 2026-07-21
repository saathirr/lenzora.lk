import { useState } from 'react'
import { HiPlus, HiTrash } from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'

export default function AdminPortfolio() {
  const { portfolio, setPortfolio, createPortfolioItem, deletePortfolioItem, dataLoading } = useApp()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [saving, setSaving] = useState(false)

  const addItem = async () => {
    if (!title || !category) return
    setSaving(true)
    try {
      const created = await createPortfolioItem({
        title,
        category,
        image: imageUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=600&fit=crop',
      })
      setPortfolio((prev) => [...prev, created])
      setTitle('')
      setCategory('')
      setImageUrl('')
    } catch (err) {
      console.error('Failed to add portfolio item:', err)
      alert('Failed to add item.')
    }
    setSaving(false)
  }

  const deleteItem = async (id) => {
    if (!confirm('Delete this portfolio item?')) return
    try {
      await deletePortfolioItem(id)
      setPortfolio((prev) => prev.filter((i) => i.id !== id))
    } catch (err) {
      console.error('Failed to delete item:', err)
      alert('Failed to delete item.')
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">Portfolio</h1>
        <p className="text-gray-500">Manage your portfolio items.</p>
      </div>

      <div className="mb-6 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <h3 className="font-bold text-dark mb-4">Add New Item</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project title"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none"
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none"
          />
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL (optional)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none"
          />
          <button
            onClick={addItem}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition shrink-0 disabled:opacity-50"
          >
            <HiPlus />
            {saving ? 'Adding...' : 'Add Item'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolio.map((item) => (
          <div key={item.id} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h4 className="font-semibold text-dark truncate">{item.title}</h4>
              <span className="text-xs text-gray-500">{item.category}</span>
            </div>
            <button
              onClick={() => deleteItem(item.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition shrink-0"
            >
              <HiTrash size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
