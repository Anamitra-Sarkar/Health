const { MongoClient } = require('mongodb')

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB
// console.log('MongoDB URI:', uri ? uri.replace(/\/\/(.*):(.*)@/, '//***:***@') : 'not set');
/**
 * Cached client across hot reloads
 * cached can be: { client, db } on success, or 'failed' to skip retries
 */
let cached = global.__HS_MONGO_CACHED

async function getDb() {
  if (!uri) return null
  if (cached === 'failed') return null
  if (cached) return cached.db

  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      tls: true,
      tlsMinVersion: 'TLSv1.2',
      retryWrites: true,
    })
    await client.connect()
    const db = client.db(dbName)
    cached = { client, db }
    global.__HS_MONGO_CACHED = cached
    console.log('MongoDB connected successfully')
    return db
  } catch (err) {
    // If MongoDB connection fails (e.g., TLS/IP whitelist, DNS, network),
    // cache the failure so we don't retry on every request and hang
    console.warn('MongoDB connection failed, using in-memory storage:', err.message)
    cached = 'failed'
    global.__HS_MONGO_CACHED = cached
    return null
  }
}

module.exports = getDb
