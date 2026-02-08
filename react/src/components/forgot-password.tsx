"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card } from "./ui/card"
import { Link, useNavigate } from "react-router-dom"
import { Header } from "./header"
import { Footer } from "./footer"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"
import { useAuth } from "../lib/auth"

export function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'email' | 'success'>('email')
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const auth = useAuth()

  async function handleSendResetEmail(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await auth.resetPassword(email.trim())
      setStep('success')
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string }
      if (firebaseError.code === 'auth/user-not-found') {
        // Don't reveal whether the email exists for security
        setStep('success')
      } else if (firebaseError.code === 'auth/invalid-email') {
        setError('Please enter a valid email address')
      } else if (firebaseError.code === 'auth/too-many-requests') {
        setError('Too many requests. Please try again later.')
      } else {
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg || 'Failed to send reset email')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <Card className="p-8 backdrop-blur-xl bg-card/80 border-border/50 shadow-2xl">
          {/* Back to Login */}
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          {/* Step 1: Enter Email */}
          {step === 'email' && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Forgot Password?</h1>
                <p className="text-muted-foreground mt-2">
                  Enter your email and we'll send you a link to reset your password via Firebase
                </p>
              </div>

              <form onSubmit={handleSendResetEmail} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/50 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            </>
          )}

          {/* Step 2: Success */}
          {step === 'success' && (
            <>
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h1>
                <p className="text-muted-foreground mb-6">
                  If an account exists for <strong>{email}</strong>, a password reset link has been sent. Please check your inbox and spam folder.
                </p>
                <Button 
                  onClick={() => navigate('/login')} 
                  className="w-full"
                >
                  Go to Login
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>

      <Footer />
    </main>
  )
}

export default ForgotPassword
