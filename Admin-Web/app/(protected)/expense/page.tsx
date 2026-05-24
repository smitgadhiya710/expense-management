"use client"

import * as React from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import {
  Loader2,
  Trash2,
  Edit2,
  Eye,
  RotateCcw,
  X,
  Plus,
  AlertCircle,
  Wallet,
  Calendar,
  Search,
  Filter,
  ArrowRight,
  TrendingDown,
  Tag
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"

// TypeScript Interfaces
interface UserDetails {
  id: string
  userName: string
  phone: string
  email: string
  role: "admin" | "user"
}

interface ExpenseTypeDetails {
  id: string
  name: string
  key: string
  isActive: boolean
}

interface ExpenseRecord {
  id: string
  userId: string
  expenseTypeId: string
  title: string
  amount: number
  expenseDate: string
  paymentMode: "cash" | "bank" | "upi" | "card" | "other"
  vendor?: string
  notes?: string
  billNumber?: string
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  user: UserDetails
  expenseType: ExpenseTypeDetails
}

interface PaginationDetails {
  page: number
  limit: number
  total: number
  pages: number
}

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

export default function ExpenseManagementPage() {
  // Modal States
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isViewOpen, setIsViewOpen] = React.useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false)
  const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = React.useState(false)

  // Record Targets
  const [selectedExpense, setSelectedExpense] = React.useState<ExpenseRecord | null>(null)
  const [recordToDelete, setRecordToDelete] = React.useState<ExpenseRecord | null>(null)
  const [recordToRestore, setRecordToRestore] = React.useState<ExpenseRecord | null>(null)

  // Search and Filter States
  const [search, setSearch] = React.useState("")
  const [expenseTypeIdFilter, setExpenseTypeIdFilter] = React.useState("all")
  const [paymentModeFilter, setPaymentModeFilter] = React.useState("all")
  const [isDeletedFilter, setIsDeletedFilter] = React.useState("false") // "false" | "true" | "all"
  const [userIdFilter, setUserIdFilter] = React.useState("all")
  const [fromDate, setFromDate] = React.useState("")
  const [toDate, setToDate] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(20)

  // Add Form States
  const [addTitle, setAddTitle] = React.useState("")
  const [addExpenseTypeId, setAddExpenseTypeId] = React.useState("")
  const [addAmount, setAddAmount] = React.useState("")
  const [addPaymentMode, setAddPaymentMode] = React.useState<"cash" | "bank" | "upi" | "card" | "other">("cash")
  const [addVendor, setAddVendor] = React.useState("")
  const [addBillNumber, setAddBillNumber] = React.useState("")
  const [addNotes, setAddNotes] = React.useState("")
  const [addUserId, setAddUserId] = React.useState("") // Admin only selection
  const [addErrors, setAddErrors] = React.useState<Record<string, string>>({})

  // Edit Form States
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editTitle, setEditTitle] = React.useState("")
  const [editExpenseTypeId, setEditExpenseTypeId] = React.useState("")
  const [editAmount, setEditAmount] = React.useState("")
  const [editExpenseDate, setEditExpenseDate] = React.useState("")
  const [editPaymentMode, setEditPaymentMode] = React.useState<"cash" | "bank" | "upi" | "card" | "other">("cash")
  const [editVendor, setEditVendor] = React.useState("")
  const [editBillNumber, setEditBillNumber] = React.useState("")
  const [editNotes, setEditNotes] = React.useState("")
  const [editUserId, setEditUserId] = React.useState("") // Admin only selection
  const [editErrors, setEditErrors] = React.useState<Record<string, string>>({})

  // Fetch Current Logged-in User (uses Infinity cache from layout.tsx)
  const { data: meData } = useQuery<{ user: UserDetails }>({
    queryKey: ["currentUser"],
    staleTime: Infinity,
  })

  const isAdmin = meData?.user?.role === "admin"

  // Fetch all registered users (Admin Only dropdown population)
  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/v1/user", {
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      return response.json() // Expects { users: [...] }
    },
    enabled: isAdmin,
  })
  const usersList = usersData?.users || []

  // Fetch all active/inactive Expense Types
  const { data: expenseTypesData } = useQuery({
    queryKey: ["expense-types"],
    queryFn: async () => {
      const response = await fetch("/api/v1/expense-types", {
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        throw new Error("Failed to fetch expense types")
      }
      return response.json() // Expects { expenseTypes: [...] }
    },
  })
  const expenseTypesList = expenseTypesData?.expenseTypes || []

  // Fetch filtered Expenses list
  const queryParams = new URLSearchParams()
  if (search) queryParams.set("search", search)
  if (expenseTypeIdFilter !== "all") queryParams.set("expenseTypeId", expenseTypeIdFilter)
  if (paymentModeFilter !== "all") queryParams.set("paymentMode", paymentModeFilter)
  if (isDeletedFilter !== "all") queryParams.set("isDeleted", isDeletedFilter)
  if (isAdmin && userIdFilter !== "all") queryParams.set("userId", userIdFilter)
  if (fromDate) queryParams.set("fromDate", fromDate)
  if (toDate) queryParams.set("toDate", toDate)
  queryParams.set("page", String(page))
  queryParams.set("limit", String(limit))

  const { data: expensesData, isLoading: isListLoading, refetch } = useQuery({
    queryKey: ["expenses", search, expenseTypeIdFilter, paymentModeFilter, isDeletedFilter, userIdFilter, fromDate, toDate, page, limit],
    queryFn: async () => {
      const response = await fetch(`/api/v1/expenses?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to fetch expenses")
      }
      return response.json() // Expects { expenses: [...], pagination: {...} }
    },
  })
  const expenses = expensesData?.expenses || []
  const pagination: PaginationDetails = expensesData?.pagination || { page: 1, limit: 20, total: 0, pages: 1 }
  const totalAmount = expensesData?.totalAmount || 0

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (newRecord: any) => {
      const response = await fetch("/api/v1/expenses", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newRecord),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to create expense")
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success("Expense successfully created!")
      refetch()
      setIsAddOpen(false)
      // reset form
      setAddTitle("")
      setAddExpenseTypeId("")
      setAddAmount("")
      setAddPaymentMode("cash")
      setAddVendor("")
      setAddBillNumber("")
      setAddNotes("")
      setAddUserId("")
      setAddErrors({})
    },
    onError: (error: Error) => {
      setAddErrors({ general: error.message })
      toast.error(error.message || "Failed to create expense")
    },
  })

  // Edit Mutation
  const editMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const response = await fetch(`/api/v1/expenses/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update expense")
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success("Expense details successfully updated!")
      refetch()
      setIsEditOpen(false)
      setEditingId(null)
      setEditErrors({})
    },
    onError: (error: Error) => {
      setEditErrors({ general: error.message })
      toast.error(error.message || "Failed to update expense")
    },
  })

  // Soft Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/expenses/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete expense")
      }
      return true
    },
    onSuccess: () => {
      toast.success("Expense deleted successfully!")
      refetch()
      setIsDeleteConfirmOpen(false)
      setRecordToDelete(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete expense")
    },
  })

  // Restore Mutation
  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/expenses/${id}/restore`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to restore expense")
      }
      return true
    },
    onSuccess: () => {
      toast.success("Expense restored successfully!")
      refetch()
      setIsRestoreConfirmOpen(false)
      setRecordToRestore(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to restore expense")
    },
  })

  const validateAddForm = () => {
    const errs: Record<string, string> = {}
    if (!addTitle.trim()) errs.title = "Title is required"
    if (!addExpenseTypeId) errs.expenseTypeId = "Expense Type is required"
    if (!addAmount) {
      errs.amount = "Amount is required"
    } else if (Number(addAmount) <= 0) {
      errs.amount = "Amount must be greater than zero"
    }

    setAddErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAddErrors({})

    if (!validateAddForm()) return

    createMutation.mutate({
      title: addTitle.trim(),
      expenseTypeId: addExpenseTypeId,
      amount: Number(addAmount),
      paymentMode: addPaymentMode,
      vendor: addVendor.trim() || undefined,
      billNumber: addBillNumber.trim() || undefined,
      notes: addNotes.trim() || undefined,
      userId: isAdmin && addUserId ? addUserId : undefined,
    })
  }

  const openEditModal = (record: ExpenseRecord) => {
    setEditingId(record.id)
    setEditTitle(record.title)
    setEditExpenseTypeId(record.expenseTypeId)
    setEditAmount(String(record.amount))
    setEditExpenseDate(record.expenseDate.split("T")[0])
    setEditPaymentMode(record.paymentMode)
    setEditVendor(record.vendor || "")
    setEditBillNumber(record.billNumber || "")
    setEditNotes(record.notes || "")
    setEditUserId(record.userId)
    setEditErrors({})
    setIsEditOpen(true)
  }

  const validateEditForm = () => {
    const errs: Record<string, string> = {}
    if (!editTitle.trim()) errs.title = "Title is required"
    if (!editExpenseTypeId) errs.expenseTypeId = "Expense Type is required"
    if (!editAmount) {
      errs.amount = "Amount is required"
    } else if (Number(editAmount) <= 0) {
      errs.amount = "Amount must be greater than zero"
    }
    if (!editExpenseDate) errs.expenseDate = "Date is required"

    setEditErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEditErrors({})

    if (!validateEditForm()) return
    if (!editingId) return

    editMutation.mutate({
      id: editingId,
      payload: {
        title: editTitle.trim(),
        expenseTypeId: editExpenseTypeId,
        amount: Number(editAmount),
        expenseDate: new Date(editExpenseDate).toISOString(),
        paymentMode: editPaymentMode,
        vendor: editVendor.trim() || "",
        billNumber: editBillNumber.trim() || "",
        notes: editNotes.trim() || "",
        userId: isAdmin ? editUserId : undefined,
      },
    })
  }

  const handleDeleteClick = (expense: ExpenseRecord) => {
    setRecordToDelete(expense)
    setIsDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      deleteMutation.mutate(recordToDelete.id)
    }
  }

  const isActionPending = createMutation.isPending || editMutation.isPending || deleteMutation.isPending || restoreMutation.isPending

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Expense Records</h1>
          <p className="text-muted-foreground mt-1">
            Log, filter, inspect, and manage expense transactions across standard categories.
          </p>
        </div>

        <Button
          onClick={() => {
            setAddErrors({})
            setIsAddOpen(true)
          }}
          className="gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer self-start sm:self-center"
        >
          <Plus className="h-4.5 w-4.5" />
          New Expense
        </Button>
      </div>

      {/* Filters Section */}
      <Card className="border-border/50 shadow-xs">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">Search Title/Vendor</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Type to search..."
                  className="pl-9 text-xs h-9"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                />
              </div>
            </div>

            {/* Expense Type Select */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">Expense Type</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                value={expenseTypeIdFilter}
                onChange={(e) => {
                  setExpenseTypeIdFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="all">All Expense Types</option>
                {expenseTypesList.map((type: ExpenseTypeDetails) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            {/* Payment Mode Select */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">Payment Mode</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                value={paymentModeFilter}
                onChange={(e) => {
                  setPaymentModeFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="all">All Payment Modes</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="upi">UPI / QR Code</option>
                <option value="card">Debit/Credit Card</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Deleted Status Select */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">Deleted Records</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                value={isDeletedFilter}
                onChange={(e) => {
                  setIsDeletedFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="false">Active Only</option>
                <option value="true">Deleted Only</option>
                <option value="all">All Records</option>
              </select>
            </div>

            {/* User Selection Filter (Admin Only) */}
            {isAdmin && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground">Created By (Admin)</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  value={userIdFilter}
                  onChange={(e) => {
                    setUserIdFilter(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="all">All Users</option>
                  {usersList.map((usr: UserDetails) => (
                    <option key={usr.id} value={usr.id}>{usr.userName} ({usr.role})</option>
                  ))}
                </select>
              </div>
            )}

            {/* From Date */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">From Date</Label>
              <Input
                type="date"
                className="text-xs h-9"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value)
                  setPage(1)
                }}
              />
            </div>

            {/* To Date */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">To Date</Label>
              <Input
                type="date"
                className="text-xs h-9"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value)
                  setPage(1)
                }}
              />
            </div>

            {/* Limit Selection */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">Page Size</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value))
                  setPage(1)
                }}
              >
                <option value={10}>10 items</option>
                <option value={20}>20 items</option>
                <option value={50}>50 items</option>
                <option value={100}>100 items</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Expenses Table */}
      {isListLoading ? (
        <div className="flex h-[30vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card className="border-border/50 shadow-xs overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/40 bg-card/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 space-y-0">
            <div>
              <CardTitle className="text-lg font-bold">Transaction Entries</CardTitle>
              <CardDescription>
                A total of {pagination.total} records found matching the active filtering rules.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-xl font-bold text-sm self-start sm:self-center">
              <span className="text-xs font-semibold text-primary/70">Filtered Total:</span>
              <span>${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/10">
                    <TableHead className="font-semibold py-3.5 pl-6">Date</TableHead>
                    <TableHead className="font-semibold py-3.5">Title</TableHead>
                    <TableHead className="font-semibold py-3.5 hidden sm:table-cell">Type</TableHead>
                    <TableHead className="font-semibold py-3.5 text-right">Amount</TableHead>
                    <TableHead className="font-semibold py-3.5 hidden sm:table-cell">Payment Mode</TableHead>
                    <TableHead className="font-semibold py-3.5 hidden md:table-cell">Vendor</TableHead>
                    <TableHead className="font-semibold py-3.5 hidden lg:table-cell">Bill Number</TableHead>
                    <TableHead className="font-semibold py-3.5 hidden md:table-cell">Created By</TableHead>
                    <TableHead className="font-semibold py-3.5">Status</TableHead>
                    <TableHead className="font-semibold py-3.5 text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">
                        No expenses logged. Click "New Expense" to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((expense: ExpenseRecord) => (
                      <TableRow key={expense.id} className={cn("hover:bg-muted/20 transition-colors", expense.isDeleted && "bg-destructive/5 text-muted-foreground")}>
                        <td className="py-3.5 pl-6 text-xs whitespace-nowrap">
                          {new Date(expense.expenseDate).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3.5 font-medium text-foreground text-xs max-w-[150px] truncate">
                          {expense.title}
                        </td>
                        <td className="py-3.5 text-xs hidden sm:table-cell">
                          <span className="inline-flex items-center gap-1">
                            <Tag className="h-3 w-3 text-muted-foreground" />
                            {expense.expenseType?.name || "Uncategorized"}
                          </span>
                        </td>
                        <td className="py-3.5 text-xs text-right font-bold text-foreground">
                          ${expense.amount.toFixed(2)}
                        </td>
                        <td className="py-3.5 text-xs hidden sm:table-cell capitalize">
                          {expense.paymentMode}
                        </td>
                        <td className="py-3.5 text-xs hidden md:table-cell max-w-[100px] truncate">
                          {expense.vendor || "—"}
                        </td>
                        <td className="py-3.5 text-xs hidden lg:table-cell font-mono text-[10px]">
                          {expense.billNumber || "—"}
                        </td>
                        <td className="py-3.5 text-[11px] hidden md:table-cell max-w-[120px] truncate">
                          <div>
                            <p className="font-medium text-foreground">{expense.user?.userName}</p>
                            <p className="text-[9px] text-muted-foreground">{expense.user?.email}</p>
                          </div>
                        </td>
                        <td className="py-3.5 text-xs">
                          {expense.isDeleted ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-destructive/15 text-destructive border border-destructive/20 uppercase tracking-wider">
                              Deleted
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-right pr-6">
                          <div className="flex items-center justify-end gap-1">
                            {/* View Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedExpense(expense)
                                setIsViewOpen(true)
                              }}
                              className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                              aria-label="View Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>

                            {/* Edit Button (Only editable if not deleted) */}
                            {!expense.isDeleted && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditModal(expense)}
                                disabled={isActionPending}
                                className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                                aria-label="Edit Expense"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                            )}

                            {/* Restore Button (Admin only & Only if deleted) */}
                            {expense.isDeleted && isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setRecordToRestore(expense)
                                  setIsRestoreConfirmOpen(true)
                                }}
                                disabled={isActionPending}
                                className="h-7 w-7 text-emerald-600 hover:text-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
                                aria-label="Restore Record"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </Button>
                            )}

                            {/* Delete Button (Only if not already deleted) */}
                            {!expense.isDeleted && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(expense)}
                                disabled={isActionPending}
                                className="h-7 w-7 text-destructive/80 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                aria-label="Delete Expense"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-card/10 select-none">
                <p className="text-xs text-muted-foreground">
                  Showing page <span className="font-semibold text-foreground">{pagination.page}</span> of <span className="font-semibold text-foreground">{pagination.pages}</span> ({pagination.total} total items)
                </p>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs cursor-pointer"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1 || isListLoading}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((idx) => (
                    <Button
                      key={idx}
                      variant={idx === page ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8 text-xs cursor-pointer"
                      onClick={() => setPage(idx)}
                      disabled={isListLoading}
                    >
                      {idx}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs cursor-pointer"
                    onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pages))}
                    disabled={page === pagination.pages || isListLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200"
            onClick={() => !createMutation.isPending && setIsAddOpen(false)}
          />

          <Card className="w-full max-w-lg relative z-10 border-border bg-card/95 backdrop-blur-xl shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddOpen(false)}
              disabled={createMutation.isPending}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-md p-1.5 bg-muted/50 border border-border/50 cursor-pointer"
              aria-label="Close add dialog"
            >
              <X className="h-4 w-4" />
            </button>

            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Add New Expense
              </CardTitle>
              <CardDescription>File a new expense transaction into the system.</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                {addErrors.general && (
                  <div className="rounded-lg bg-destructive/15 p-3 text-xs font-medium text-destructive border border-destructive/20 flex gap-2 items-start">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{addErrors.general}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="add-title" className="text-xs font-semibold text-muted-foreground">Title</Label>
                    <Input
                      id="add-title"
                      type="text"
                      placeholder="e.g. Office catering payment"
                      value={addTitle}
                      onChange={(e) => setAddTitle(e.target.value)}
                      disabled={createMutation.isPending}
                    />
                    {addErrors.title && <p className="text-[10px] text-destructive font-medium">{addErrors.title}</p>}
                  </div>

                  {/* Expense Type Select */}
                  <div className="space-y-1">
                    <Label htmlFor="add-type" className="text-xs font-semibold text-muted-foreground">Expense Type</Label>
                    <select
                      id="add-type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                      value={addExpenseTypeId}
                      onChange={(e) => setAddExpenseTypeId(e.target.value)}
                      disabled={createMutation.isPending}
                    >
                      <option value="">Select Category...</option>
                      {expenseTypesList.filter((t: ExpenseTypeDetails) => t.isActive).map((type: ExpenseTypeDetails) => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                    {addErrors.expenseTypeId && <p className="text-[10px] text-destructive font-medium">{addErrors.expenseTypeId}</p>}
                  </div>

                  {/* Amount */}
                  <div className="space-y-1">
                    <Label htmlFor="add-amount" className="text-xs font-semibold text-muted-foreground">Amount ($)</Label>
                    <Input
                      id="add-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      disabled={createMutation.isPending}
                    />
                    {addErrors.amount && <p className="text-[10px] text-destructive font-medium">{addErrors.amount}</p>}
                  </div>



                  {/* Payment Mode */}
                  <div className="space-y-1">
                    <Label htmlFor="add-pay" className="text-xs font-semibold text-muted-foreground">Payment Mode</Label>
                    <select
                      id="add-pay"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                      value={addPaymentMode}
                      onChange={(e) => setAddPaymentMode(e.target.value as any)}
                      disabled={createMutation.isPending}
                    >
                      <option value="cash">Cash</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="upi">UPI / QR Code</option>
                      <option value="card">Debit/Credit Card</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Vendor */}
                  <div className="space-y-1">
                    <Label htmlFor="add-vendor" className="text-xs font-semibold text-muted-foreground">Vendor / Payee</Label>
                    <Input
                      id="add-vendor"
                      type="text"
                      placeholder="e.g. Walmart Inc."
                      value={addVendor}
                      onChange={(e) => setAddVendor(e.target.value)}
                      disabled={createMutation.isPending}
                    />
                  </div>

                  {/* Bill Number */}
                  <div className="space-y-1">
                    <Label htmlFor="add-bill" className="text-xs font-semibold text-muted-foreground">Bill / Invoice Number</Label>
                    <Input
                      id="add-bill"
                      type="text"
                      placeholder="e.g. INV-2026-004"
                      value={addBillNumber}
                      onChange={(e) => setAddBillNumber(e.target.value)}
                      disabled={createMutation.isPending}
                    />
                  </div>

                  {/* User Assignment selection (Admin Only) */}
                  {isAdmin && (
                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor="add-user-id" className="text-xs font-semibold text-muted-foreground">Assign to User (Admin Only)</Label>
                      <select
                        id="add-user-id"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                        value={addUserId}
                        onChange={(e) => setAddUserId(e.target.value)}
                        disabled={createMutation.isPending}
                      >
                        <option value="">Myself (Logged-in Admin)</option>
                        {usersList.map((usr: UserDetails) => (
                          <option key={usr.id} value={usr.id}>{usr.userName} ({usr.email})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="add-notes" className="text-xs font-semibold text-muted-foreground">Internal Notes (Optional)</Label>
                    <textarea
                      id="add-notes"
                      rows={3}
                      placeholder="Brief remarks or explanation of transaction..."
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={addNotes}
                      onChange={(e) => setAddNotes(e.target.value)}
                      disabled={createMutation.isPending}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full relative transition-all active:scale-[0.98] cursor-pointer mt-4" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Save Expense Entry"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200"
            onClick={() => !editMutation.isPending && setIsEditOpen(false)}
          />

          <Card className="w-full max-w-lg relative z-10 border-border bg-card/95 backdrop-blur-xl shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsEditOpen(false)
                setEditingId(null)
              }}
              disabled={editMutation.isPending}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-md p-1.5 bg-muted/50 border border-border/50 cursor-pointer"
              aria-label="Close edit dialog"
            >
              <X className="h-4 w-4" />
            </button>

            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Edit2 className="h-4.5 w-4.5 text-primary" />
                Edit Expense Details
              </CardTitle>
              <CardDescription>Modify properties of this recorded expense.</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                {editErrors.general && (
                  <div className="rounded-lg bg-destructive/15 p-3 text-xs font-medium text-destructive border border-destructive/20 flex gap-2 items-start">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{editErrors.general}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="edit-title" className="text-xs font-semibold text-muted-foreground">Title</Label>
                    <Input
                      id="edit-title"
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      disabled={editMutation.isPending}
                    />
                    {editErrors.title && <p className="text-[10px] text-destructive font-medium">{editErrors.title}</p>}
                  </div>

                  {/* Expense Type Select */}
                  <div className="space-y-1">
                    <Label htmlFor="edit-type" className="text-xs font-semibold text-muted-foreground">Expense Type</Label>
                    <select
                      id="edit-type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                      value={editExpenseTypeId}
                      onChange={(e) => setEditExpenseTypeId(e.target.value)}
                      disabled={editMutation.isPending}
                    >
                      {expenseTypesList.map((type: ExpenseTypeDetails) => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                    {editErrors.expenseTypeId && <p className="text-[10px] text-destructive font-medium">{editErrors.expenseTypeId}</p>}
                  </div>

                  {/* Amount */}
                  <div className="space-y-1">
                    <Label htmlFor="edit-amount" className="text-xs font-semibold text-muted-foreground">Amount ($)</Label>
                    <Input
                      id="edit-amount"
                      type="number"
                      step="0.01"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      disabled={editMutation.isPending}
                    />
                    {editErrors.amount && <p className="text-[10px] text-destructive font-medium">{editErrors.amount}</p>}
                  </div>

                  {/* Date */}
                  <div className="space-y-1">
                    <Label htmlFor="edit-date" className="text-xs font-semibold text-muted-foreground">Transaction Date</Label>
                    <Input
                      id="edit-date"
                      type="date"
                      value={editExpenseDate}
                      onChange={(e) => setEditExpenseDate(e.target.value)}
                      disabled={editMutation.isPending}
                    />
                    {editErrors.expenseDate && <p className="text-[10px] text-destructive font-medium">{editErrors.expenseDate}</p>}
                  </div>

                  {/* Payment Mode */}
                  <div className="space-y-1">
                    <Label htmlFor="edit-pay" className="text-xs font-semibold text-muted-foreground">Payment Mode</Label>
                    <select
                      id="edit-pay"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                      value={editPaymentMode}
                      onChange={(e) => setEditPaymentMode(e.target.value as any)}
                      disabled={editMutation.isPending}
                    >
                      <option value="cash">Cash</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="upi">UPI / QR Code</option>
                      <option value="card">Debit/Credit Card</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Vendor */}
                  <div className="space-y-1">
                    <Label htmlFor="edit-vendor" className="text-xs font-semibold text-muted-foreground">Vendor / Payee</Label>
                    <Input
                      id="edit-vendor"
                      type="text"
                      value={editVendor}
                      onChange={(e) => setEditVendor(e.target.value)}
                      disabled={editMutation.isPending}
                    />
                  </div>

                  {/* Bill Number */}
                  <div className="space-y-1">
                    <Label htmlFor="edit-bill" className="text-xs font-semibold text-muted-foreground">Bill / Invoice Number</Label>
                    <Input
                      id="edit-bill"
                      type="text"
                      value={editBillNumber}
                      onChange={(e) => setEditBillNumber(e.target.value)}
                      disabled={editMutation.isPending}
                    />
                  </div>

                  {/* User Assignment selection (Admin Only) */}
                  {isAdmin && (
                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor="edit-user-id" className="text-xs font-semibold text-muted-foreground">Assign to User (Admin Only)</Label>
                      <select
                        id="edit-user-id"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                        value={editUserId}
                        onChange={(e) => setEditUserId(e.target.value)}
                        disabled={editMutation.isPending}
                      >
                        {usersList.map((usr: UserDetails) => (
                          <option key={usr.id} value={usr.id}>{usr.userName} ({usr.email})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="edit-notes" className="text-xs font-semibold text-muted-foreground">Internal Notes (Optional)</Label>
                    <textarea
                      id="edit-notes"
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      disabled={editMutation.isPending}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full relative transition-all active:scale-[0.98] cursor-pointer mt-4" disabled={editMutation.isPending}>
                  {editMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Details Modal */}
      {isViewOpen && selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200"
            onClick={() => setIsViewOpen(false)}
          />

          <Card className="w-full max-w-md relative z-10 border-border bg-card/95 backdrop-blur-xl shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            <button
              onClick={() => {
                setIsViewOpen(false)
                setSelectedExpense(null)
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-md p-1.5 bg-muted/50 border border-border/50 cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>

            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Expense Details
              </CardTitle>
              <CardDescription>Filing database index record reference.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
              <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1.5">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Title</span>
                <p className="text-sm font-bold text-foreground">{selectedExpense.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Amount</span>
                  <p className="text-sm font-extrabold text-foreground">${selectedExpense.amount.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Expense Date</span>
                  <p className="text-xs font-semibold text-foreground">
                    {new Date(selectedExpense.expenseDate).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Payment Mode</span>
                  <p className="text-xs font-semibold capitalize text-foreground">{selectedExpense.paymentMode}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Category Type</span>
                  <p className="text-xs font-semibold text-foreground">{selectedExpense.expenseType?.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Vendor</span>
                  <p className="text-xs font-semibold text-foreground">{selectedExpense.vendor || "—"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Bill Number</span>
                  <p className="text-xs font-semibold text-foreground font-mono">{selectedExpense.billNumber || "—"}</p>
                </div>
              </div>

              <div className="border-t border-border/30 pt-3 space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-muted-foreground">Filed By:</span>
                  <span className="font-semibold text-foreground">{selectedExpense.user?.userName} ({selectedExpense.user?.email})</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-muted-foreground">Filing Status:</span>
                  <span className={cn(
                    "font-semibold uppercase tracking-wider",
                    selectedExpense.isDeleted ? "text-destructive" : "text-primary"
                  )}>
                    {selectedExpense.isDeleted ? "Soft Deleted" : "Active / Verified"}
                  </span>
                </div>
                {selectedExpense.isDeleted && selectedExpense.deletedAt && (
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-muted-foreground">Deleted At:</span>
                    <span className="font-semibold text-foreground">{selectedExpense.deletedAt.split("T")[0]}</span>
                  </div>
                )}
              </div>

              {selectedExpense.notes && (
                <div className="border-t border-border/30 pt-3 space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Internal Notes</span>
                  <p className="text-[11px] leading-relaxed text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/40 whitespace-pre-wrap">
                    {selectedExpense.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false)
          setRecordToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Expense Record"
        description={`Are you sure you want to soft delete the expense "${recordToDelete?.title}"? It can be restored later by an administrator.`}
        confirmText="Soft Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />

      {/* Restore Confirmation */}
      <ConfirmationModal
        isOpen={isRestoreConfirmOpen}
        onClose={() => {
          setIsRestoreConfirmOpen(false)
          setRecordToRestore(null)
        }}
        onConfirm={() => recordToRestore && restoreMutation.mutate(recordToRestore.id)}
        title="Restore Expense Record"
        description={`Are you sure you want to restore the expense "${recordToRestore?.title}" back to active status?`}
        confirmText="Restore Record"
        variant="info"
        isLoading={restoreMutation.isPending}
      />
    </div>
  )
}
