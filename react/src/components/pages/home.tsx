import { Community } from "../community";
import { CTA } from "../cta";
import { Footer } from "../footer";
import { Header } from "../header";
import { Hero } from "../hero";
import DarkVeil from "../reactBit";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";


export default function Home() {
  const [isDark, setIsDark] = useState<boolean>(false);
  const location = useLocation();

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

  // Handle scroll-to-section when navigating from other pages
  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo) {
      // Small delay to allow the page to render before scrolling
      setTimeout(() => {
        const element = document.getElementById(state.scrollTo!);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.state]);

  return (
    <main className="min-h-screen bg-background relative">
      {/* Only show DarkVeil in dark mode */}
      {isDark && (
        <DarkVeil hueShift={120} noiseIntensity={0.015} scanlineIntensity={0.01} speed={0.25} warpAmount={0.015} />
      )}
      <div className="relative z-10">
        <Header />
        <Hero />
        {/* <Features /> */}
        <Community />
        <CTA />
        <Footer />
      </div>
    </main>
  )
}
