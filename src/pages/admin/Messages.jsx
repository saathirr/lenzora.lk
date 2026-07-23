import { useState, useEffect, useRef } from 'react'
import { useApp } from '../../lib/AppContext'
import { supabase } from '../../lib/supabase'
import { fetchMessagesByConversation, addMessageToConversation, updateConversation, subscribeToMessages, uploadFile } from '../../lib/db'
import { HiReply, HiPaperClip } from 'react-icons/hi'
import { BsEmojiSmile } from 'react-icons/bs'
import EmojiPicker from 'emoji-picker-react'

export default function AdminMessages() {
  const { user, profile } = useApp()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pendingAttachments, setPendingAttachments] = useState([])

  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)
  const inputRef = useRef(null)
  const emojiRef = useRef(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

  useEffect(() => {
    const handleClick = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

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
    setReplyingTo(null)
    setPendingAttachments([])
    try {
      const msgs = await fetchMessagesByConversation(conv.id)
      setMessages(msgs || [])
    } catch (err) {
      console.error(err)
    }
  }

  const insertEmoji = (emoji) => {
    setReply((prev) => prev + emoji)
    inputRef.current?.focus()
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    setUploading(true)
    try {
      const urls = await Promise.all(
        files.map((file) => {
          const ext = file.name.split('.').pop()
          const path = `messages/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
          return uploadFile('message-attachments', path, file)
        })
      )
      setPendingAttachments((prev) => [...prev, ...urls])
    } catch (err) {
      console.error('Upload failed:', err)
    }
    setUploading(false)
    e.target.value = ''
  }

  const removeAttachment = (url) => {
    setPendingAttachments((prev) => prev.filter((u) => u !== url))
  }

  const handleReply = async () => {
    if ((!reply.trim() && pendingAttachments.length === 0) || !selected || !user) return
    setSending(true)
    try {
      const payload = {
        conversation_id: selected.id,
        sender_id: user.id,
        sender_email: user.email,
        sender_name: profile?.full_name || 'Admin',
        body: reply,
        is_admin: true,
      }
      if (replyingTo) payload.reply_to = replyingTo.id
      if (pendingAttachments.length > 0) payload.attachments = pendingAttachments

      const msg = await addMessageToConversation(payload)
      setMessages((prev) => [...prev, msg])
      setReply('')
      setReplyingTo(null)
      setPendingAttachments([])
      setConversations((prev) => prev.map((c) => c.id === selected.id ? { ...c, updated_at: new Date().toISOString() } : c))
    } catch (err) {
      console.error('Failed to send reply:', err)
    }
    setSending(false)
  }

  const renderMessageContent = (m) => {
    return (
      <>
        {m.reply_to && (
          <div className={`text-[10px] ${m.is_admin ? 'text-gray-400' : 'text-white/60'} mb-1 truncate flex items-center gap-1`}>
            <HiReply size={10} />
            <span className="truncate">Replied to: {messages.find(msg => msg.id === m.reply_to)?.body || 'a message'}</span>
          </div>
        )}
        <p className="text-sm">{m.body}</p>
        {m.attachments && m.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {m.attachments.map((url, i) => {
              const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url)
              const isVideo = /\.(mp4|webm|ogg|mov|avi)$/i.test(url)
              return (
                <div key={i}>
                  {isImage ? (
                    <img src={url} alt="attachment" className="max-w-[200px] max-h-[200px] rounded-lg object-cover" loading="lazy" />
                  ) : isVideo ? (
                    <video src={url} controls className="max-w-[200px] max-h-[200px] rounded-lg" />
                  ) : (
                    <a href={url} target="_blank" rel="noopener noreferrer" className={`text-xs underline ${m.is_admin ? 'text-primary' : 'text-white/80'}`}>
                      Attachment {i + 1}
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </>
    )
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
                    <div key={msg.id} className="relative group">
                      <div className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[75%] p-3 rounded-2xl ${msg.is_admin ? 'bg-gray-100 text-gray-800' : 'bg-primary text-white'}`}>
                          <p className="text-xs opacity-70 mb-1">{msg.is_admin ? 'You' : msg.sender_name}</p>
                          {renderMessageContent(msg)}
                          <p className="text-xs opacity-50 mt-1">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <div
                        className="absolute top-0 h-full flex items-center opacity-0 group-hover:opacity-100 transition"
                        style={{ right: msg.is_admin ? '-36px' : 'auto', left: !msg.is_admin ? '-36px' : 'auto' }}
                      >
                        <button
                          onClick={() => setReplyingTo(msg)}
                          className="p-2 bg-primary text-white rounded-full shadow-md hover:bg-primary-dark transition"
                          title="Reply"
                        >
                          <HiReply size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && <p className="text-gray-400 text-center py-8">No messages in this conversation.</p>}
                  <div ref={bottomRef} />
                </div>

                {replyingTo && (
                  <div className="px-4 py-2 bg-primary/5 border-t border-primary/20 flex items-center gap-2 text-sm text-dark">
                    <HiReply size={14} className="text-primary shrink-0" />
                    <span className="truncate flex-1">Replying to: {replyingTo.body}</span>
                    <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                  </div>
                )}

                {pendingAttachments.length > 0 && (
                  <div className="px-4 py-2 border-t border-gray-100 flex flex-wrap gap-2">
                    {pendingAttachments.map((url, i) => (
                      <div key={i} className="relative group">
                        {/\.(jpg|jpeg|png|gif|webp)$/i.test(url) ? (
                          <img src={url} alt="preview" className="h-12 w-12 rounded-lg object-cover border" />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 border">
                            {url.split('.').pop()}
                          </div>
                        )}
                        <button
                          onClick={() => removeAttachment(url)}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {selected.status === 'open' && (
                  <div className="p-4 border-t border-gray-100">
                    <div className="flex gap-2 items-end">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="p-2.5 text-gray-400 hover:text-primary transition rounded-xl hover:bg-gray-50 disabled:opacity-50"
                        title="Attach media"
                      >
                        <HiPaperClip size={20} />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="flex-1 relative">
                        <input
                          ref={inputRef}
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          placeholder="Type your reply..."
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm pr-10"
                          onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                        />
                        <div className="absolute right-2 bottom-1/2 translate-y-1/2" ref={emojiRef}>
                          <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="p-1 text-gray-400 hover:text-primary transition rounded"
                            title="Emoji"
                          >
                            <BsEmojiSmile size={18} />
                          </button>
                          {showEmojiPicker && (
                            <div className="absolute bottom-full right-0 mb-2 z-50">
                              <EmojiPicker
                                onEmojiClick={(emojiData) => {
                                  insertEmoji(emojiData.emoji)
                                  setShowEmojiPicker(false)
                                }}
                                skinTonesDisabled
                                searchDisabled
                                width={280}
                                height={320}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={handleReply}
                        disabled={sending || uploading || (!reply.trim() && pendingAttachments.length === 0)}
                        className="px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark disabled:opacity-50"
                      >
                        <HiReply size={18} />
                      </button>
                    </div>
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