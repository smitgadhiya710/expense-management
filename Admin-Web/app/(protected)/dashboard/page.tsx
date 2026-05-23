"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Wallet,
  LogOut,
  TrendingUp,
  ArrowUpRight,
  DollarSign,
  PlusCircle,
  FileText,
  Moon,
  Sun,
  Clock,
  CheckCircle,
  AlertCircle,
  Users
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProtectedDashboardPage() {
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = () => {
    // Clear the authentication cookies
    document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax"
    document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax"
    // Redirect to login page
    router.push("/login")
  }

  // Avoid hydration mismatch for the theme toggle button
  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-500 shadow-md">
              <Wallet className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-bold tracking-tight text-lg">Expensify Admin</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="rounded-full h-9 w-9 border-border/50 bg-background/80"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4 text-yellow-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-800" />
              )}
            </Button>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground gap-1.5 transition-all"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Overview Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, Admin. This is a secure area protected by server-side middleware.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="gap-1.5 shadow-sm active:scale-95 transition-all">
              <PlusCircle className="h-4 w-4" />
              New Report
            </Button>
            <Button variant="outline" className="gap-1.5 border-border/80">
              <FileText className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Spendings</span>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className="text-emerald-500 font-semibold flex items-center gap-0.5">
                  <ArrowUpRight className="h-3 w-3" /> +12.5%
                </span>
                from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Approvals</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18 Reports</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className="text-amber-500 font-semibold">4 Urgent</span>
                awaiting immediate review
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Approved Claims</span>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142 Claims</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className="text-emerald-500 font-semibold">98.2%</span>
                success rate this week
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Policy Violations</span>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3 Detected</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className="text-destructive font-semibold">-1.4%</span>
                improvement vs last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Grid: Recent Submissions & Policy Rules */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Recent Reports Table Card */}
          <Card className="border-border/50 md:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Recent Expense Submissions</CardTitle>
              <CardDescription>Verify and approve employee spending reports.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-border/80 text-muted-foreground font-semibold">
                      <th className="pb-3 pt-1">Employee</th>
                      <th className="pb-3 pt-1">Category</th>
                      <th className="pb-3 pt-1">Amount</th>
                      <th className="pb-3 pt-1">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {[
                      { name: "Sarah Connor", category: "Travel & Lodging", amount: "$1,240.00", status: "Pending", statusColor: "text-amber-500 bg-amber-500/10" },
                      { name: "John Doe", category: "Office Supplies", amount: "$89.50", status: "Approved", statusColor: "text-emerald-500 bg-emerald-500/10" },
                      { name: "Alice Smith", category: "Software SaaS", amount: "$350.00", status: "Approved", statusColor: "text-emerald-500 bg-emerald-500/10" },
                      { name: "Bob Johnson", category: "Meals & Entertaining", amount: "$210.00", status: "Flagged", statusColor: "text-destructive bg-destructive/10" }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 font-medium">{row.name}</td>
                        <td className="py-3.5 text-muted-foreground">{row.category}</td>
                        <td className="py-3.5 font-semibold">{row.amount}</td>
                        <td className="py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${row.statusColor}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Quick Policy Checklist Card */}
          <Card className="border-border/50 shadow-sm flex flex-col justify-between">
            <div>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Policy Health</CardTitle>
                <CardDescription>Rules configuration for expense approvals.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Receipt required for spendings > $25", active: true },
                  { label: "Daily food allowance limit ($75)", active: true },
                  { label: "Require dual sign-off for items > $5,000", active: true },
                  { label: "Automatic audit flag on weekend transactions", active: false }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className={item.active ? "text-foreground" : "text-muted-foreground line-through"}>
                      {item.label}
                    </span>
                    <span className={`h-2.5 w-2.5 rounded-full ${item.active ? "bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-700"}`} />
                  </div>
                ))}
              </CardContent>
            </div>
            <div className="p-6 pt-0">
              <Button variant="outline" className="w-full text-xs border-border/80">
                Manage Policy Rules
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
