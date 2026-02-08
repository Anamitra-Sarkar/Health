"use client"

import { Card } from "./ui/card"
import { Star, Send, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { API_BASE_URL } from "../lib/config"
import { useAuth } from "../lib/auth"

type CommunityPost = {
  id: string
  authorName: string
  authorRole: string
  content: string
  rating: number
  createdAt: string
}

export function Community() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [newContent, setNewContent] = useState("")
  const [newRating, setNewRating] = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { user, authFetch } = useAuth()

  // Fetch community posts from MongoDB
  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/community`)
        if (res.ok) {
          const data = await res.json()
          setPosts(data.posts || [])
        }
      } catch (err) {
        console.error('Error fetching community posts:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContent.trim() || !authFetch) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await authFetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent.trim(), rating: newRating })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }

      const post = await res.json()
      setPosts(prev => [post, ...prev])
      setNewContent("")
      setNewRating(5)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit feedback'
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  }

  const displayPosts = posts.length > 0 ? posts : []

  return (
    <section id="community" className="relative py-20 md:py-32 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-green-400 to-teal-400">Trusted by Care Teams</span>
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground/90 max-w-3xl mx-auto text-balance leading-relaxed">
            Hear from clinics and hospitals using HealthSync EMR to improve care coordination and patient outcomes.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div
            className="grid md:grid-cols-3 gap-6 lg:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {displayPosts.slice(0, 6).map((post, index) => (
              <div key={post.id || index}>
                <Card className="p-8 lg:p-10 bg-card/98 backdrop-blur-sm border border-border/60 hover:border-border/80 hover:shadow-2xl hover:shadow-primary/8 transition-all duration-300 rounded-2xl group">
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: post.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-emerald-400 text-emerald-400 group-hover:scale-110 transition-transform duration-300" style={{animationDelay: `${i * 100}ms`}} />
                    ))}
                  </div>
                  <p className="text-muted-foreground/90 mb-8 leading-relaxed text-lg font-medium">"{post.content}"</p>
                  <div className="border-t border-border/40 pt-6">
                    <p className="font-bold text-foreground text-lg">{post.authorName}</p>
                    <p className="text-sm text-primary font-semibold">{post.authorRole}</p>
                  </div>
                </Card>
              </div>
            ))}
          </motion.div>
        )}

        {/* Submit Feedback Form - only for logged-in users */}
        {user && (
          <motion.div
            className="mt-16 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6 lg:p-8 bg-card/98 backdrop-blur-sm border border-border/60 rounded-2xl">
              <h3 className="text-xl font-bold text-foreground mb-4">Share Your Experience</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Tell us how HealthSync has helped your practice..."
                    className="w-full min-h-[100px] p-3 rounded-xl border border-border/60 bg-background/80 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/25 resize-none"
                    maxLength={500}
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-5 h-5 ${star <= newRating ? 'fill-emerald-400 text-emerald-400' : 'text-muted-foreground/30'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !newContent.trim()}
                    className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Submit
                  </button>
                </div>
                {submitError && (
                  <p className="text-sm text-destructive">{submitError}</p>
                )}
              </form>
            </Card>
          </motion.div>
        )}
      </div>
    </section>
  )
}
