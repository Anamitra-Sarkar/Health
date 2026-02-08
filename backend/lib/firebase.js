const admin = require('firebase-admin')

let firebaseApp = null

function getFirebaseAdmin() {
  if (firebaseApp) return firebaseApp

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('Firebase Admin SDK credentials not configured. Firebase features disabled.')
    return null
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n')
      })
    })
    console.log('Firebase Admin SDK initialized successfully')
    return firebaseApp
  } catch (err) {
    console.error('Firebase Admin SDK initialization failed:', err.message)
    return null
  }
}

function getFirebaseAuth() {
  const app = getFirebaseAdmin()
  if (!app) return null
  return admin.auth(app)
}

module.exports = { getFirebaseAdmin, getFirebaseAuth }
