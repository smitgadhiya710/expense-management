"use client"

import * as React from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import {
  FileText,
  Loader2,
  Trash2,
  Edit2,
  X,
  Plus,
  AlertCircle,
  Tag,
  FolderOpen
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

interface ExpenseTypeRecord {
  id: string
  name: string
  key: string
  description?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
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

// Slugify string helper
const toKey = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function ExpenseTypeManagementPage() {
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false)
  const [recordToDelete, setRecordToDelete] = React.useState<ExpenseTypeRecord | null>(null)

  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)

  // Add Form States
  const [addName, setAddName] = React.useState("")
  const [addKey, setAddKey] = React.useState("")
  const [addDescription, setAddDescription] = React.useState("")
  const [addIsActive, setAddIsActive] = React.useState(true)
  const [isKeyManuallyEdited, setIsKeyManuallyEdited] = React.useState(false)
  const [addErrors, setAddErrors] = React.useState<Record<string, string>>({})

  // Edit Form States
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editName, setEditName] = React.useState("")
  const [editKey, setEditKey] = React.useState("")
  const [editDescription, setEditDescription] = React.useState("")
  const [editIsActive, setEditIsActive] = React.useState(true)
  const [editErrors, setEditErrors] = React.useState<Record<string, string>>({})

  // 1. Fetch all expense types
  const { data: expenseTypesData, isLoading: isListLoading, refetch } = useQuery({
    queryKey: ["expense-types", page, limit],
    queryFn: async () => {
      const response = await fetch(`/api/v1/expense-types?page=${page}&limit=${limit}`, {
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to fetch expense types")
      }
      return response.json() // Expecting { expenseTypes: [...], pagination: {...} }
    },
  })

  // 2. Create Mutation
  const createMutation = useMutation({
    mutationFn: async (newRecord: any) => {
      const response = await fetch("/api/v1/expense-types", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newRecord),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to create expense type")
      }
      return response.json()
    },
    onSuccess: (data) => {
      toast.success(`Expense type "${data.expenseType.name}" successfully created!`)
      refetch()
      setIsAddOpen(false)
      setAddName("")
      setAddKey("")
      setAddDescription("")
      setAddIsActive(true)
      setIsKeyManuallyEdited(false)
      setAddErrors({})
    },
    onError: (error: Error) => {
      setAddErrors({ general: error.message })
      toast.error(error.message || "Failed to create expense type")
    },
  })

  // 3. Edit Mutation
  const editMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const response = await fetch(`/api/v1/expense-types/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update expense type")
      }
      return response.json()
    },
    onSuccess: (data) => {
      toast.success(`Expense type "${data.expenseType.name}" successfully updated!`)
      refetch()
      setIsEditOpen(false)
      setEditingId(null)
      setEditErrors({})
    },
    onError: (error: Error) => {
      setEditErrors({ general: error.message })
      toast.error(error.message || "Failed to update expense type")
    },
  })

  // 4. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/expense-types/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete expense type")
      }
      return true
    },
    onSuccess: () => {
      toast.success("Expense type deleted successfully!")
      refetch()
      setIsDeleteConfirmOpen(false)
      setRecordToDelete(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete expense type")
    },
  })

  // Auto-slugify key on name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAddName(value)
    if (!isKeyManuallyEdited) {
      setAddKey(toKey(value))
    }
  }

  // Handle manual edits to the key field
  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAddKey(value)
    setIsKeyManuallyEdited(true)
  }

  const validateAddForm = () => {
    const errs: Record<string, string> = {}
    if (!addName.trim()) {
      errs.name = "Name is required"
    } else if (addName.length < 2 || addName.length > 100) {
      errs.name = "Name must be 2-100 characters"
    }

    const currentKey = addKey.trim() || toKey(addName)
    if (!currentKey) {
      errs.key = "Key is required"
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(currentKey)) {
      errs.key = "Key must be lowercase and hyphenated (e.g., travel-expense)"
    } else if (currentKey.length < 2 || currentKey.length > 100) {
      errs.key = "Key must be 2-100 characters"
    }

    if (addDescription.length > 500) {
      errs.description = "Description cannot exceed 500 characters"
    }

    setAddErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAddErrors({})

    if (!validateAddForm()) return

    createMutation.mutate({
      name: addName.trim(),
      key: addKey.trim() || toKey(addName),
      description: addDescription.trim() || undefined,
      isActive: addIsActive,
    })
  }

  const openEditModal = (record: ExpenseTypeRecord) => {
    setEditingId(record.id)
    setEditName(record.name)
    setEditKey(record.key)
    setEditDescription(record.description || "")
    setEditIsActive(record.isActive)
    setEditErrors({})
    setIsEditOpen(true)
  }

  const validateEditForm = () => {
    const errs: Record<string, string> = {}
    if (!editName.trim()) {
      errs.name = "Name is required"
    } else if (editName.length < 2 || editName.length > 100) {
      errs.name = "Name must be 2-100 characters"
    }

    const currentKey = editKey.trim() || toKey(editName)
    if (!currentKey) {
      errs.key = "Key is required"
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(currentKey)) {
      errs.key = "Key must be lowercase and hyphenated (e.g., travel-expense)"
    } else if (currentKey.length < 2 || currentKey.length > 100) {
      errs.key = "Key must be 2-100 characters"
    }

    if (editDescription.length > 500) {
      errs.description = "Description cannot exceed 500 characters"
    }

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
        name: editName.trim(),
        key: editKey.trim() || toKey(editName),
        description: editDescription.trim() || "",
        isActive: editIsActive,
      },
    })
  }

  const handleDeleteClick = (record: ExpenseTypeRecord) => {
    setRecordToDelete(record)
    setIsDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      deleteMutation.mutate(recordToDelete.id)
    }
  }

  interface PaginationDetails {
    page: number
    limit: number
    total: number
    pages: number
  }

  const expenseTypes = expenseTypesData?.expenseTypes || []
  const pagination: PaginationDetails = expenseTypesData?.pagination || { page: 1, limit: 20, total: 0, pages: 1 }
  const isActionPending = createMutation.isPending || editMutation.isPending || deleteMutation.isPending

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Expense Types</h1>
          <p className="text-muted-foreground mt-1">
            Manage category structures and valid types for expense processing.
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
          New Type
        </Button>
      </div>

      {/* Main List Table */}
      {isListLoading ? (
        <div className="flex h-[30vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card className="border-border/50 shadow-xs overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/40 bg-card/20">
            <CardTitle className="text-lg font-bold">Expense Type Configurations</CardTitle>
            <CardDescription>
              Registered configurations specifying code names and active system filters.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/10">
                    <TableHead className="font-semibold py-3.5 pl-6">Name</TableHead>
                    <TableHead className="font-semibold py-3.5 hidden sm:table-cell">Key Slug</TableHead>
                    <TableHead className="font-semibold py-3.5 hidden md:table-cell">Description</TableHead>
                    <TableHead className="font-semibold py-3.5">Status</TableHead>
                    <TableHead className="font-semibold py-3.5 text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseTypes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No expense types found. Click "New Type" to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenseTypes.map((record: ExpenseTypeRecord) => (
                      <TableRow key={record.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 pl-6 font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                              <Tag className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span>{record.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-muted-foreground hidden sm:table-cell font-mono text-xs">
                          {record.key}
                        </td>
                        <td className="py-3.5 text-muted-foreground hidden md:table-cell max-w-xs truncate">
                          {record.description || "—"}
                        </td>
                        <td className="py-3.5">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
                            record.isActive
                              ? "text-primary bg-primary/10 border border-primary/20"
                              : "text-muted-foreground bg-muted border border-border"
                          )}>
                            {record.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3.5 text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditModal(record)}
                              disabled={isActionPending}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                              aria-label={`Edit ${record.name}`}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(record)}
                              disabled={isActionPending}
                              className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                              aria-label={`Delete ${record.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
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
                <div className="flex items-center gap-4">
                  <p className="text-xs text-muted-foreground">
                    Showing page <span className="font-semibold text-foreground">{pagination.page}</span> of <span className="font-semibold text-foreground">{pagination.pages}</span> ({pagination.total} total items)
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>Show</span>
                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value))
                        setPage(1)
                      }}
                      className="h-7 rounded border border-border bg-card text-[11px] px-1.5 cursor-pointer focus:outline-none"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span>per page</span>
                  </div>
                </div>

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

      {/* Add Dialog */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200"
            onClick={() => !createMutation.isPending && setIsAddOpen(false)}
          />

          <Card className="w-full max-w-md relative z-10 border-border bg-card/95 backdrop-blur-xl shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            <button
              onClick={() => setIsAddOpen(false)}
              disabled={createMutation.isPending}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-md p-1.5 bg-muted/50 border border-border/50 cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>

            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Add Expense Type
              </CardTitle>
              <CardDescription>Create a new valid type category for expense filings.</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                {addErrors.general && (
                  <div className="rounded-lg bg-destructive/15 p-3 text-xs font-medium text-destructive border border-destructive/20 flex gap-2 items-start">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{addErrors.general}</span>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1">
                  <Label htmlFor="add-name" className="text-xs font-semibold text-muted-foreground">Name</Label>
                  <Input
                    id="add-name"
                    type="text"
                    placeholder="e.g. Travel & Lodging"
                    value={addName}
                    onChange={handleNameChange}
                    disabled={createMutation.isPending}
                  />
                  {addErrors.name && <p className="text-[10px] text-destructive font-medium">{addErrors.name}</p>}
                </div>

                {/* Key */}
                <div className="space-y-1">
                  <Label htmlFor="add-key" className="text-xs font-semibold text-muted-foreground">Key Slug</Label>
                  <Input
                    id="add-key"
                    type="text"
                    placeholder="e.g. travel-lodging"
                    value={addKey}
                    onChange={handleKeyChange}
                    disabled={createMutation.isPending}
                  />
                  <p className="text-[9px] text-muted-foreground">Used for backend matching. Hyphenated lowercase only.</p>
                  {addErrors.key && <p className="text-[10px] text-destructive font-medium">{addErrors.key}</p>}
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <Label htmlFor="add-description" className="text-xs font-semibold text-muted-foreground">Description (Optional)</Label>
                  <textarea
                    id="add-description"
                    rows={3}
                    placeholder="Provide a brief explanation of what falls under this type..."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={addDescription}
                    onChange={(e) => setAddDescription(e.target.value)}
                    disabled={createMutation.isPending}
                  />
                  {addErrors.description && <p className="text-[10px] text-destructive font-medium">{addErrors.description}</p>}
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between py-2 border-t border-border/40">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Active Status</Label>
                    <p className="text-[10px] text-muted-foreground">Toggle availability for reporting.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={addIsActive}
                    onChange={(e) => setAddIsActive(e.target.checked)}
                    disabled={createMutation.isPending}
                    className="h-4.5 w-4.5 rounded border-input bg-background text-primary accent-primary cursor-pointer disabled:opacity-50"
                  />
                </div>

                <Button type="submit" className="w-full relative transition-all active:scale-[0.98] cursor-pointer mt-4" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Save Expense Type"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Dialog */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200"
            onClick={() => !editMutation.isPending && setIsEditOpen(false)}
          />

          <Card className="w-full max-w-md relative z-10 border-border bg-card/95 backdrop-blur-xl shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
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
                Edit Expense Type
              </CardTitle>
              <CardDescription>Update configuration details for this category.</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                {editErrors.general && (
                  <div className="rounded-lg bg-destructive/15 p-3 text-xs font-medium text-destructive border border-destructive/20 flex gap-2 items-start">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{editErrors.general}</span>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1">
                  <Label htmlFor="edit-name" className="text-xs font-semibold text-muted-foreground">Name</Label>
                  <Input
                    id="edit-name"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    disabled={editMutation.isPending}
                  />
                  {editErrors.name && <p className="text-[10px] text-destructive font-medium">{editErrors.name}</p>}
                </div>

                {/* Key */}
                <div className="space-y-1">
                  <Label htmlFor="edit-key" className="text-xs font-semibold text-muted-foreground">Key Slug</Label>
                  <Input
                    id="edit-key"
                    type="text"
                    value={editKey}
                    onChange={(e) => setEditKey(e.target.value)}
                    disabled={editMutation.isPending}
                  />
                  {editErrors.key && <p className="text-[10px] text-destructive font-medium">{editErrors.key}</p>}
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <Label htmlFor="edit-description" className="text-xs font-semibold text-muted-foreground">Description (Optional)</Label>
                  <textarea
                    id="edit-description"
                    rows={3}
                    placeholder="Provide a brief explanation..."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    disabled={editMutation.isPending}
                  />
                  {editErrors.description && <p className="text-[10px] text-destructive font-medium">{editErrors.description}</p>}
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between py-2 border-t border-border/40">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Active Status</Label>
                    <p className="text-[10px] text-muted-foreground">Toggle availability for reporting.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    disabled={editMutation.isPending}
                    className="h-4.5 w-4.5 rounded border-input bg-background text-primary accent-primary cursor-pointer disabled:opacity-50"
                  />
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

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false)
          setRecordToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Expense Type"
        description={`Are you sure you want to delete expense type "${recordToDelete?.name}"? This action cannot be undone and will permanently remove this category.`}
        confirmText="Delete Category"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
