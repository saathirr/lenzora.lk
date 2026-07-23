import { useState, useEffect, useRef } from 'react'
import { useApp } from '../lib/AppContext'
import { fetchMyConversations, createConversation, fetchMessagesByConversation, addMessageToConversation, subscribeToMessages, uploadFile } from '../lib/db'
import { HiReply, HiPaperClip } from 'react-icons/hi'
import { BsEmojiSmile } from 'react-icons/bs'

const EMOJIS = ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','🥰','😘','😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','☹️','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬','😰','😱','🥵','🥶','😳','🤪','😵','😡','😠','🤬','👍','👎','👊','✊','🤛','🤜','🤞','✌️','🤟','🤘','👌','❤️','💔','💖','💙','💚','💛','🧡','💜','🤎','🖤','🔥','⭐','✅','❌','‼️','❓','💯','🎉']

export default function MyMessages() {
  const { user, profile } = useApp()
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pendingAttachments, setPendingAttachments] = useState([])
  const [swipedMsgId, setSwipedMsgId] = useState(null)

  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)
  const inputRef = useRef(null)
  const emojiRef = useRef(null)
  const touchRef = useRef({ startX: 0, msgId: null })

  useEffect(() => {
    if (user) loadConversations()
  }, [user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
    const handleClick = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

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
    setReplyingTo(null)
    setPendingAttachments([])
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

  const handleTouchStart = (msgId, e) => {
    touchRef.current = { startX: e.touches[0].clientX, msgId }
  }

  const handleTouchMove = (msgId, e) => {
    const el = e.currentTarget
    const deltaX = e.touches[0].clientX - touchRef.current.startX
    if (deltaX < -30) {
      el.style.transform = `translateX(${Math.max(deltaX, -80)}px)`
      el.style.transition = 'none'
    }
  }

  const handleTouchEnd = (msgId, e) => {
    const el = e.currentTarget
    const deltaX = e.touches[0].clientX - touchRef.current.startX
    el.style.transition = 'transform 0.3s ease'
    el.style.transform = 'translateX(0)'
    if (deltaX < -60) {
      setSwipedMsgId(msgId)
      setReplyingTo(messages.find((m) => m.id === msgId))
    }
    touchRef.current = { startX: 0, msgId: null }
  }

  const insertEmoji = (emoji) => {
    setNewMessage((prev) => prev + emoji)
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
          return uploadFile('attachments', path, file)
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

  const handleSend = async () => {
    if ((!newMessage.trim() && pendingAttachments.length === 0) || !activeConv) return
    try {
      const payload = {
        conversation_id: activeConv.id,
        sender_id: user.id,
        sender_email: user.email,
        sender_name: profile?.full_name || user.email,
        body: newMessage,
        is_admin: false,
      }
      if (replyingTo) {
        payload.reply_to = replyingTo.id
      }
      if (pendingAttachments.length > 0) {
        payload.attachments = pendingAttachments
      }
      const msg = await addMessageToConversation(payload)
      setMessages((prev) => [...prev, msg])
      setNewMessage('')
      setReplyingTo(null)
      setPendingAttachments([])
      setSwipedMsgId(null)
    } catch (err) {
      console.error('Failed to send message:', err)
      alert('Failed to send message.')
    }
  }

  const renderMessageContent = (m) => {
    return (
      <>
        {m.reply_to && (
          <div className={`text-[10px] ${!m.is_admin ? 'text-white/60' : 'text-gray-400'} mb-1 truncate flex items-center gap-1`}>
            <HiReply size={10} />
            <span className="truncate">Replied to: {messages.find(msg => msg.id === m.reply_to)?.body || 'a message'}</span>
          </div>
        )}
        <p>{m.body}</p>
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
                    <a href={url} target="_blank" rel="noopener noreferrer" className={`text-xs underline ${!m.is_admin ? 'text-white/80' : 'text-primary'}`}>
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
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <p className="font-semibold text-dark truncate">{activeConv.subject}</p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
                    {messages.map((m) => {
                      const isReplied = swipedMsgId === m.id && replyingTo?.id === m.id
                      return (
                        <div key={m.id} className="relative group">
                          <div
                            className={`flex ${!m.is_admin ? 'justify-end' : 'justify-start'}`}
                            onTouchStart={(e) => handleTouchStart(m.id, e)}
                            onTouchMove={(e) => handleTouchMove(m.id, e)}
                            onTouchEnd={(e) => handleTouchEnd(m.id, e)}
                          >
                            <div
                              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm relative ${
                                !m.is_admin
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-100 text-dark'
                              }`}
                            >
                              {renderMessageContent(m)}
                              <p className={`text-[10px] mt-1 ${!m.is_admin ? 'text-white/70' : 'text-gray-400'}`}>
                                {m.is_admin ? 'Support Team' : m.sender_name}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`absolute top-0 right-0 h-full flex items-center transition-opacity duration-200 ${
                              isReplied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                            style={{ right: !m.is_admin ? '-36px' : 'auto', left: m.is_admin ? '-36px' : 'auto' }}
                          >
                            <button
                              onClick={() => {
                                setReplyingTo(m)
                                setSwipedMsgId(m.id)
                              }}
                              className="p-2 bg-primary text-white rounded-full shadow-md hover:bg-primary-dark transition"
                              title="Reply"
                            >
                              <HiReply size={16} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={bottomRef} />
                  </div>

                  {replyingTo && (
                    <div className="px-4 py-2 bg-primary/5 border-t border-primary/20 flex items-center gap-2 text-sm text-dark">
                      <HiReply size={14} className="text-primary shrink-0" />
                      <span className="truncate flex-1">Replying to: {replyingTo.body}</span>
                      <button
                        onClick={() => { setReplyingTo(null); setSwipedMsgId(null) }}
                        className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                      >
                        ×
                      </button>
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
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                          placeholder="Type a message..."
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm pr-10"
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
                            <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-[280px] z-50">
                              <div className="grid grid-cols-7 gap-1 max-h-[180px] overflow-y-auto">
                                {EMOJIS.map((emoji, i) => (
                                  <button
                                    key={i}
                                    onClick={() => { insertEmoji(emoji); setShowEmojiPicker(false) }}
                                    className="text-lg p-1 hover:bg-gray-100 rounded transition"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={handleSend}
                        disabled={uploading || (!newMessage.trim() && pendingAttachments.length === 0)}
                        className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition disabled:opacity-50"
                      >
                        {uploading ? '...' : 'Send'}
                      </button>
                    </div>
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
}
