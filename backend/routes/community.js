const express = require('express')
const router = express.Router()
const getDb = require('../lib/mongo')
const { ObjectId } = require('mongodb')

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

// Optional auth - sets req.user if token is present, but doesn't require it
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) return next()
  
  const jwt = require('jsonwebtoken')
  const JWT_SECRET = process.env.JWT_SECRET
  
  if (!JWT_SECRET) return next()
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err) req.user = user
    next()
  })
}

// Seed default testimonials if collection is empty
async function seedCommunityPosts(db) {
  const count = await db.collection('community_posts').countDocuments()
  if (count === 0) {
    const defaultPosts = [
      {
        authorName: 'Sarah M.',
        authorRole: 'Clinic Administrator',
        content: 'HealthSync EMR helped our clinic reduce documentation time and improve patient handoffs.',
        rating: 5,
        createdAt: new Date('2025-01-15'),
        approved: true
      },
      {
        authorName: 'James T.',
        authorRole: 'Physician',
        content: 'Integrations with labs and imaging streamlined our workflow and reduced turnaround.',
        rating: 5,
        createdAt: new Date('2025-02-01'),
        approved: true
      },
      {
        authorName: 'Emma L.',
        authorRole: 'Nurse Manager',
        content: 'Secure, easy-to-use EMR that supports our clinical workflows.',
        rating: 5,
        createdAt: new Date('2025-02-10'),
        approved: true
      }
    ]
    await db.collection('community_posts').insertMany(defaultPosts)
    console.log('Seeded community_posts with default testimonials')
  }
}

// GET /api/community - Get all approved community posts (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const db = await getDb()
    if (!db) {
      return res.status(500).json({ error: 'Database not available' })
    }

    await seedCommunityPosts(db)

    const posts = await db.collection('community_posts')
      .find({ approved: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    const formatted = posts.map(p => ({
      id: String(p._id),
      authorName: p.authorName,
      authorRole: p.authorRole,
      content: p.content,
      rating: p.rating,
      createdAt: p.createdAt
    }))

    res.json({ posts: formatted })
  } catch (err) {
    console.error('Error fetching community posts:', err)
    res.status(500).json({ error: 'Failed to fetch community posts' })
  }
})

// POST /api/community - Create a new community post (authenticated)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDb()
    if (!db) {
      return res.status(500).json({ error: 'Database not available' })
    }

    const { content, rating } = req.body
    
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' })
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' })
    }

    // Get user info for the post
    const usersCollection = db.collection('users')
    const user = await usersCollection.findOne({ 
      $or: [
        { _id: new ObjectId(req.user.id) },
        { email: req.user.email }
      ]
    })

    let authorName = 'Anonymous'
    let authorRole = 'Healthcare Professional'

    if (user) {
      if (user.role === 'doctor') {
        authorName = user.profile?.name || user.email?.split('@')[0] || 'Anonymous'
        authorRole = 'Physician'
      } else if (user.role === 'organization') {
        authorName = user.profile?.admin || user.profile?.organization || 'Anonymous'
        authorRole = 'Organization Admin'
      }
    }

    const post = {
      authorName,
      authorRole,
      content: content.trim(),
      rating: rating || 5,
      userId: req.user.id,
      createdAt: new Date(),
      approved: true
    }

    const result = await db.collection('community_posts').insertOne(post)
    
    res.json({
      id: String(result.insertedId),
      ...post
    })
  } catch (err) {
    console.error('Error creating community post:', err)
    res.status(500).json({ error: 'Failed to create community post' })
  }
})

// DELETE /api/community/:id - Delete own post (authenticated)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDb()
    if (!db) {
      return res.status(500).json({ error: 'Database not available' })
    }

    const postId = req.params.id
    let filter
    try {
      filter = { _id: new ObjectId(postId), userId: req.user.id }
    } catch (e) {
      return res.status(400).json({ error: 'Invalid post ID' })
    }

    const result = await db.collection('community_posts').deleteOne(filter)

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Post not found or not authorized' })
    }

    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting community post:', err)
    res.status(500).json({ error: 'Failed to delete community post' })
  }
})

module.exports = router
