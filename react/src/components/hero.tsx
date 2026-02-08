"use client"

import { Button } from "./ui/button"
import { Users, MessageCircle, BookOpen, Shield, Heart, Activity, Stethoscope, Pill, Syringe, Thermometer, HeartPulse, Cross, Hospital, Droplet, Brain, Eye, Bone, Ambulance, Clipboard, FileHeart } from "lucide-react"
import { motion } from "framer-motion"

import { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../lib/auth"
import { Card } from "./ui/card"
// import DarkVeil from "./reactBit"

// Floating medical icons for the background - expanded for more visual richness
const floatingIcons = [
  { Icon: Heart, delay: 0, duration: 8, x: '10%', y: '15%' },
  { Icon: Activity, delay: 0.5, duration: 10, x: '80%', y: '20%' },
  { Icon: Stethoscope, delay: 1, duration: 9, x: '70%', y: '60%' },
  { Icon: Pill, delay: 1.5, duration: 11, x: '15%', y: '70%' },
  { Icon: HeartPulse, delay: 2, duration: 7, x: '85%', y: '80%' },
  { Icon: Thermometer, delay: 2.5, duration: 12, x: '25%', y: '40%' },
  { Icon: Cross, delay: 3, duration: 8, x: '60%', y: '35%' },
  { Icon: Hospital, delay: 3.5, duration: 10, x: '90%', y: '45%' },
  { Icon: Syringe, delay: 4, duration: 9, x: '5%', y: '55%' },
  { Icon: Heart, delay: 4.5, duration: 11, x: '50%', y: '85%' },
  // Additional icons for enhanced visual richness
  { Icon: Droplet, delay: 0.3, duration: 13, x: '35%', y: '10%' },
  { Icon: Brain, delay: 1.2, duration: 14, x: '92%', y: '65%' },
  { Icon: Eye, delay: 2.2, duration: 10, x: '45%', y: '25%' },
  { Icon: Bone, delay: 3.3, duration: 9, x: '8%', y: '85%' },
  { Icon: Ambulance, delay: 1.8, duration: 12, x: '75%', y: '10%' },
  { Icon: Clipboard, delay: 2.8, duration: 8, x: '20%', y: '90%' },
  { Icon: FileHeart, delay: 3.8, duration: 11, x: '65%', y: '75%' },
  { Icon: Cross, delay: 0.8, duration: 15, x: '55%', y: '5%' },
]

const features = [
  {
    icon: Users,
    title: "Patient Registry",
    description: "Maintain a secure, searchable registry of patient records with structured clinical data.",
  },
  {
    icon: MessageCircle,
    title: "Care Coordination",
    description: "Streamline referrals, messaging, and care plans across teams and facilities.",
  },
  {
    icon: BookOpen,
    title: "Clinical Resources",
    description: "Provide evidence-based guidelines, clinical pathways, and decision support.",
  },
  {
    icon: Shield,
    title: "Privacy & Security",
    description: "HIPAA-compliant controls, audit logs, and encrypted storage.",
  },
]

export function Hero() {
  const containerRef = useRef(null)
  const [, setIsMobile] = useState(false)
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  // State for ICD-11 API data and UI states
  const [query, _setQuery] = useState("")
  const [diseaseCatalog, setDiseaseCatalog] = useState<Array<any>>([])
  const [_loading, setLoading] = useState(false)
  const [_error, setError] = useState<string | null>(null)

  const [_selected, _setSelected] = useState<any | null>(null)
  const [_saved, _setSaved] = useState<Array<any>>([])
  const [_highlightedIndex, setHighlightedIndex] = useState<number>(-1)
  // const [showList, setShowList] = useState(false)
  const [_sending, _setSending] = useState(false)
  const [_sendLog, _setSendLog] = useState<string | null>(null)

  // Detect mobile screens
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch ICD-11 API data when query changes, debounce to avoid overloading API
  useEffect(() => {
    if (!query.trim()) {
      setDiseaseCatalog([])
      setError(null)
      return
    }
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`https://clinicaltables.nlm.nih.gov/api/icd11_codes/v3/search?terms=${encodeURIComponent(query)}&maxList=15`)
        if (!res.ok) throw new Error('Network response not OK')
        const data = await res.json()
        /* data format:
          [
            totalCount,
            code array,
            extra data object with properties including 'title' which stores display names,
            array of display strings, e.g. ['code', 'title', 'parent', ...]
          ]
        */
        const codes = data[1]
        const titles = data[3].map((entry: string[]) => entry[1]) // title is at index 1 of each entry
        // Map API results into a format similar to your previous static array
        const catalog = codes.map((code: string, idx: number) => ({
          id: code,
          icd: code,
          title: titles[idx],
          description: '', // API does not provide description here
        }))
        setDiseaseCatalog(catalog)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message || 'Error fetching data')
        setDiseaseCatalog([])
      } finally {
        setLoading(false)
      }
    }

    // Debounce fetch by 300ms
    const debounce = setTimeout(fetchData, 300)
    return () => clearTimeout(debounce)
  }, [query])

  const filtered = query
    ? diseaseCatalog.filter((d) => {
        const q = query.toLowerCase()
        return (
          d.title.toLowerCase().includes(q) ||
          d.icd.toLowerCase().includes(q)
        )
      })
    : diseaseCatalog

  useEffect(() => {
    // reset highlighted index when filtered results change
    setHighlightedIndex(filtered.length > 0 ? 0 : -1)
  }, [filtered.length])

  // const _listboxId = 'icd-listbox'

  // const [_canScrollUpResults, setCanScrollUpResults] = useState(false)
  // const [_canScrollDownResults, setCanScrollDownResults] = useState(false)
  const resultsScrollRef = useRef<HTMLDivElement | null>(null)

  // const _handleResultsScroll = (e: React.UIEvent<HTMLDivElement>) => {
  //   const element = e.currentTarget
  //   setCanScrollUpResults(element.scrollTop > 5)
  //   setCanScrollDownResults(
  //     element.scrollTop < element.scrollHeight - element.clientHeight - 5
  //   )
  // }

  useEffect(() => {
    // Check if results need scroll indicators on mount/update
    if (resultsScrollRef.current && filtered.length > 0) {
      // const el = resultsScrollRef.current
      // setTimeout(() => {
      //   setCanScrollDownResults(el.scrollHeight > el.clientHeight)
      // }, 100)
    }
  }, [filtered.length])

  // Unused function - kept for future use
  // const _onInputKeyDown = (e: any) => {
  //   if (filtered.length === 0) return
  //   if (e.key === 'ArrowDown') {
  //     e.preventDefault()
  //     setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1))
  //   } else if (e.key === 'ArrowUp') {
  //     e.preventDefault()
  //     setHighlightedIndex((i) => Math.max(i - 1, 0))
  //   } else if (e.key === 'Enter') {
  //     e.preventDefault()
  //     if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
  //       const sel = filtered[highlightedIndex]
  //       setSelected(sel)
  //       setHighlightedIndex(-1)
  //       setQuery('')
  //     }
  //   } else if (e.key === 'Escape') {
  //     e.preventDefault()
  //     setHighlightedIndex(-1)
  //   }
  // }

  // function convertToFHIR(diagnosis: any) {
  //   const fhir = {
  //     resourceType: 'Condition',
  //     id: `cond-${diagnosis.id}`,
  //     clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }] },
  //     verificationStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed' }] },
  //     code: {
  //       coding: [
  //         { system: 'http://who.int/icd', code: diagnosis.icd, display: diagnosis.title },
  //       ],
  //       text: diagnosis.title,
  //     },
  //     subject: { reference: 'Patient/sample-patient', display: 'Sample Patient' },
  //     onsetDateTime: new Date().toISOString(),
  //   }
  //   return fhir
  // }

  // Unused function - kept for future use
  // async function _handleSave() {
  //   if (!selected) return
  //   setSaved((s) => {
  //     if (s.find((it) => it.id === selected.id)) return s
  //     return [...s, selected]
  //   })
  // }

  // Unused function - kept for future use
  // async function _handleMockSend() {
  //   if (!selected) return
  //   setSending(true)
  //   setSendLog(null)

  //   await new Promise((r) => setTimeout(r, 700))
  //   setSending(false)
  //   setSendLog('Navigating to ICD-11 dashboard...')
    
  //   // Navigate to dashboard/icd11 page
  //   window.location.href = '/dashboard/icd11'
  // }


  // Mobile animation ranges and spring configs as before (omitted here for brevity)
  // ... (copy your existing scroll and animation related code)

  // For brevity, I keep animation code unchanged — insert your previous code here

  return (
    <div ref={containerRef} className="overflow-hidden relative">

      {/* Hero Section with Split Layout and Interactive Elements */}
      <section className="relative py-8 md:py-12 lg:py-16 min-h-[90vh]">
        {/* Animated Green Waves Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Top wave layer - subtle accent */}
          <svg className="absolute top-0 left-0 w-full h-40 opacity-10 dark:opacity-15 rotate-180" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <motion.path
              fill="rgba(5, 150, 105, 0.25)"
              d="M0,64L60,80C120,96,240,128,360,138.7C480,149,600,139,720,122.7C840,107,960,85,1080,90.7C1200,96,1320,128,1380,144L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
              animate={{
                d: [
                  "M0,64L60,80C120,96,240,128,360,138.7C480,149,600,139,720,122.7C840,107,960,85,1080,90.7C1200,96,1320,128,1380,144L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z",
                  "M0,96L60,106.7C120,117,240,139,360,133.3C480,128,600,96,720,96C840,96,960,128,1080,133.3C1200,139,1320,117,1380,106.7L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z",
                  "M0,64L60,80C120,96,240,128,360,138.7C480,149,600,139,720,122.7C840,107,960,85,1080,90.7C1200,96,1320,128,1380,144L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
                ]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
          
          {/* Middle wave layer - decorative */}
          <svg className="absolute top-1/3 left-0 w-full h-32 opacity-8 dark:opacity-12" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <motion.path
              fill="rgba(16, 185, 129, 0.15)"
              d="M0,160L40,170.7C80,181,160,203,240,186.7C320,171,400,117,480,106.7C560,96,640,128,720,154.7C800,181,880,203,960,192C1040,181,1120,139,1200,128C1280,117,1360,139,1400,149.3L1440,160L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"
              animate={{
                d: [
                  "M0,160L40,170.7C80,181,160,203,240,186.7C320,171,400,117,480,106.7C560,96,640,128,720,154.7C800,181,880,203,960,192C1040,181,1120,139,1200,128C1280,117,1360,139,1400,149.3L1440,160L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z",
                  "M0,128L40,144C80,160,160,192,240,197.3C320,203,400,181,480,165.3C560,149,640,139,720,149.3C800,160,880,192,960,186.7C1040,181,1120,139,1200,122.7C1280,107,1360,117,1400,122.7L1440,128L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z",
                  "M0,160L40,170.7C80,181,160,203,240,186.7C320,171,400,117,480,106.7C560,96,640,128,720,154.7C800,181,880,203,960,192C1040,181,1120,139,1200,128C1280,117,1360,139,1400,149.3L1440,160L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"
                ]
              }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
          </svg>

          {/* Animated wave layers - bottom */}
          <svg className="absolute bottom-0 left-0 w-full h-64 opacity-20 dark:opacity-30" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <motion.path
              fill="rgba(16, 185, 129, 0.3)"
              d="M0,192L48,176C96,160,192,128,288,133.3C384,139,480,181,576,186.7C672,192,768,160,864,154.7C960,149,1056,171,1152,181.3C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              animate={{
                d: [
                  "M0,192L48,176C96,160,192,128,288,133.3C384,139,480,181,576,186.7C672,192,768,160,864,154.7C960,149,1056,171,1152,181.3C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                  "M0,160L48,181.3C96,203,192,245,288,234.7C384,224,480,160,576,138.7C672,117,768,139,864,160C960,181,1056,203,1152,197.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                  "M0,192L48,176C96,160,192,128,288,133.3C384,139,480,181,576,186.7C672,192,768,160,864,154.7C960,149,1056,171,1152,181.3C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                ]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
          <svg className="absolute bottom-0 left-0 w-full h-48 opacity-15 dark:opacity-25" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <motion.path
              fill="rgba(52, 211, 153, 0.4)"
              d="M0,256L48,234.7C96,213,192,171,288,165.3C384,160,480,192,576,213.3C672,235,768,245,864,234.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              animate={{
                d: [
                  "M0,256L48,234.7C96,213,192,171,288,165.3C384,160,480,192,576,213.3C672,235,768,245,864,234.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                  "M0,224L48,213.3C96,203,192,181,288,192C384,203,480,245,576,250.7C672,256,768,224,864,213.3C960,203,1056,213,1152,229.3C1248,245,1344,267,1392,277.3L1440,288L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                  "M0,256L48,234.7C96,213,192,171,288,165.3C384,160,480,192,576,213.3C672,235,768,245,864,234.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                ]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
          </svg>
          
          {/* Third bottom wave - accent layer */}
          <svg className="absolute bottom-0 left-0 w-full h-36 opacity-12 dark:opacity-18" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <motion.path
              fill="rgba(110, 231, 183, 0.35)"
              d="M0,288L60,277.3C120,267,240,245,360,240C480,235,600,245,720,261.3C840,277,960,299,1080,293.3C1200,288,1320,256,1380,240L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
              animate={{
                d: [
                  "M0,288L60,277.3C120,267,240,245,360,240C480,235,600,245,720,261.3C840,277,960,299,1080,293.3C1200,288,1320,256,1380,240L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z",
                  "M0,256L60,266.7C120,277,240,299,360,298.7C480,299,600,277,720,261.3C840,245,960,235,1080,245.3C1200,256,1320,288,1380,304L1440,320L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z",
                  "M0,288L60,277.3C120,267,240,245,360,240C480,235,600,245,720,261.3C840,277,960,299,1080,293.3C1200,288,1320,256,1380,240L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
                ]
              }}
              transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            />
          </svg>
          
          {/* Floating medical icons */}
          {floatingIcons.map(({ Icon, delay, duration, x, y }, index) => (
            <motion.div
              key={index}
              className="absolute pointer-events-none"
              style={{ left: x, top: y }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: [0.1, 0.25, 0.1],
                scale: [0.8, 1.1, 0.8],
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration, 
                repeat: Infinity, 
                delay,
                ease: "easeInOut"
              }}
            >
              <Icon className="w-8 h-8 md:w-12 md:h-12 text-emerald-500/30 dark:text-emerald-400/20" />
            </motion.div>
          ))}
          
          {/* EKG/Heartbeat line animation */}
          <div className="absolute top-1/2 left-0 w-full h-32 overflow-hidden opacity-10 dark:opacity-20">
            <motion.svg 
              className="w-[200%] h-full" 
              viewBox="0 0 1000 100" 
              preserveAspectRatio="none"
              animate={{ x: [0, -500] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <motion.path
                d="M0,50 L100,50 L120,50 L130,20 L140,80 L150,30 L160,70 L170,50 L250,50 L350,50 L370,50 L380,20 L390,80 L400,30 L410,70 L420,50 L500,50 L600,50 L620,50 L630,20 L640,80 L650,30 L660,70 L670,50 L750,50 L850,50 L870,50 L880,20 L890,80 L900,30 L910,70 L920,50 L1000,50"
                stroke="rgba(16, 185, 129, 0.6)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </div>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-8 md:py-12">
            
            {/* Left Column - Brand & Navigation */}
            <motion.div 
              className="lg:col-span-5 space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="space-y-6">
                {/* Brand Header */}
                <div className="space-y-3">
                  
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                    <motion.span 
                      className="mb-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      <span className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-emerald-50 dark:to-white bg-clip-text text-transparent">
                        Health
                      </span>
                    </motion.span>
                    <motion.span 
                      className="bg-linear-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      Sync
                    </motion.span>
                  </h1>
                </div>

                {/* Value Proposition */}
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <p className="text-xl font-medium text-foreground/80 dark:text-foreground/90">
                    Clinical intelligence meets seamless workflow
                  </p>
                  <p className="text-lg text-foreground/60 dark:text-foreground/70 max-w-lg leading-relaxed">
                    Transform patient care with our ICD-11 integrated EMR. Real-time FHIR compliance, intelligent diagnostics, and secure team collaboration in one unified platform.
                  </p>
                </motion.div>


                {/* Call to Action */}
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4 items-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <Button 
                    size="lg" 
                    className="relative bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-6 text-lg shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 animate-glow-pulse animate-wave-pulse"
                    onClick={() => {
                      if (authLoading) return
                      if (user) navigate('/dashboard')
                      else navigate('/login')
                    }}
                  >
                    Go to Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-2 border-foreground/20 dark:border-foreground/30 px-8 py-6 text-lg hover:bg-foreground/5 dark:hover:bg-foreground/10"
                    onClick={() => navigate('/about')}
                  >
                    Read about us
                  </Button>
                </motion.div>

                {/* Animated Stethoscope Hero Visual */}
                <motion.div 
                  className="relative mt-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <div className="relative flex items-center justify-center">
                    {/* Pulsing rings around stethoscope */}
                    <motion.div 
                      className="absolute w-40 h-40 rounded-full border-2 border-emerald-500/30 dark:border-emerald-400/30"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div 
                      className="absolute w-32 h-32 rounded-full border-2 border-teal-500/40 dark:border-teal-400/40"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    />
                    <motion.div 
                      className="absolute w-24 h-24 rounded-full border-2 border-green-500/50 dark:border-green-400/50"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                    />
                    
                    {/* Main stethoscope icon with glow */}
                    <motion.div 
                      className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 flex items-center justify-center shadow-2xl shadow-emerald-500/40"
                      animate={{ 
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          '0 0 20px rgba(16, 185, 129, 0.4)',
                          '0 0 40px rgba(16, 185, 129, 0.6)',
                          '0 0 20px rgba(16, 185, 129, 0.4)'
                        ]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Stethoscope className="w-10 h-10 text-white" />
                    </motion.div>
                  </div>
                  
                  {/* Stats badges around the stethoscope */}
                  <div className="flex justify-center gap-4 mt-6">
                    <motion.div 
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 border border-emerald-300/50 dark:border-emerald-700/50 backdrop-blur-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">HIPAA Compliant</span>
                      </div>
                    </motion.div>
                    <motion.div 
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-teal-100 to-green-100 dark:from-teal-900/40 dark:to-green-900/40 border border-teal-300/50 dark:border-teal-700/50 backdrop-blur-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">FHIR Ready</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Column - responsive image: large on desktop, centered small on mobile */}
            <motion.div
              className="lg:col-span-7 flex items-center justify-end"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.9 }}
            >
              <div className="w-full max-w-md lg:max-w-lg flex justify-end pr-4 lg:pr-8">
                {/* Desktop: right-aligned large image */}
                <img
                  src="/assets/stethoscope.png"
                  alt="stethoscope"
                  loading="lazy"
                  className="hidden lg:block w-64 md:w-80 lg:w-[420px] object-contain rounded-xl shadow-2xl"
                />

                {/* Mobile: centered smaller image that appears below the left column when stacked */}
                <img
                  src="/assets/stethoscope.png"
                  alt="stethoscope"
                  loading="lazy"
                  className="block lg:hidden w-40 sm:w-48 md:w-56 object-contain rounded-xl shadow-xl mx-auto mt-6"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section with Modern Cards */}
      <section id="features" className="relative py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/20 to-background"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Built for <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Modern Healthcare</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every feature is meticulously designed with clinical workflows and patient outcomes at the forefront.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: index * 0.15, ease: "easeOut" }}
                  whileHover={{ y: -8, scale: 1.03 }}
                  className="group"
                >
                  <Card className="p-8 bg-gradient-to-br from-card/80 via-card to-card/80 hover:shadow-2xl hover:shadow-emerald-500/15 transition-all duration-500 border-2 border-border/60 hover:border-emerald-500/40 backdrop-blur-md h-full rounded-2xl">
                    <div className="space-y-5">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-400/10 via-green-400/10 to-teal-400/10 border-2 border-emerald-200/30 dark:border-emerald-800/30 flex items-center justify-center group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-emerald-500/25 transition-all duration-400">
                        <Icon className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
