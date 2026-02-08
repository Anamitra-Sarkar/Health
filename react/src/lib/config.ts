// API base URL - reads from VITE_API_URL env var, falls back to default
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://shop-pil5.onrender.com'

// Socket.IO URL - tries VITE_SOCKET_URL first, then VITE_API_URL, finally default
// This allows using same backend URL for both API and Socket.IO by setting only VITE_API_URL
export const SOCKET_BASE_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'https://shop-pil5.onrender.com'
