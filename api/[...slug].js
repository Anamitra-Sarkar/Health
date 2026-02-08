const path = require('path')

// Import the Express app from backend
const { app } = require(path.join(__dirname, '..', 'backend', 'index.js'))

// Export the Express app for Vercel serverless functions
module.exports = app
