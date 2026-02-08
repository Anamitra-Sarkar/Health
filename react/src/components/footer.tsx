

import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-muted/60 via-background to-muted/40 border-t border-border/60 py-16">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-4 gap-8 lg:gap-12 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg animate-glow-pulse">
                <img src="/logo-white.png" alt="HealthSync Logo" className="w-6 h-6" />
              </div>
              <span className="font-bold text-foreground text-xl">HealthSync EMR</span>
            </div>
            <p className="text-muted-foreground/90 leading-relaxed mb-6">
              Enterprise EMR, interoperability, and clinical workflows for modern clinics and hospitals. Built for the future of healthcare.
            </p>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-6 text-lg">Product</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <Link to="/" state={{ scrollTo: 'features' }} className="hover:text-primary transition-colors duration-300 flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  Features
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors duration-300 flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  About
                </Link>
              </li>
              <li>
                <Link to="/dashboard/icd11" className="hover:text-primary transition-colors duration-300 flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  ICD-11 Codes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-6 text-lg">Resources</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-primary transition-colors duration-300 flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/" state={{ scrollTo: 'community' }} className="hover:text-primary transition-colors duration-300 flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  Community
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors duration-300 flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-6 text-lg">Account</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <Link to="/login" className="hover:text-primary transition-colors duration-300 flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-primary transition-colors duration-300 flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/dashboard/settings" className="hover:text-primary transition-colors duration-300 flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  Settings
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/30 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-center md:text-left">
              &copy; 2025 HealthSync EMR. All rights reserved. Built for secure clinical workflows and interoperability.
            </p>
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-400/10 border border-primary/20">
                <span className="text-xs font-semibold text-primary">HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
