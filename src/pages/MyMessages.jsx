import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiMail, HiReply, HiChat } from 'react-icons/hi'
import { useApp } from '../lib/AppContext'

export default function MyMessages() {
  const { user, fetchMyConversations, fetchMessagesByConversation, addMessageToConversation } = useApp()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (user) {
      fetchMyConversations(user.id).then(setConversations).catch(console.error).finally(() => setLoading(false))
    }
  }, [user])

  const openConversation = async (conv) => {
    setSelected(conv)
    const msgs = await fetchMessagesByConversation(conv.id)
    setMessages(msgs)
  }

  const handleReply = async () => {
    if (!reply.trim() || !selected || !user) return
    setSending(true)
    try {
      const msg = await addMessageToConversation({
        conversation_id: selected.id,
        sender_id: user.id,
        sender_email: user.email,
        sender_name: user.user_metadata?.full_name || 'Customer',
        body: reply,
        is_admin: false,
      })
      setMessages((prev) => [...prev, msg])
      setReply('')
    } catch (err) {
      console.error('Failed to send reply:', err)
      alert('Failed to send reply.')
    }
    setSending(false)
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please sign in to view your messages.</p>
          <Link to="/login" className="px-6 py-3 bg-primary text-white font-semibold rounded-full">Sign In</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-dark">My Messages</h1>
          <p className="text-gray-500 mt-2">View replies from our team.</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm">
            <HiMail className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-dark mb-2">No Messages</h3>
            <p className="text-gray-500 mb-6">You haven't sent any messages yet.</p>
            <Link to="/contact" className="px-6 py-3 bg-primary text-white font-semibold rounded-full">Contact Us</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => openConversation(conv)}
                  className={`w-full text-left p-4 rounded-xl border transition ${
                    selected?.id === conv.id ? 'bg-primary/5 border-primary/30' : 'bg-white border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <p className="font-semibold text-dark text-sm truncate">{conv.subject || 'General Inquiry'}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(conv.created_at).toLocaleDateString()}</p>
                  <span className={`text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-full ${conv.status === 'open' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {conv.status}
                  </span>
                </button>
              ))}
            </div>
            <div className="lg:col-span-2">
              {!selected ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm">
                  <HiChat className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500">Select a conversation to view messages.</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-dark">{selected.subject || 'General Inquiry'}</h3>
                  </div>
                  <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl ${msg.is_admin ? 'bg-gray-100 text-gray-800' : 'bg-primary text-white'}`}>
                          <p className="text-xs opacity-70 mb-1">{msg.sender_name}</p>
                          <p className="text-sm">{msg.body}</p>
                          <p className="text-xs opacity-50 mt-1">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ))}
                    {messages.length === 0 && <p className="text-gray-400 text-center py-8">No messages yet.</p>}
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
                        {sending ? '...' : <HiReply size={18} />}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
