"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card } from "../ui/card"
import { Send, Bot, User, Loader2, MessageSquarePlus, Trash2, History } from "lucide-react"

type Message = {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type ChatSession = {
  id: string
  title: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content: 'Hello! I\'m HealthSync AI Assistant. I can help you with medical information, ICD-11 codes, disease information, treatment protocols, and clinical queries. How can I assist you today?',
  timestamp: new Date()
}

export default function Chatbot() {
  const { authFetch } = useAuth()
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load chat sessions on mount
  useEffect(() => {
    loadChatSessions()
  }, [])

  async function loadChatSessions() {
    try {
      setLoadingHistory(true)
      const res = await authFetch('/api/chats')
      if (res.ok) {
        const data = await res.json()
        setChatSessions(data.chats || [])
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  async function loadChat(chatId: string) {
    try {
      const res = await authFetch(`/api/chats/${chatId}`)
      if (res.ok) {
        const data = await res.json()
        const loadedMessages = (data.messages || []).map((m: { role: string; content: string; timestamp: string }) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
        setMessages(loadedMessages.length > 0 ? loadedMessages : [WELCOME_MESSAGE])
        setCurrentChatId(chatId)
        setShowHistory(false)
      }
    } catch (err) {
      console.error('Failed to load chat:', err)
    }
  }

  async function saveCurrentChat(updatedMessages: Message[]) {
    try {
      // Generate title from first user message
      const firstUserMsg = updatedMessages.find(m => m.role === 'user')
      const title = firstUserMsg
        ? firstUserMsg.content.slice(0, 60) + (firstUserMsg.content.length > 60 ? '...' : '')
        : 'New Chat'

      const messagesToSave = updatedMessages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp
      }))

      if (currentChatId) {
        // Update existing chat
        await authFetch(`/api/chats/${currentChatId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, messages: messagesToSave })
        })
      } else {
        // Create new chat
        const res = await authFetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, messages: messagesToSave })
        })
        if (res.ok) {
          const data = await res.json()
          setCurrentChatId(data.id)
        }
      }
      // Refresh chat list
      loadChatSessions()
    } catch (err) {
      console.error('Failed to save chat:', err)
    }
  }

  async function deleteChat(chatId: string) {
    try {
      const res = await authFetch(`/api/chats/${chatId}`, { method: 'DELETE' })
      if (res.ok) {
        setChatSessions(prev => prev.filter(c => c.id !== chatId))
        if (currentChatId === chatId) {
          startNewChat()
        }
      }
    } catch (err) {
      console.error('Failed to delete chat:', err)
    }
  }

  function startNewChat() {
    setMessages([WELCOME_MESSAGE])
    setCurrentChatId(null)
    setShowHistory(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const userMessage = input.trim()
    if (!userMessage || loading) return

    // Add user message to chat
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }
    
    const updatedMessages = [...messages, newUserMessage]
    setMessages(updatedMessages)
    setInput("")
    setLoading(true)

    try {
      // Build conversation history (last 10 messages for context)
      const history = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const res = await authFetch('/api/groq/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: history
        })
      })

      if (!res.ok) {
        throw new Error('Failed to get response')
      }

      const data = await res.json()
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message || 'I apologize, but I could not generate a response.',
        timestamp: new Date()
      }

      const allMessages = [...updatedMessages, assistantMessage]
      setMessages(allMessages)

      // Save to database after each exchange
      await saveCurrentChat(allMessages)
    } catch (err) {
      console.error('Chat error:', err)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      }
      const allMessages = [...updatedMessages, errorMessage]
      setMessages(allMessages)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center animate-glow-pulse">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">AI Medical Assistant</h2>
              <p className="text-sm text-muted-foreground">Powered by HealthSync AI <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-heartbeat ml-1"></span></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowHistory(!showHistory)}
              title="Chat History"
            >
              <History className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={startNewChat}
              title="New Chat"
            >
              <MessageSquarePlus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat History Sidebar */}
      {showHistory && (
        <div className="border-b border-border/50 bg-card/80 backdrop-blur-xl p-4 max-h-60 overflow-y-auto">
          <h3 className="text-sm font-semibold text-foreground mb-3">Chat History</h3>
          {loadingHistory ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </div>
          ) : chatSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No previous chats found.</p>
          ) : (
            <div className="space-y-2">
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    currentChatId === session.id
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <button
                    className="flex-1 text-left"
                    onClick={() => loadChat(session.id)}
                  >
                    <p className="text-sm font-medium text-foreground truncate">{session.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.updatedAt).toLocaleDateString()} · {(session.messages || []).length} messages
                    </p>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={(e) => { e.stopPropagation(); deleteChat(session.id) }}
                    title="Delete chat"
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-primary" />
              </div>
            )}
            
            <Card className={`max-w-[80%] p-3 ${
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-card'
            }`}>
              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
              <span className={`text-xs mt-1 block ${
                msg.role === 'user' 
                  ? 'text-primary-foreground/70' 
                  : 'text-muted-foreground'
              }`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </Card>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <Card className="bg-card p-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/50 bg-card/50 backdrop-blur-xl p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a medical question..."
            disabled={loading}
            className="flex-1"
            autoFocus
          />
          <Button
            type="submit"
            disabled={!input.trim() || loading}
            size="icon"
            className="flex-shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          AI responses are for informational purposes and should not replace clinical judgment. Your chat history is saved securely.
        </p>
      </div>
    </div>
  )
}
