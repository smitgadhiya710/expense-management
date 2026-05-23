"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import Link from "next/link"
import {
  Wallet,
  LogOut,
  LayoutDashboard,
  UserPlus,
  FileText,
  Settings,
  Moon,
  Sun,
  Menu,
  X,
  User,
  Users
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { useQuery } from "@tanstack/react-query"

// Helper to retrieve cookie token for authorization header
function getAuthHeaders(): HeadersInit {
  if (typeof document === "undefined") return {}
  const value = `; ${document.cookie}`
  const parts = value.split(`; authToken=`)
  const token = parts.length === 2 ? parts.pop()?.split(";").shift() : ""

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  return headers
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = React.useState(false)

  // Fetch current logged-in user profile once and cache it per session
  const { data: meData, isLoading: isMeLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await fetch("/api/v1/user/me", {
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        throw new Error("Failed to fetch current user info")
      }
      return response.json() // Expecting { user: { userName, email, ... } }
    },
    staleTime: Infinity, // Keep the user query cached for the entire session
  })

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Close mobile sidebar when changing routes
  React.useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const handleSignOut = () => {
    // Clear cookies
    document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax"
    document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax"
    router.push("/login")
  }

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/user", label: "Users", icon: Users },
    { href: "#", label: "Policies", icon: FileText },
    { href: "#", label: "Settings", icon: Settings },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-6">
        {/* Branding */}
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
            <Wallet className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-lg text-white">Expensify Admin</span>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1.5" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all select-none ${
                  isActive
                    ? "bg-white text-neutral-950 shadow-xs"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User Footer / Log Out */}
      <div className="border-t border-white/10 pt-4 mt-auto space-y-3">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
            <User className="h-4.5 w-4.5 text-neutral-300" />
          </div>
          <div className="min-w-0 flex-1">
            {isMeLoading ? (
              <div className="space-y-1.5 animate-pulse">
                <div className="h-3.5 w-20 bg-white/20 rounded" />
                <div className="h-2.5 w-28 bg-white/10 rounded" />
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-white truncate">
                  {meData?.user?.userName || "Administrator"}
                </p>
                <p className="text-[10px] text-neutral-400 truncate">
                  {meData?.user?.email || "admin@example.com"}
                </p>
              </>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => setIsSignOutConfirmOpen(true)}
          className="w-full justify-start text-neutral-400 hover:text-white hover:bg-white/5 gap-3 h-10 px-3 cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5 text-neutral-400 group-hover:text-white" />
          Sign Out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Desktop Sidebar (Pinned left) */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:bg-neutral-950 md:border-r md:border-white/10 md:z-30 md:p-6 select-none">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in-0 duration-200"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-neutral-950 border-r border-white/10 z-50 p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:hidden select-none ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white rounded-md p-1.5 bg-white/5 border border-white/10 cursor-pointer"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen">
        {/* Header */}
        <header className="border-b border-border/60 bg-card/50 backdrop-blur-md sticky top-0 z-20 flex h-16 items-center justify-between px-6 md:px-10">
          <div className="flex items-center gap-3">
            {/* Hamburger Button for mobile */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden text-muted-foreground hover:text-foreground p-2 rounded-lg bg-muted/50 border border-border/50 cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <span className="font-bold tracking-tight text-md md:hidden">Expensify Admin</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="rounded-full h-9 w-9 border-border/50 bg-background/80 cursor-pointer shadow-xs active:scale-95 transition-all"
                aria-label="Toggle theme"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="h-4 w-4 text-yellow-400" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-800" />
                )}
              </Button>
            )}
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          {children}
        </main>
      </div>

      <ConfirmationModal
        isOpen={isSignOutConfirmOpen}
        onClose={() => setIsSignOutConfirmOpen(false)}
        onConfirm={handleSignOut}
        title="Sign Out"
        description="Are you sure you want to sign out? Your current active administrator session will be ended."
        confirmText="Sign Out"
        variant="warning"
      />
    </div>
  )
}
