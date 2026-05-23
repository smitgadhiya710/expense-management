"use client"

import * as React from "react"
import { useMutation } from "@tanstack/react-query"
import {
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Loader2,
  UserPlus,
  AlertCircle,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export default function AddUserPage() {
  const [userName, setUserName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [role, setRole] = React.useState("user")
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({})

  const mutation = useMutation({
    mutationFn: async (userData: typeof payload) => {
      const response = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to create user")
      }

      return response.json()
    },
    onSuccess: (data) => {
      toast.success(`User "${data.userName}" successfully created with role: ${data.role}!`)
      // Clear inputs
      setUserName("")
      setEmail("")
      setPhone("")
      setPassword("")
      setRole("user")
      setErrors({})
    },
    onError: (error: Error) => {
      setErrors({ general: error.message })
      toast.error(error.message || "Failed to create user")
    },
  })

  const payload = {
    userName,
    email,
    phone,
    password,
    role,
  }

  const validate = () => {
    const newErrors: typeof errors = {}

    if (!userName.trim()) {
      newErrors.userName = "Username is required"
    } else if (userName.length < 3 || userName.length > 50) {
      newErrors.userName = "Username must be between 3 and 50 characters"
    }

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (phone.length < 7 || phone.length > 20) {
      newErrors.phone = "Phone number must be between 7 and 20 characters"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 8 || password.length > 72) {
      newErrors.password = "Password must be between 8 and 72 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validate()) return

    mutation.mutate(payload)
  }

  const isLoading = mutation.isPending

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Back to Dashboard link for mobile convenience */}
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group select-none"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Dashboard
        </Link>
      </div>

      <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-xl transition-all duration-300">
        <CardHeader className="space-y-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary mb-2">
            <UserPlus className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Add New User</CardTitle>
          <CardDescription>
            Register a new system user or administrator account.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Feedback Notifications */}
            {errors.general && (
              <div className="rounded-lg bg-destructive/15 p-3.5 text-xs font-medium text-destructive leading-relaxed border border-destructive/20 flex gap-2.5 items-start animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errors.general}</span>
              </div>
            )}


            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Username
              </Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                  <User className="h-4 w-4" />
                </span>
                <Input
                  id="username"
                  type="text"
                  placeholder="e.g., john_doe"
                  className={cn(
                    "pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                    errors.userName && "border-destructive focus:ring-destructive/20"
                  )}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              {errors.userName && (
                <p className="text-[11px] font-medium text-destructive animate-in fade-in-50">{errors.userName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                  <Mail className="h-4 w-4" />
                </span>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g., user@example.com"
                  className={cn(
                    "pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                    errors.email && "border-destructive focus:ring-destructive/20"
                  )}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-[11px] font-medium text-destructive animate-in fade-in-50">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Phone Number
              </Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                  <Phone className="h-4 w-4" />
                </span>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., +15551234567"
                  className={cn(
                    "pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                    errors.phone && "border-destructive focus:ring-destructive/20"
                  )}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] font-medium text-destructive animate-in fade-in-50">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Account Password
              </Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                  <Lock className="h-4 w-4" />
                </span>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={cn(
                    "pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                    errors.password && "border-destructive focus:ring-destructive/20"
                  )}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              {errors.password && (
                <p className="text-[11px] font-medium text-destructive animate-in fade-in-50">{errors.password}</p>
              )}
            </div>

            {/* Role Select */}
            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Security Role
              </Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                  <Shield className="h-4 w-4" />
                </span>
                <select
                  id="role"
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 focus:ring-primary/20 cursor-pointer"
                  )}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="user">User (Standard Access)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full relative transition-all active:scale-[0.98] cursor-pointer h-10 mt-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User Account
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
