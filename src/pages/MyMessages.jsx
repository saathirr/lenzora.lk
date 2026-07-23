import { subscribeToMessages } from '../../lib/db'
import { useState, useEffect } from 'react'
import { useApp } from '../lib/AppContext'
import { fetchMyConversations, createConversation, fetchMessagesByConversation, addMessageToConversation } from '../lib/db'
import { fetchMyConversations, createConversation, fetchMessagesByConversation, addMessageToConversation, subscribeToMessages } from '../lib/db'

export default function MyMessages() {
  const { user, profile } = useApp()
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)

  useEffect(() => {
    if (user) loadConversations()
  }, [user])

  const loadConversations = async () => {
    setLoading(true)
    try {
      const data = await fetchMyConversations(user.id)
      setConversations(data)
      if (data.length > 0 && !activeConv) {
        selectConversation(data[0])
      }
    } catch (err) {
      console.error('Failed to load conversations:', err)
    }
    setLoading(false)
  }

  const selectConversation = async (conv) => {
    setActiveConv(conv)
    try {
      const msgs = await fetchMessagesByConversation(conv.id)
      setMessages(msgs)
    } catch (err) {
      console.error('Failed to load messages:', err)
    }
  }

  const startNewConversation = async () => {
    if (!subject.trim()) return
    try {
      const conv = await createConversation({
        customer_id: user.id,
        customer_name: profile?.full_name || user.email,
        customer_email: user.email,
        subject,
        status: 'open',
      })
      setConversations((prev) => [conv, ...prev])
      setSubject('')
      setShowNewForm(false)
      selectConversation(conv)
    } catch (err) {
      console.error('Failed to create conversation:', err)
      alert('Failed to start conversation.')
    }
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConv) return
    try {
      const msg = await addMessageToConversation({
        conversation_id: activeConv.id,
        sender_id: user.id,
        sender_email: user.email,
        sender_name: profile?.full_name || user.email,
        body: newMessage,
        is_admin: false,
      })
      setMessages((prev) => [...prev, msg])
      setNewMessage('')
    } catch (err) {
      console.error('Failed to send message:', err)
      alert('Failed to send message.')
    }
  }

  if (!user) {
    return (
      <div className="py-20 text-center text-gray-500">
        Please sign in to view your messages.
      </div>
    )
  }

  return (
    <div className="py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-dark">My Messages</h1>
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition"
          >
            + New Message
          </button>
        </div>

        {showNewForm && (
          <div className="mb-6 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <h3 className="font-bold text-dark mb-3">Start a new conversation</h3>
            <div className="flex gap-3">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What's this about?"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none"
              />
              <button
                onClick={startNewConversation}
                className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition"
              >
                Start
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No conversations yet. Start a new message above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-2">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => selectConversation(c)}
                  className={`w-full text-left p-4 rounded-xl border transition ${
                    activeConv?.id === c.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-100 bg-white hover:bg-gray-50'
                  }`}
                >
                  <p className="font-medium text-dark truncate">{c.subject}</p>
                  <p className="text-xs text-gray-400 mt-1">{c.status}</p>
                </button>
              ))}
            </div>

            <div className="md:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col h-[500px]">
              {activeConv ? (
                <>
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-semibold text-dark">{activeConv.subject}</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex ${!m.is_admin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                            !m.is_admin
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-dark'
                          }`}
                        >
                          <p>{m.body}</p>
                          <p className={`text-[10px] mt-1 ${!m.is_admin ? 'text-white/70' : 'text-gray-400'}`}>
                            {m.is_admin ? 'Support Team' : m.sender_name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-100 flex gap-2">
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm"
                    />
                    <button
                      onClick={handleSend}
                      className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition"
                    >
                      Send
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  Select a conversation
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
  useEffect(() => {
  if (!activeConv) return
  const unsubscribe = subscribeToMessages(activeConv.id, (newMsg) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === newMsg.id)) return prev
      return [...prev, newMsg]
    })
  })
  return unsubscribe
}, [activeConv])
useEffect(() => {
  if (!selected) return
  const unsubscribe = subscribeToMessages(selected.id, (newMsg) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === newMsg.id)) return prev
      return [...prev, newMsg]
    })
  })
  return unsubscribe
}, [selected])
}