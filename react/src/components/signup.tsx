"use client"

import React, { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card } from "./ui/card"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from '../lib/auth'
import { Header } from "./header"
import { Footer } from "./footer"

export function Signup() {
  const navigate = useNavigate()
  // role: 'doctor' or 'organization'
  const [role, setRole] = useState<"doctor" | "organization">("doctor")

  // Doctor fields
  const [doctorName, setDoctorName] = useState("")
  const [license, setLicense] = useState("")
  const [specialty, setSpecialty] = useState("")
  // Selected organization for doctors (mandatory)
  const [selectedOrg, setSelectedOrg] = useState("")
  // Example org options - replace with API-driven list as needed
  const [orgOptions, setOrgOptions] = useState<Array<{ id: string; name: string }>>([])

  // fetch organizations from API
  useEffect(() => {
    let mounted = true
    async function loadOrgs() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/organizations`)
        console.log("organization",res);
        if (!res.ok) return
        const data = await res.json()
        if (mounted && Array.isArray(data.organizations)) setOrgOptions(data.organizations)
      } catch {
        // ignore
      }
    }
    loadOrgs()
    return () => { mounted = false }
  }, [])

  // Organization fields
  const [orgName, setOrgName] = useState("")
  const [adminName, setAdminName] = useState("")

  // Common fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const auth = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Basic validation per role
    if (role === "doctor") {
      if (!doctorName.trim() || !email.trim() || !password.trim()) {
        setError("Please complete your name, email and password.")
        return
      }
      // if (!license.trim()) {
      //   setError("Please enter your medical license number.")
      //   return
      // }
      if (!selectedOrg) {
        setError("Please select your organization from the list.")
        return
      }
    } else {
      if (!orgName.trim() || !adminName.trim() || !email.trim() || !password.trim()) {
        setError("Please complete organization name, admin name, email and password.")
        return
      }
    }

    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      const payload = role === "doctor"
        ? { email, password, role, profile: { name: doctorName, license, specialty, organizationId: selectedOrg } }
        : { email, password, role, profile: { organization: orgName, admin: adminName } }

  await auth.signup(payload)
  navigate('/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="hidden md:block">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-foreground">Create your HealthSync account</h1>
              <p className="text-sm text-muted-foreground">Start a secure, interoperable EMR for your clinic or team. Invite colleagues, configure integrations, and import patient data.</p>
            </div>
          </div>

          <div>
            <Card className="max-w-md md:max-w-lg lg:max-w-xl w-full mx-auto p-6">
      <h2 className="text-2xl font-semibold text-foreground">Get started with HealthSync</h2>

      {/* Role toggle */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setRole("doctor")}
          className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium ${role === "doctor" ? 'bg-primary text-primary-foreground' : 'border border-border bg-background text-foreground'}`}>
          Doctor
        </button>
        <button
          type="button"
          onClick={() => setRole("organization")}
          className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium ${role === "organization" ? 'bg-primary text-primary-foreground' : 'border border-border bg-background text-foreground'}`}>
          Organization
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-destructive">{error}</div>}

        {role === "doctor" ? (
          <>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Full name *</label>
              <Input value={doctorName} onChange={(e) => setDoctorName(e.target.value)} placeholder="Dr. Ak" required />
            </div>

            <div>
              <label className="text-sm text-muted-foreground block mb-1">Medical license number (optional)</label>
              <Input value={license} onChange={(e) => setLicense(e.target.value)} placeholder="License #" />
            </div>

            <div>
              <label className="text-sm text-muted-foreground block mb-1">Organization *</label>
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground"
              >
                <option value="" className="text-base text-foreground bg-background px-3 py-2">Select organization...</option>
                {orgOptions.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground block mb-1">Specialty (optional)</label>
              <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="e.g. Cardiology" />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Organization name</label>
              <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Clinic or Hospital" required />
            </div>

            <div>
              <label className="text-sm text-muted-foreground block mb-1">Admin / primary contact</label>
              <Input value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="Name of admin" required />
            </div>
          </>
        )}

        <div>
          <label className="text-sm text-muted-foreground block mb-1">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@clinic.org" required />
        </div>

        <div>
          <label className="text-sm text-muted-foreground block mb-1">Password</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a password" required />
        </div>

        <div>
          <label className="text-sm text-muted-foreground block mb-1">Confirm password</label>
          <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" required />
        </div>

        <div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? (role === 'doctor' ? 'Creating doctor account…' : 'Creating organization…') : 'Create account'}</Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </div>
      			</form>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

export default Signup
