"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface LoginFormProps extends React.ComponentPropsWithoutRef<"div"> {}

export function LoginForm({ className, ...props }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [errors, setErrors] = React.useState<{ email?: string; password?: string; general?: string }>({})
  const [rememberMe, setRememberMe] = React.useState(false)

  const mutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Invalid email or password")
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Store simple token in cookie so middleware can read it
      document.cookie = "isLoggedIn=true; path=/; max-age=86400; SameSite=Lax"
      if (data.token) {
        document.cookie = `authToken=${data.token}; path=/; max-age=86400; SameSite=Lax`
      }
      toast.success("Welcome back! Sign in successful.")
      router.push("/dashboard")
    },
    onError: (error: Error) => {
      setErrors({ general: error.message })
      toast.error(error.message || "Invalid email or password")
    },
  })

  const isLoading = mutation.isPending

  const validateForm = () => {
    const newErrors: typeof errors = {}
    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) return

    mutation.mutate({ email, password })
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-xl transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Enter your email to sign in to your admin account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="rounded-lg bg-destructive/15 p-3 text-xs font-medium text-destructive leading-relaxed border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                {errors.general}
              </div>
            )}

            <div className="space-y-2">
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
                  placeholder="admin@example.com"
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
                <p className="text-xs font-medium text-destructive animate-in fade-in-50">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    alert("Password reset is not configured in this demo.")
                  }}
                  className="text-xs font-medium text-primary hover:underline transition-all"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                  <Lock className="h-4 w-4" />
                </span>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={cn(
                    "pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                    errors.password && "border-destructive focus:ring-destructive/20"
                  )}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-destructive animate-in fade-in-50">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(!!checked)}
                disabled={isLoading}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground select-none"
              >
                Keep me signed in
              </label>
            </div>

            <Button type="submit" className="w-full relative transition-all active:scale-[0.98]" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

         
        </CardContent>
       
      </Card>
    </div>
  )
}
