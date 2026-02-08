const express = require('express')
const router = express.Router()
const getDb = require('../lib/mongo')
const { ObjectId } = require('mongodb')
const rateLimit = require('express-rate-limit')

// Rate limiter for chat endpoints
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
})

router.use(chatLimiter)

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) return res.status(401).json({ error: 'No token provided' })
  
  const jwt = require('jsonwebtoken')
  const JWT_SECRET = process.env.JWT_SECRET
  
  if (!JWT_SECRET) {
    console.error('JWT_SECRET not configured')
    return res.status(500).json({ error: 'Server configuration error' })
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' })
    req.user = user
    next()
  })
}

// GET /api/chats - Get all chat sessions for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDb()
    if (!db) {
      return res.status(500).json({ error: 'Database not available' })
    }

    const userId = req.user.id || req.user.email

    const chats = await db.collection('chat_sessions')
      .find({ userId })
      .sort({ updatedAt: -1 })
      .limit(50)
      .toArray()

    const formatted = chats.map(c => ({
      id: String(c._id),
      title: c.title || 'Untitled Chat',
      messages: c.messages || [],
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }))

    res.json({ chats: formatted })
  } catch (err) {
    console.error('Error fetching chats:', err)
    res.status(500).json({ error: 'Failed to fetch chats' })
  }
})

// GET /api/chats/:id - Get a specific chat session
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDb()
    if (!db) {
      return res.status(500).json({ error: 'Database not available' })
    }

    const userId = req.user.id || req.user.email
    const chatId = req.params.id

    let filter
    try {
      filter = { _id: new ObjectId(chatId), userId }
    } catch (e) {
      return res.status(400).json({ error: 'Invalid chat ID' })
    }

    const chat = await db.collection('chat_sessions').findOne(filter)
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' })
    }

    res.json({
      id: String(chat._id),
      title: chat.title || 'Untitled Chat',
      messages: chat.messages || [],
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    })
  } catch (err) {
    console.error('Error fetching chat:', err)
    res.status(500).json({ error: 'Failed to fetch chat' })
  }
})

// POST /api/chats - Create a new chat session
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDb()
    if (!db) {
      return res.status(500).json({ error: 'Database not available' })
    }

    const userId = req.user.id || req.user.email
    const { title, messages } = req.body

    const chat = {
      userId,
      title: title || 'New Chat',
      messages: messages || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('chat_sessions').insertOne(chat)

    res.status(201).json({
      id: String(result.insertedId),
      ...chat
    })
  } catch (err) {
    console.error('Error creating chat:', err)
    res.status(500).json({ error: 'Failed to create chat' })
  }
})

// PUT /api/chats/:id - Update a chat session (add messages)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDb()
    if (!db) {
      return res.status(500).json({ error: 'Database not available' })
    }

    const userId = req.user.id || req.user.email
    const chatId = req.params.id
    const { title, messages } = req.body

    let filter
    try {
      filter = { _id: new ObjectId(chatId), userId }
    } catch (e) {
      return res.status(400).json({ error: 'Invalid chat ID' })
    }

    const updateFields = { updatedAt: new Date() }
    if (title !== undefined) updateFields.title = title
    if (messages !== undefined) updateFields.messages = messages

    const result = await db.collection('chat_sessions').updateOne(
      filter,
      { $set: updateFields }
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Chat not found' })
    }

    res.json({ success: true })
  } catch (err) {
    console.error('Error updating chat:', err)
    res.status(500).json({ error: 'Failed to update chat' })
  }
})

// DELETE /api/chats/:id - Delete a chat session
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDb()
    if (!db) {
      return res.status(500).json({ error: 'Database not available' })
    }

    const userId = req.user.id || req.user.email
    const chatId = req.params.id

    let filter
    try {
      filter = { _id: new ObjectId(chatId), userId }
    } catch (e) {
      return res.status(400).json({ error: 'Invalid chat ID' })
    }

    const result = await db.collection('chat_sessions').deleteOne(filter)

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Chat not found' })
    }

    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting chat:', err)
    res.status(500).json({ error: 'Failed to delete chat' })
  }
})

module.exports = router
