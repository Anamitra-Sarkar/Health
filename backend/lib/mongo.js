const { MongoClient } = require('mongodb')

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB
// console.log('MongoDB URI:', uri ? uri.replace(/\/\/(.*):(.*)@/, '//***:***@') : 'not set');
/**
 * Cached client across hot reloads
 */
let cached = global.__HS_MONGO_CACHED

async function getDb() {
  if (!uri) return null
  if (cached) return cached.db

  try {
    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db(dbName)
    cached = { client, db }
    global.__HS_MONGO_CACHED = cached
    return db
  } catch (err) {
    // If MongoDB connection fails (e.g., DNS issues, network restrictions),
    // return null to allow in-memory fallback
    console.warn('MongoDB connection failed, using in-memory storage:', err.message)
    return null
  }
}

module.exports = getDb
