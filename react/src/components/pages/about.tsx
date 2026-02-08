import { Header } from "../header";
import { Footer } from "../footer";
import { Heart, Shield, Users, Activity, Stethoscope, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import DarkVeil from "../reactBit";

const values = [
  {
    icon: Heart,
    title: "Patient-Centered Care",
    description: "Every feature we build starts with the patient. Our EMR is designed to help clinicians spend more time with patients and less time on paperwork."
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    description: "HIPAA-compliant from the ground up. End-to-end encryption, audit logging, and role-based access controls protect sensitive health data."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Built for multi-disciplinary care teams. Seamless handoffs, shared care plans, and real-time notifications keep everyone in sync."
  },
  {
    icon: Activity,
    title: "Interoperability",
    description: "Native FHIR R4 support and ICD-11 integration ensure your data flows smoothly across systems and meets international standards."
  },
  {
    icon: Stethoscope,
    title: "Clinical Intelligence",
    description: "AI-powered diagnostics assistance, intelligent search, and clinical decision support help clinicians make informed decisions faster."
  },
  {
    icon: Globe,
    title: "Open & Accessible",
    description: "Accessible from any device, anywhere. Our responsive design and cloud-first approach mean care never stops, even on the go."
  }
];

export default function About() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(() => checkTheme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-background relative">
      {isDark && (
        <DarkVeil hueShift={120} noiseIntensity={0.015} scanlineIntensity={0.01} speed={0.25} warpAmount={0.015} />
      )}
      <div className="relative z-10">
        <Header />

        {/* Hero Banner */}
        <section className="relative py-20 md:py-28 bg-gradient-to-br from-primary/5 via-background to-muted/30 overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                About{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-green-400 to-teal-400">
                  HealthSync
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                HealthSync is an open-source, cloud-native Electronic Medical Records platform built for modern healthcare teams. 
                We combine clinical intelligence, interoperability standards, and intuitive design to help care teams deliver better patient outcomes.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                To make world-class clinical workflow tools accessible to every healthcare provider — from independent practices to large hospital networks — 
                through secure, standards-based, and easy-to-use technology.
              </p>
            </motion.div>

            {/* Values Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="p-6 rounded-2xl bg-card/80 border border-border/60 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 h-full">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-400/10 to-teal-400/10 border border-emerald-200/30 dark:border-emerald-800/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{value.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-muted/20 to-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Built With Modern Technology</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
                HealthSync leverages the latest in web technologies and healthcare standards to deliver a fast, reliable, and secure platform.
              </p>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: "React + TypeScript", detail: "Type-safe frontend" },
                  { label: "Node.js + Express", detail: "Scalable backend" },
                  { label: "MongoDB", detail: "Flexible data store" },
                  { label: "ICD-11 & FHIR", detail: "Health standards" },
                ].map((tech, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-xl bg-card/80 border border-border/60 hover:border-primary/30 transition-all duration-300"
                  >
                    <p className="font-semibold text-foreground">{tech.label}</p>
                    <p className="text-sm text-muted-foreground">{tech.detail}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
