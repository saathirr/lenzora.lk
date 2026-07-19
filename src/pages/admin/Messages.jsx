import { useState } from 'react'
import { useApp } from '../../lib/AppContext'

export default function AdminMessages() {
  const { messages, setMessages } = useApp()
  const [expanded, setExpanded] = useState(null)

  const toggleRead = (id) => {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: !m.read } : m))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">Messages</h1>
          <p className="text-gray-500">Customer inquiries from the contact form.</p>
        </div>
        <span className="text-sm text-gray-500">{messages.filter((m) => !m.read).length} unread</span>
      </div>

      <div className="space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            onClick={() => !m.read && toggleRead(m.id)}
            className={`p-5 rounded-2xl border transition cursor-pointer hover:shadow-sm ${
              m.read ? 'bg-white border-gray-100' : 'bg-primary/5 border-primary/20'
            }`}
          >
            <div className="flex items-start justify-between mb-2 gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-dark">{m.name}</h3>
                <p className="text-xs text-gray-400 truncate">{m.email} — {m.date}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!m.read && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                    New
                  </span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleRead(m.id) }}
                  className="text-xs text-gray-400 hover:text-primary"
                >
                  {m.read ? 'Mark unread' : 'Mark read'}
                </button>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">{m.subject}</p>
            <p className="text-sm text-gray-500 line-clamp-2">{m.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
