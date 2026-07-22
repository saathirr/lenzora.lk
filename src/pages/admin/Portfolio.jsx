import { useState } from 'react'
import { HiPlus, HiTrash, HiUpload } from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'
import { supabase } from '../../lib/supabase'

export default function AdminPortfolio() {
  const { portfolio, setPortfolio, createPortfolioItem, deletePortfolioItem, dataLoading } = useApp()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
    }
  }

  const addItem = async () => {
    if (!title || !category || !file) {
      alert('Please fill title, category, and select an image.')
      return
    }
    setSaving(true)
    setUploadProgress('Uploading image...')
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(fileName)

      setUploadProgress('Saving item...')

      const created = await createPortfolioItem({
        title,
        category,
        image: urlData.publicUrl,
      })
      setPortfolio((prev) => [...prev, created])
      setTitle('')
      setCategory('')
      setFile(null)
      setPreview(null)
    } catch (err) {
      console.error('Failed to add portfolio item:', err)
      alert('Failed to add item: ' + err.message)
    }
    setSaving(false)
    setUploadProgress('')
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
        <div className="flex flex-col gap-3">
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
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition text-sm text-gray-600">
              <HiUpload size={18} />
              {file ? file.name : 'Choose Image'}
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
            {preview && (
              <img src={preview} alt="preview" className="w-14 h-14 rounded-lg object-cover" />
            )}
          </div>

          <button
            onClick={addItem}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition disabled:opacity-50 self-start"
          >
            <HiPlus />
            {saving ? uploadProgress || 'Adding...' : 'Add Item'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolio.map((item) => (
          <div key={item.id} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img src={item.image || item.src} alt={item.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
              <div className="min-w-0">
                <h4 className="font-semibold text-dark truncate">{item.title}</h4>
                <span className="text-xs text-gray-500">{item.category}</span>
              </div>
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