"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Wallet, ArrowUpRight, TrendingUp, Users, DollarSign } from "lucide-react"

import { LoginForm } from "@/components/login-form"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch by waiting for mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row bg-background transition-colors duration-300">
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-50">
        {mounted && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="rounded-full bg-background/80 backdrop-blur border-border/50 shadow-sm transition-all hover:scale-105 active:scale-95"
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-400 transition-all" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem] text-slate-800 transition-all" />
            )}
          </Button>
        )}
      </div>

      {/* Left panel - Visual Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-neutral-950 text-white overflow-hidden select-none">
        {/* Glowing Ambient Mesh Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--color-primary)/0.25,transparent_50%)] z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.15),transparent_40%)] z-0" />
        <div 
          className="absolute inset-0 z-0 opacity-[0.03]" 
          style={{
            backgroundImage: `radial-gradient(circle at center, white 1px, transparent 1px)`,
            backgroundSize: "24px 24px"
          }}
        />

        {/* Floating gradient blobs for dynamic depth */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[90px] animate-pulse pointer-events-none" style={{ animationDuration: '6s' }} />

        {/* Top Header Section */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-500 shadow-lg shadow-primary/20">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            Expensify Admin
          </span>
        </div>

        {/* Middle Custom Dashboard Visual (Mock UI) */}
        <div className="relative z-10 w-full max-w-md mx-auto my-auto py-12 flex flex-col gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-neutral-200 border border-white/10 backdrop-blur">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              New Q2 Expense Report Available
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight lg:text-5xl">
              Control your <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">business expenses</span> in one place.
            </h1>
            <p className="text-neutral-400 text-base leading-relaxed">
              Track real-time spendings, manage employee limits, and automate reimbursement approvals with our AI-powered admin engine.
            </p>
          </div>

          {/* Premium Floating Card Mockup */}
          <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl transition-transform duration-500 hover:scale-[1.02] group">
            <div className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white animate-bounce">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <span className="text-xs text-neutral-400 font-medium">TOTAL SAVED THIS MONTH</span>
                <div className="text-2xl font-bold tracking-tight text-white flex items-baseline gap-1">
                  $14,248.50
                  <span className="text-xs text-emerald-400 font-semibold flex items-center">
                    +18.2%
                  </span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-400" />
              </div>
            </div>

            {/* Custom mini chart bars using HTML/CSS */}
            <div className="flex items-end justify-between gap-2 h-14 mt-6">
              {[35, 45, 30, 60, 50, 75, 90, 65, 80, 95].map((val, idx) => (
                <div key={idx} className="flex-1 group/bar relative">
                  <div 
                    className="w-full bg-white/10 rounded-sm group-hover/bar:bg-primary transition-all duration-300"
                    style={{ height: `${val}%` }}
                  />
                  {/* Tooltip on hover */}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-neutral-900 text-[10px] text-white px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-50 border border-white/10">
                    Week {idx + 1}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-4 text-xs text-neutral-400">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-neutral-300" />
                12 active accounts
              </span>
              <span>Updated 3m ago</span>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="relative z-10 flex items-center justify-between text-xs text-neutral-500 border-t border-white/5 pt-6">
          <p>© 2026 Expensify Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-neutral-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-neutral-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>

      {/* Right panel - Form container */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 relative overflow-hidden bg-background">
        {/* Ambient Grid for form panel too, but subtle */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.015] dark:opacity-[0.03]" 
          style={{
            backgroundImage: `radial-gradient(circle at center, var(--color-foreground) 1px, transparent 1px)`,
            backgroundSize: "24px 24px"
          }}
        />

        {/* Mobile Header (Hidden on large screens) */}
        <div className="lg:hidden absolute top-4 left-6 flex items-center gap-2 z-10">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-md">
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <span className="text-md font-bold tracking-tight text-foreground">
            Expensify Admin
          </span>
        </div>

        {/* Form component wrap */}
        <div className="w-full max-w-[400px] z-10 animate-in fade-in-50 slide-in-from-bottom-5 duration-700">
          <LoginForm />
        </div>

        {/* Mobile Footer (Hidden on large screens) */}
        <div className="lg:hidden mt-8 text-center text-xs text-muted-foreground z-10 space-y-1">
          <p>© 2026 Expensify Inc. All rights reserved.</p>
          <div className="flex justify-center gap-3">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </div>
  )
}
