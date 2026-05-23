"use client"

import * as React from "react"
import {
  TrendingUp,
  ArrowUpRight,
  DollarSign,
  PlusCircle,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Users
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Overview Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, Admin. This is a secure area protected by server-side middleware.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer">
            <PlusCircle className="h-4 w-4" />
            New Report
          </Button>
          <Button variant="outline" className="gap-1.5 border-border/80 cursor-pointer">
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 shadow-xs hover:shadow-md transition-shadow">
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

        <Card className="border-border/50 shadow-xs hover:shadow-md transition-shadow">
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

        <Card className="border-border/50 shadow-xs hover:shadow-md transition-shadow">
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

        <Card className="border-border/50 shadow-xs hover:shadow-md transition-shadow">
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
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Reports Table Card */}
        <Card className="border-border/50 lg:col-span-2 shadow-xs">
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
        <Card className="border-border/50 shadow-xs flex flex-col justify-between">
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
            <Button variant="outline" className="w-full text-xs border-border/80 cursor-pointer">
              Manage Policy Rules
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
