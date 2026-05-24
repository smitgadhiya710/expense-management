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
  Users,
  Receipt
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = React.useState(false)
  const [isProfileDetailsOpen, setIsProfileDetailsOpen] = React.useState(false)

  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
    { href: "/expense-type", label: "Expense Types", icon: Receipt },
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
          <span className="font-bold tracking-tight text-lg text-foreground">Expensify Admin</span>
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
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
      <div className="border-t border-border pt-4 mt-auto">
        <Button
          variant="ghost"
          onClick={() => setIsSignOutConfirmOpen(true)}
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted gap-3 h-10 px-3 cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5 text-muted-foreground group-hover/button:text-foreground" />
          Sign Out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Desktop Sidebar (Pinned left) */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-card border-r border-border md:z-30 p-6 select-none transition-colors duration-300">
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
        className={`fixed inset-y-0 left-0 w-72 bg-card border-r border-border z-50 p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:hidden select-none transition-colors duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-md p-1.5 bg-muted border border-border cursor-pointer transition-colors"
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
            {/* Profile Dropdown */}
            {mounted && (
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="rounded-full h-9 w-9 border-border/50 bg-background/80 cursor-pointer shadow-xs active:scale-95 transition-all"
                  aria-label="User Profile Menu"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                </Button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-xl z-50 animate-in fade-in-50 slide-in-from-top-1 duration-150 p-1">
                    {/* User Profile Header */}
                    <div className="px-3 py-2 border-b border-border/50">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {meData?.user?.userName || "Administrator"}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {meData?.user?.email || "admin@example.com"}
                      </p>
                    </div>

                    <div className="py-1">
                      {/* Option 1: Profile Details */}
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false)
                          setIsProfileDetailsOpen(true)
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        User Profile Details
                      </button>

                      {/* Option 2: Theme Selection */}
                      <button
                        onClick={() => {
                          setTheme(resolvedTheme === "dark" ? "light" : "dark")
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          {resolvedTheme === "dark" ? (
                            <Sun className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <Moon className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          <span>Theme Selection</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground capitalize mr-1">
                          {resolvedTheme}
                        </span>
                      </button>

                      {/* Option 3: Sign Out */}
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false)
                          setIsSignOutConfirmOpen(true)
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5 text-destructive" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
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

      {/* Profile Details Modal */}
      {isProfileDetailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200"
            onClick={() => setIsProfileDetailsOpen(false)}
          />
          <Card className="w-full max-w-sm relative z-10 border-border bg-card/95 backdrop-blur-xl shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            <button
              onClick={() => setIsProfileDetailsOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-md p-1.5 bg-muted/50 border border-border/50 cursor-pointer"
              aria-label="Close profile details"
            >
              <X className="h-4 w-4" />
            </button>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Details
              </CardTitle>
              <CardDescription>Your account security information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-sm">
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Username</span>
                <span className="font-semibold text-foreground">{meData?.user?.userName || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Email</span>
                <span className="font-semibold text-foreground">{meData?.user?.email || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-semibold text-foreground">{meData?.user?.phone || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Role</span>
                <span className="font-semibold capitalize text-foreground">{meData?.user?.role || "N/A"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
