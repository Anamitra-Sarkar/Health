"use client"

import { Button } from "./ui/button"
import ThemeToggle from './theme-toggle'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from "../lib/auth"

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } })
    } else {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <header className="sticky opacity-90 top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <img src="/logo-red.png" alt="HealthSync Logo" className="w-8 h-8 animate-float" />
          <Link to="/">
          <span className="text-xl font-semibold text-foreground">HealthSync</span>
          </Link>
        </div> 

        <nav className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollToSection('features')} className="text-sm text-muted-foreground hover:text-foreground transition">
            Features
          </button>
          <button onClick={() => scrollToSection('community')} className="text-sm text-muted-foreground hover:text-foreground transition">
            Community
          </button>
          <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-24 h-8 bg-muted/20 rounded animate-pulse" />
              <ThemeToggle />
            </div>
          ) : user ? (
            <>
              <Link to="/dashboard">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Go to dashboard</Button>
              </Link>
              <ThemeToggle />
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-sm hidden md:block">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
              </Link>
              <ThemeToggle />
            </>
          )}
        </div>
      </div>
    </header>
  )
}