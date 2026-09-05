import { useEffect, useState, useRef, useCallback } from 'react'
import {
  MessageSquare,
  Search,
  Send,
  Plus,
  Users,
  X,
  Check,
  CheckCheck,
  ArrowLeft,
  MoreVertical,
  Trash2,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { get, post, del } from '../lib/api'
import { timeAgo } from '../lib/format'

interface Conversation {
  id: string
  title: string
  isGroup: boolean
  lastMessage: string | null
  lastMessageAt: string | null
  unreadCount: number
  members: { userId: string; fullName: string; roleName: string }[]
  createdAt: string
}

interface Message {
  id: string
  senderId: string
  senderName: string
  senderRole: string
  content: string
  messageType: string
  isEdited: boolean
  isDeleted: boolean
  createdAt: string
}

interface User {
  id: string
  full_name: string
  role_name: string
  employee_code: string
}

export default function Chat() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [groupName, setGroupName] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [isMobileView, setIsMobileView] = useState(false)

  // Check mobile view
  useEffect(() => {
    const check = () => setIsMobileView(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const data = await get<{ data: Conversation[] }>('/api/chat')
      setConversations(data.data)
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => { void loadConversations() }, [loadConversations])

  // Poll conversations every 15 seconds
  useEffect(() => {
    const id = setInterval(() => void loadConversations(), 15000)
    return () => clearInterval(id)
  }, [loadConversations])

  // Load messages for active conversation
  const loadMessages = useCallback(async (convId: string) => {
    try {
      const data = await get<{ data: Message[] }>(`/api/chat/${convId}/messages`)
      setMessages(data.data)
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    if (activeConvId) void loadMessages(activeConvId)
  }, [activeConvId, loadMessages])

  // Poll messages every 5 seconds for active conversation
  useEffect(() => {
    if (!activeConvId) return
    const id = setInterval(() => void loadMessages(activeConvId), 5000)
    return () => clearInterval(id)
  }, [activeConvId, loadMessages])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim() || !activeConvId || sending) return
    const content = newMessage.trim()
    setNewMessage('')
    setSending(true)

    try {
      const data = await post<{ data: Message }>(`/api/chat/${activeConvId}/messages`, { content })
      setMessages(prev => [...prev, data.data])
      void loadConversations()
    } catch {
      setNewMessage(content)
    }
    setSending(false)
    inputRef.current?.focus()
  }

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  // Start new chat
  const startNewChat = async () => {
    if (selectedUsers.length === 0) return
    const isGroup = selectedUsers.length > 1
    try {
      const data = await post<{ data: { id: string } }>('/api/chat', {
        title: isGroup ? (groupName || 'Group Chat') : undefined,
        isGroup,
        memberIds: selectedUsers,
      })
      setActiveConvId(data.data.id)
      setShowNewChat(false)
      setSelectedUsers([])
      setGroupName('')
      void loadConversations()
    } catch { /* silent */ }
  }

  // Load users for new chat
  const loadUsers = async () => {
    try {
      const data = await get<{ data: User[] }>('/api/chat/users')
      setAllUsers(data.data.filter(u => u.id !== user?.id))
    } catch { /* silent */ }
  }

  useEffect(() => {
    if (showNewChat) void loadUsers()
  }, [showNewChat])

  // Delete message
  const deleteMessage = async (messageId: string) => {
    if (!activeConvId) return
    try {
      await del(`/api/chat/${activeConvId}/messages/${messageId}`)
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeleted: true, content: 'This message was deleted' } : m))
    } catch { /* silent */ }
  }

  // Leave conversation
  const leaveConversation = async (convId: string) => {
    try {
      await post(`/api/chat/${convId}/leave`)
      setConversations(prev => prev.filter(c => c.id !== convId))
      if (activeConvId === convId) setActiveConvId(null)
    } catch { /* silent */ }
  }

  // Get conversation display name
  const getConvTitle = (conv: Conversation) => {
    if (conv.isGroup) return conv.title
    const other = conv.members.find(m => m.userId !== user?.id)
    return other?.fullName || 'Unknown'
  }

  // Get initials
  const getInitials = (name: string) => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  // Filter conversations
  const filteredConversations = conversations.filter(c =>
    getConvTitle(c).toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeConv = conversations.find(c => c.id === activeConvId)

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl border border-border overflow-hidden">

      {/* ── Sidebar: Conversation List ─────────────────────── */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-white ${activeConvId && isMobileView ? 'hidden' : 'flex'}`}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-text">Messages</h2>
            <span className="px-1.5 py-0.5 rounded-full bg-primary-light text-primary-deep text-[10px] font-bold">
              {conversations.length}
            </span>
          </div>
          <button
            onClick={() => setShowNewChat(true)}
            className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors"
            title="New chat"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-border-light">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input pl-8 py-2 text-xs"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-xs text-text-muted">Loading...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-text-muted">
                {searchQuery ? 'No conversations found' : 'No conversations yet. Start a new chat!'}
              </p>
            </div>
          ) : (
            filteredConversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConvId(conv.id)
                  void loadMessages(conv.id)
                }}
                className={`w-full text-left px-4 py-3 border-b border-border-light hover:bg-primary-faint transition-colors flex gap-3 ${
                  activeConvId === conv.id ? 'bg-primary-faint border-l-2 border-l-primary' : ''
                }`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  conv.isGroup
                    ? 'bg-gradient-to-br from-violet-400 to-purple-600 text-white'
                    : 'bg-gradient-to-br from-sky-400 to-blue-600 text-white'
                }`}>
                  {conv.isGroup ? <Users className="w-4 h-4" /> : getInitials(getConvTitle(conv))}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-text truncate">{getConvTitle(conv)}</span>
                    {conv.lastMessageAt && (
                      <span className="text-[10px] text-text-muted shrink-0">{timeAgo(conv.lastMessageAt)}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="text-[11px] text-text-muted truncate">
                      {conv.lastMessage || 'No messages yet'}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-primary text-white text-[9px] font-bold shrink-0">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                  {conv.isGroup && (
                    <span className="text-[10px] text-text-muted mt-0.5 block">
                      {conv.members.length} members
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Main: Chat Area ───────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-w-0 ${!activeConvId && isMobileView ? 'hidden' : 'flex'}`}>
        {!activeConvId ? (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-faint flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-text mb-1">Select a conversation</h3>
              <p className="text-xs text-text-muted">Choose from existing chats or start a new one</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-white">
              {isMobileView && (
                <button
                  onClick={() => setActiveConvId(null)}
                  className="w-8 h-8 rounded-lg hover:bg-primary-faint flex items-center justify-center text-text-secondary"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                activeConv?.isGroup
                  ? 'bg-gradient-to-br from-violet-400 to-purple-600 text-white'
                  : 'bg-gradient-to-br from-sky-400 to-blue-600 text-white'
              }`}>
                {activeConv?.isGroup ? <Users className="w-4 h-4" /> : getInitials(getConvTitle(activeConv!))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-text truncate">{getConvTitle(activeConv!)}</p>
                <p className="text-[10px] text-text-muted">
                  {activeConv?.isGroup
                    ? `${activeConv.members.length} members`
                    : activeConv?.members.find(m => m.userId !== user?.id)?.roleName || ''}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {activeConv?.isGroup && (
                  <button
                    onClick={() => setShowMembers(!showMembers)}
                    className="w-8 h-8 rounded-lg hover:bg-primary-faint flex items-center justify-center text-text-secondary"
                    title="Members"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => { if (activeConvId && confirm('Leave this conversation?')) void leaveConversation(activeConvId) }}
                  className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-text-secondary hover:text-danger"
                  title="Leave conversation"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Members panel */}
            {showMembers && activeConv && (
              <div className="px-4 py-3 border-b border-border bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-text">Members ({activeConv.members.length})</span>
                  <button onClick={() => setShowMembers(false)} className="text-text-muted hover:text-text">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeConv.members.map(m => (
                    <span key={m.userId} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-border text-[11px] font-medium text-text">
                      <span className="w-5 h-5 rounded-full bg-primary-light text-primary-deep text-[9px] font-bold flex items-center justify-center">
                        {getInitials(m.fullName)}
                      </span>
                      {m.fullName}
                      <span className="text-text-muted text-[9px]">({m.roleName})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/50">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-text-muted">No messages yet. Start the conversation!</p>
                </div>
              )}

              {messages.map((msg, i) => {
                const isMe = msg.senderId === user?.id
                const showSender = i === 0 || messages[i - 1].senderId !== msg.senderId
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] ${isMe ? 'order-1' : 'order-2'}`}>
                      {/* Sender name (for group chats or different sender) */}
                      {!isMe && showSender && activeConv?.isGroup && (
                        <p className="text-[10px] font-semibold text-primary mb-0.5 ml-1">
                          {msg.senderName}
                          <span className="text-text-muted font-normal ml-1">{msg.senderRole}</span>
                        </p>
                      )}

                      {/* Message bubble */}
                      <div className={`relative group px-3 py-2 rounded-xl text-xs leading-relaxed ${
                        msg.isDeleted
                          ? 'bg-slate-100 text-text-muted italic'
                          : isMe
                            ? 'bg-primary text-white rounded-br-sm'
                            : 'bg-white border border-border text-text rounded-bl-sm'
                      }`}>
                        {msg.isDeleted ? (
                          <span className="italic">{msg.content}</span>
                        ) : (
                          <span className="whitespace-pre-wrap break-words">{msg.content}</span>
                        )}

                        {/* Time & status */}
                        <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span className={`text-[9px] ${isMe ? 'text-white/60' : 'text-text-muted'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                          {isMe && !msg.isDeleted && (
                            <CheckCheck className="w-3 h-3 text-white/60" />
                          )}
                          {msg.isEdited && !msg.isDeleted && (
                            <span className={`text-[9px] ${isMe ? 'text-white/60' : 'text-text-muted'}`}>(edited)</span>
                          )}
                        </div>

                        {/* Delete button (own messages) */}
                        {isMe && !msg.isDeleted && (
                          <button
                            onClick={() => { if (confirm('Delete this message?')) void deleteMessage(msg.id) }}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-border shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-danger hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border bg-white">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  rows={1}
                  className="input resize-none py-2 flex-1 text-xs"
                  style={{ minHeight: '36px', maxHeight: '120px' }}
                />
                <button
                  onClick={() => void handleSend()}
                  disabled={!newMessage.trim() || sending}
                  className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── New Chat Modal ────────────────────────────────── */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-bold text-text">New Conversation</h3>
              <button onClick={() => { setShowNewChat(false); setSelectedUsers([]); setGroupName('') }} className="text-text-muted hover:text-text">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Group name (if multiple selected) */}
            {selectedUsers.length > 1 && (
              <div className="px-4 py-2 border-b border-border-light">
                <input
                  type="text"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  placeholder="Group name (optional)"
                  className="input text-xs py-2"
                />
              </div>
            )}

            {/* User list */}
            <div className="flex-1 overflow-y-auto">
              {allUsers.length === 0 ? (
                <div className="p-8 text-center text-xs text-text-muted">Loading users...</div>
              ) : (
                allUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setSelectedUsers(prev =>
                        prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id]
                      )
                    }}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-primary-faint transition-colors border-b border-border-light ${
                      selectedUsers.includes(u.id) ? 'bg-primary-faint' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {getInitials(u.full_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-text">{u.full_name}</p>
                      <p className="text-[10px] text-text-muted">{u.role_name} · {u.employee_code}</p>
                    </div>
                    {selectedUsers.includes(u.id) && (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-text-muted">
                {selectedUsers.length > 0
                  ? `${selectedUsers.length} selected${selectedUsers.length > 1 ? ` · Group: ${groupName || 'Group Chat'}` : ''}`
                  : 'Select users to start chatting'}
              </span>
              <button
                onClick={() => void startNewChat()}
                disabled={selectedUsers.length === 0}
                className="btn btn-primary btn-sm text-xs disabled:opacity-50"
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
