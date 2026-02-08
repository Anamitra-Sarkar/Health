"use client"

import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card } from "./ui/card"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../lib/auth"
import { Header } from "./header"
import { Footer } from "./footer"
import DarkVeil from './reactBit'

export function Login() {
 const navigate = useNavigate()
const [email, setEmail] = useState("")
const [password, setPassword] = useState("")
const [remember, setRemember] = useState(false)
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const auth = useAuth()
const [googleLoading, setGoogleLoading] = useState(false)
const [isDark, setIsDark] = useState<boolean>(false);

  // Monitor theme changes
  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    // Check initial theme
    checkTheme();

    // Watch for theme changes using MutationObserver
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

async function handleGoogleLogin() {
if (!auth.loginWithGoogle) return
setGoogleLoading(true)
setError(null)
try {
await auth.loginWithGoogle(remember)
navigate('/dashboard')
} catch (err: unknown) {
const msg = err instanceof Error ? err.message : String(err)
setError(msg || 'Google sign-in failed')
} finally {
setGoogleLoading(false)
}
}

async function handleSubmit(e: React.FormEvent) {
e.preventDefault()
setError(null)
if (!email.trim() || !password.trim()) {
setError("Please provide both email and password.")
return
}
setLoading(true)

try {
await auth.login(email.trim(), password, remember)
navigate('/dashboard')
} catch (err: unknown) {
const msg = err instanceof Error ? err.message : String(err)
setError(msg || 'Sign in failed')
} finally {
setLoading(false)
}
}

return (
<main className="min-h-screen bg-background relative">
{isDark && (
<DarkVeil hueShift={120} noiseIntensity={0.015} scanlineIntensity={0.01} speed={0.25} warpAmount={0.015} />
  )}
<div className="relative z-10">

<Header />

<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
<div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
<div className="hidden md:block">
{/* Enhanced marketing section */}
<div className="space-y-8 pr-8">
<div>
<h1 className="text-4xl lg:text-5xl font-extrabold text-foreground leading-tight">
<span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-400">Welcome back</span>
<span className="block text-2xl lg:text-3xl font-medium text-muted-foreground mt-2">to HealthSync</span>
</h1>
<p className="text-lg text-muted-foreground mt-4 leading-relaxed">Secure access to clinical workflows, patient records, and interoperability tools built for modern healthcare teams.</p>
</div>

<div className="grid gap-4">
<div className="flex items-start gap-3">
<div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1 animate-heartbeat">
<div className="w-2 h-2 rounded-full bg-primary"></div>
</div>
<div>
<h3 className="font-semibold text-foreground">HIPAA-Compliant Security</h3>
<p className="text-sm text-muted-foreground">Enterprise-grade access controls and audit trails</p>
</div>
</div>
<div className="flex items-start gap-3">
<div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1 animate-heartbeat" style={{animationDelay: '0.3s'}}>
<div className="w-2 h-2 rounded-full bg-primary"></div>
</div>
<div>
<h3 className="font-semibold text-foreground">FHIR Interoperability</h3>
<p className="text-sm text-muted-foreground">Seamless integrations with existing systems</p>
</div>
</div>
<div className="flex items-start gap-3">
<div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1 animate-heartbeat" style={{animationDelay: '0.6s'}}>
<div className="w-2 h-2 rounded-full bg-primary"></div>
</div>
<div>
<h3 className="font-semibold text-foreground">Unified Clinical Data</h3>
<p className="text-sm text-muted-foreground">Centralized patient records and workflows</p>
</div>
</div>
</div>
</div>
</div>

<div>
<Card className="max-w-md md:max-w-lg w-full mx-auto p-8 md:p-10 rounded-2xl shadow-2xl backdrop-blur-sm bg-card/98 border border-primary/20 shadow-primary/10 animate-fade-in-scale">
<div className="text-center mb-8">
<h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Welcome back</h2>
<p className="text-muted-foreground/80">Sign in to continue to HealthSync EMR</p>
</div><form onSubmit={handleSubmit} className="space-y-6">
{error && <div className="text-sm text-destructive bg-destructive/15 p-3 rounded-md border border-destructive/30 font-medium">{error}</div>}

<div className="space-y-2">
<label className="text-sm font-medium text-foreground block">Email</label>
<Input
type="email"
placeholder="you@clinic.org"
value={email}
onChange={(e) => setEmail(e.target.value)}
className="h-12 rounded-lg border-border/80 bg-background/80 focus:border-primary/60 focus:ring-2 focus:ring-primary/25 transition-all shadow-sm"
required
/>
</div>

<div className="space-y-2">
<div className="flex items-center justify-between">
<label className="text-sm font-medium text-foreground">Password</label>
<Link to="/forgot-password" className="text-sm text-primary underline-offset-2 hover:underline font-medium">
Forgot password?
</Link>
</div>
<Input
type="password"
placeholder="••••••••"
value={password}
onChange={(e) => setPassword(e.target.value)}
className="h-12 rounded-lg border-border/80 bg-background/80 focus:border-primary/60 focus:ring-2 focus:ring-primary/25 transition-all shadow-sm"
required
/>
</div>

<div className="flex items-center justify-between">
<label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
<input
type="checkbox"
checked={remember}
onChange={(e) => setRemember(e.target.checked)}
className="w-4 h-4 rounded border border-input bg-background"
/>
Remember me
</label>
</div>

<div className="space-y-3">
<Button type="submit" size="lg" className="w-full h-12 rounded-lg shadow-lg bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 transition-all duration-300 font-semibold" disabled={loading}>
{loading ? "Signing in…" : "Sign in"}
</Button>
<p className="text-xs text-muted-foreground text-center">By continuing you agree to our <a href="#" className="text-primary hover:underline font-medium">Terms</a> and <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>.</p>
</div>

<div className="space-y-4">
<div className="flex items-center">
<span className="flex-grow border-t border-border/60" />
<span className="px-4 text-xs text-muted-foreground font-medium">Or continue with</span>
<span className="flex-grow border-t border-border/60" />
</div>

<div className="text-center flex flex-col items-center space-y-2">
<Button
type="button"
variant="outline"
className="w-full h-12 rounded-lg shadow-sm font-medium"
onClick={handleGoogleLogin}
disabled={googleLoading}
>
{googleLoading ? (
'Signing in with Google…'
) : (
<>
<svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
</svg>
Sign in with Google
</>
)}
</Button>
</div>
</div>

<div className="text-center text-sm text-muted-foreground pt-4 border-t border-border/30">
New to HealthSync?{' '}
<Link to="/signup" className="text-primary hover:underline font-semibold">
Create an account
</Link>
</div>
</form>
</Card>
</div>
</div>
</div>

<Footer />
</div>
</main>
)
}

export default Login
