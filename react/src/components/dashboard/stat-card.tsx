"use client"
import { Card } from "@/components/ui/card"
import { type LucideIcon, ArrowUp, Minus } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  change: string
  icon: LucideIcon
  trend?: "up" | "down" | "stable"
}

export default function StatCard({ label, value, change, icon: Icon, trend = "stable" }: StatCardProps) {
  return (
    <Card className="relative bg-card border-border p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 animate-fade-in-scale animate-wave-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-foreground">{value}</h3>
          <div className="flex items-center gap-1 mt-2">
            {trend === "up" && (
              <>
                <ArrowUp className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-emerald-500 font-medium">{change}</span>
              </>
            )}
            {trend === "stable" && (
              <>
                <Minus className="w-4 h-4 text-teal-500" />
                <span className="text-xs text-teal-500 font-medium">{change}</span>
              </>
            )}
          </div>
        </div>
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center animate-float">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </Card>
  )
}
