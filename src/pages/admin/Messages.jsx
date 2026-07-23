import { useState, useEffect, useRef } from 'react'
import { HiReply } from 'react-icons/hi'
import { useApp } from '../../lib/AppContext'
import { supabase } from '../../lib/supabase'
import { fetchMessagesByConversation, addMessageToConversation, updateConversation } from '../../lib/db'

export default function AdminMessages() {
  const { user, profile } = useApp()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const { data } = await supabase.from('conversations').select('*').order('created_at', { ascending: false })
      setConversations(data || [])
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const openConversation = async (conv) => {
    setSelected(conv)
    try {
      const msgs = await fetchMessagesByConversation(conv.id)
      setMessages(msgs || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleReply = async () => {
    if (!reply.trim() || !selected || !user) return
    setSending(true)
    try {
      const msg = await addMessageToConversation({
        conversation_id: selected.id,
        sender_id: user.id,
        sender_email: user.email,
        sender_name: profile?.full_name || 'Admin',
        body: reply,
        is_admin: true,
      })
      setMessages((prev) => [...prev, msg])
      setReply('')
      setConversations((prev) => prev.map((c) => c.id === selected.id ? { ...c, updated_at: new Date().toISOString() } : c))
    } catch (err) {
      console.error('Failed to send reply:', err)
    }
    setSending(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">Messages</h1>
        <p className="text-gray-500">Reply to customer inquiries.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[500px]">
          <div className="lg:col-span-1 border-r border-gray-100 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-400">No conversations yet.</div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => openConversation(conv)}
                  className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition ${
                    selected?.id === conv.id ? 'bg-primary/5' : ''
                  }`}
                >
                  <p className="font-semibold text-dark text-sm truncate">{conv.customer_name}</p>
                  <p className="text-xs text-gray-400 truncate">{conv.subject || 'General Inquiry'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{conv.customer_email}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${conv.status === 'open' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {conv.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="lg:col-span-2 flex flex-col">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 p-10">
                Select a conversation to view messages.
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-dark">{selected.customer_name}</h3>
                    <p className="text-xs text-gray-500">{selected.customer_email} — {selected.subject || 'General Inquiry'}</p>
                  </div>
                  <select
                    value={selected.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value
                      await updateConversation(selected.id, { status: newStatus })
                      setSelected({ ...selected, status: newStatus })
                      setConversations((prev) => prev.map((c) => c.id === selected.id ? { ...c, status: newStatus } : c))
                    }}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm bg-white outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="flex-1 p-4 space-y-4 overflow-y-auto" style={{ maxHeight: '400px' }}>
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[75%] p-3 rounded-2xl ${msg.is_admin ? 'bg-gray-100 text-gray-800' : 'bg-primary text-white'}`}>
                        <p className="text-xs opacity-70 mb-1">{msg.is_admin ? 'You' : msg.sender_name}</p>
                        <p className="text-sm">{msg.body}</p>
                        <p className="text-xs opacity-50 mt-1">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && <p className="text-gray-400 text-center py-8">No messages in this conversation.</p>}
                  <div ref={bottomRef} />
                </div>
                {selected.status === 'open' && (
                  <div className="p-4 border-t border-gray-100 flex gap-2">
                    <input
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                    />
                    <button onClick={handleReply} disabled={sending || !reply.trim()} className="px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark disabled:opacity-50">
                      <HiReply size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
