/**
 * Keep-alive utility for waking up Render free tier backend
 * Pings backend on app load and navigation to prevent cold starts
 * Render free tier spins down after 15 minutes of inactivity
 * Pinging every 2 minutes ensures server stays warm
 */

import { API_BASE_URL } from './config'

const BACKEND_URL = API_BASE_URL
const HEALTH_ENDPOINT = '/health'

let lastPingTime = 0
const MIN_PING_INTERVAL = 2 * 60 * 1000 // 2 minutes (changed from 5 minutes to prevent Render spindown)

/**
 * Ping the backend health endpoint to keep it awake
 */
async function pingBackend(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    const response = await fetch(`${BACKEND_URL}${HEALTH_ENDPOINT}`, {
      method: 'GET',
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      return true
    } else {
      console.warn('Backend responded with non-OK status:', response.status)
      return false
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Backend ping timed out - server may be waking up')
    } else {
      console.warn('Failed to ping backend:', error)
    }
    return false
  }
}

/**
 * Wake up backend on demand (called on page load/navigation)
 * Includes throttling to prevent excessive requests
 */
export async function wakeUpOnPageLoad(): Promise<void> {
  const now = Date.now()
  const timeSinceLastPing = now - lastPingTime
  
  // Throttle: Skip if we pinged recently (within MIN_PING_INTERVAL)
  if (timeSinceLastPing < MIN_PING_INTERVAL) {
    return
  }
  
  lastPingTime = now
  await pingBackend()
}

/**
 * Manually trigger a backend ping (useful for testing or on-demand wake-up)
 */
export async function wakeUpBackend(): Promise<boolean> {
  return await pingBackend()
}
