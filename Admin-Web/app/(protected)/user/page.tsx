"use client"

import * as React from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import {
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Loader2,
  UserPlus,
  Trash2,
  Edit2,
  X,
  Plus,
  AlertCircle
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

interface UserRecord {
  id: string
  userName: string
  email: string
  phone: string
  role: string
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

export default function UserManagementPage() {
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false)
  const [userToDelete, setUserToDelete] = React.useState<UserRecord | null>(null)
  
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)
  
  // Add User Form States
  const [addUserName, setAddUserName] = React.useState("")
  const [addEmail, setAddEmail] = React.useState("")
  const [addPhone, setAddPhone] = React.useState("")
  const [addPassword, setAddPassword] = React.useState("")
  const [addRole, setAddRole] = React.useState("user")
  const [addErrors, setAddErrors] = React.useState<{ [key: string]: string }>({})

  // Edit User Form States
  const [editingUserId, setEditingUserId] = React.useState<string | null>(null)
  const [editUserName, setEditUserName] = React.useState("")
  const [editEmail, setEditEmail] = React.useState("")
  const [editPhone, setEditPhone] = React.useState("")
  const [editRole, setEditRole] = React.useState("user")
  const [editErrors, setEditErrors] = React.useState<{ [key: string]: string }>({})

  // Fetch Current Logged-in User (uses Infinity cache from layout.tsx)
  const { data: meData } = useQuery<{ user: { role: string } }>({
    queryKey: ["currentUser"],
    staleTime: Infinity,
  })

  const isAdminRole = meData?.user?.role === "admin"

  // 1. Fetch all users from database via GET /api/v1/user
  const { data: usersData, isLoading: isUsersLoading, refetch } = useQuery({
    queryKey: ["users", page, limit],
    queryFn: async () => {
      const response = await fetch(`/api/v1/user?page=${page}&limit=${limit}`, {
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to fetch users")
      }
      return response.json() // Expecting { users: [...], pagination: {...} }
    },
  })

  // 2. Add/Signup User Mutation
  const signupMutation = useMutation({
    mutationFn: async (newUserData: any) => {
      const response = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newUserData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to create user")
      }

      return response.json()
    },
    onSuccess: (data) => {
      toast.success(`User "${data.userName}" successfully created in database!`)
      refetch() // Refresh user table from database
      
      // Reset inputs
      setAddUserName("")
      setAddEmail("")
      setAddPhone("")
      setAddPassword("")
      setAddRole("user")
      setAddErrors({})
      setIsAddOpen(false)
    },
    onError: (error: Error) => {
      setAddErrors({ general: error.message })
      toast.error(error.message || "Failed to register user")
    },
  })

  // 3. Edit/Update User Mutation
  const editMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const response = await fetch(`/api/v1/user/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update user")
      }

      return response.json() // Expects {"user": {...}}
    },
    onSuccess: (data) => {
      toast.success(`User details for "${data.user?.userName || "user"}" successfully updated!`)
      refetch() // Refresh users list
      setIsEditOpen(false)
      setEditingUserId(null)
      setEditErrors({})
    },
    onError: (error: Error) => {
      setEditErrors({ general: error.message })
      toast.error(error.message || "Failed to update user")
    },
  })

  // 4. Delete User Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/user/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete user")
      }

      return true
    },
    onSuccess: () => {
      toast.success("User deleted successfully!")
      refetch() // Refresh table
      setIsDeleteConfirmOpen(false)
      setUserToDelete(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete user")
    },
  })

  // Validate Add User Form
  const validateAddForm = () => {
    const errs: typeof addErrors = {}
    if (!addUserName.trim()) errs.userName = "Username is required"
    else if (addUserName.length < 3 || addUserName.length > 50) errs.userName = "Username must be 3-50 characters"

    if (!addEmail) errs.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(addEmail)) errs.email = "Invalid email format"

    if (!addPhone.trim()) errs.phone = "Phone number is required"
    else if (addPhone.length < 7 || addPhone.length > 20) errs.phone = "Phone must be 7-20 characters"

    if (!addPassword) errs.password = "Password is required"
    else if (addPassword.length < 8 || addPassword.length > 72) errs.password = "Password must be 8-72 characters"

    setAddErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Handle Add User Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAddErrors({})

    if (!validateAddForm()) return

    signupMutation.mutate({
      userName: addUserName,
      email: addEmail,
      phone: addPhone,
      password: addPassword,
      role: addRole,
    })
  }

  // Open Edit Modal with selected user details
  const openEditModal = (user: UserRecord) => {
    setEditingUserId(user.id)
    setEditUserName(user.userName)
    setEditEmail(user.email)
    setEditPhone(user.phone)
    setEditRole(user.role)
    setEditErrors({})
    setIsEditOpen(true)
  }

  // Validate Edit Form
  const validateEditForm = () => {
    const errs: typeof editErrors = {}
    if (!editUserName.trim()) errs.userName = "Username is required"
    else if (editUserName.length < 3 || editUserName.length > 50) errs.userName = "Username must be 3-50 characters"

    if (!editEmail) errs.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(editEmail)) errs.email = "Invalid email format"

    if (!editPhone.trim()) errs.phone = "Phone number is required"
    else if (editPhone.length < 7 || editPhone.length > 20) errs.phone = "Phone must be 7-20 characters"

    setEditErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Handle Save Edit Form Submission
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEditErrors({})

    if (!validateEditForm()) return
    if (!editingUserId) return

    editMutation.mutate({
      id: editingUserId,
      payload: {
        userName: editUserName,
        email: editEmail,
        phone: editPhone,
        role: editRole,
      },
    })
  }

  // Handle Delete User Action
  const handleDeleteUserClick = (user: UserRecord) => {
    setUserToDelete(user)
    setIsDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id)
    }
  }

  interface PaginationDetails {
    page: number
    limit: number
    total: number
    pages: number
  }

  const users = usersData?.users || []
  const pagination: PaginationDetails = usersData?.pagination || { page: 1, limit: 20, total: 0, pages: 1 }
  const isActionLoading = signupMutation.isPending || editMutation.isPending || deleteMutation.isPending

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Display, create, edit and delete registered users in the expense management ecosystem.
          </p>
        </div>
        
        {/* New User Button */}
        {isAdminRole && (
          <Button 
            onClick={() => {
              setAddErrors({})
              setIsAddOpen(true)
            }} 
            className="gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer self-start sm:self-center"
          >
            <Plus className="h-4.5 w-4.5" />
            New User
          </Button>
        )}
      </div>

      {/* Loading Spinner for initial page load */}
      {isUsersLoading ? (
        <div className="flex h-[30vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        /* Users Table Card */
        <Card className="border-border/50 shadow-xs overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/40 bg-card/20">
            <CardTitle className="text-lg font-bold">System Users</CardTitle>
            <CardDescription>
              A listing of administrators and standard user accounts loaded directly from MongoDB.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {/* Scroll container optimized for mobile layouts */}
            <div className="overflow-x-auto w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/10">
                    <TableHead className="font-semibold py-3.5 pl-6">Username</TableHead>
                    <TableHead className="font-semibold py-3.5 hidden sm:table-cell">Email Address</TableHead>
                    <TableHead className="font-semibold py-3.5 hidden md:table-cell">Phone Number</TableHead>
                    <TableHead className="font-semibold py-3.5">Role</TableHead>
                    <TableHead className="font-semibold py-3.5 text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No users registered. Click "New User" to add one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user: UserRecord) => (
                      <TableRow key={user.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 pl-6 font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                              <User className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span>{user.userName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-muted-foreground hidden sm:table-cell">{user.email}</td>
                        <td className="py-3.5 text-muted-foreground hidden md:table-cell">{user.phone}</td>
                        <td className="py-3.5">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
                            user.role === "admin" 
                              ? "text-primary bg-primary/10 border border-primary/20"
                              : "text-muted-foreground bg-muted border border-border"
                          )}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3.5 text-right pr-6">
                          {isAdminRole && (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditModal(user)}
                                disabled={isActionLoading}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                                aria-label={`Edit ${user.userName}`}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteUserClick(user)}
                                disabled={isActionLoading}
                                className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                aria-label={`Delete ${user.userName}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
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
                    disabled={page === 1 || isUsersLoading}
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
                      disabled={isUsersLoading}
                    >
                      {idx}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs cursor-pointer"
                    onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pages))}
                    disabled={page === pagination.pages || isUsersLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add User Modal Dialog Overlay */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200" 
            onClick={() => !signupMutation.isPending && setIsAddOpen(false)}
          />
          
          <Card className="w-full max-w-md relative z-10 border-border bg-card/95 backdrop-blur-xl shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            <button
              onClick={() => setIsAddOpen(false)}
              disabled={signupMutation.isPending}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-md p-1.5 bg-muted/50 border border-border/50 cursor-pointer"
              aria-label="Close add modal"
            >
              <X className="h-4 w-4" />
            </button>
            
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Add New User
              </CardTitle>
              <CardDescription>Register a new administrator or general user account.</CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                {addErrors.general && (
                  <div className="rounded-lg bg-destructive/15 p-3 text-xs font-medium text-destructive border border-destructive/20 flex gap-2 items-start">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{addErrors.general}</span>
                  </div>
                )}

                {/* Username */}
                <div className="space-y-1">
                  <Label htmlFor="add-username" className="text-xs font-semibold text-muted-foreground">Username</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                      <User className="h-4 w-4" />
                    </span>
                    <Input
                      id="add-username"
                      type="text"
                      placeholder="e.g., john_doe"
                      className="pl-10"
                      value={addUserName}
                      onChange={(e) => setAddUserName(e.target.value)}
                      disabled={signupMutation.isPending}
                    />
                  </div>
                  {addErrors.userName && <p className="text-[10px] text-destructive font-medium">{addErrors.userName}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <Label htmlFor="add-email" className="text-xs font-semibold text-muted-foreground">Email Address</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                      <Mail className="h-4 w-4" />
                    </span>
                    <Input
                      id="add-email"
                      type="email"
                      placeholder="e.g., user@example.com"
                      className="pl-10"
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      disabled={signupMutation.isPending}
                    />
                  </div>
                  {addErrors.email && <p className="text-[10px] text-destructive font-medium">{addErrors.email}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <Label htmlFor="add-phone" className="text-xs font-semibold text-muted-foreground">Phone Number</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                      <Phone className="h-4 w-4" />
                    </span>
                    <Input
                      id="add-phone"
                      type="tel"
                      placeholder="e.g., +15551234567"
                      className="pl-10"
                      value={addPhone}
                      onChange={(e) => setAddPhone(e.target.value)}
                      disabled={signupMutation.isPending}
                    />
                  </div>
                  {addErrors.phone && <p className="text-[10px] text-destructive font-medium">{addErrors.phone}</p>}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <Label htmlFor="add-password" className="text-xs font-semibold text-muted-foreground">Password</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                      <Lock className="h-4 w-4" />
                    </span>
                    <Input
                      id="add-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={addPassword}
                      onChange={(e) => setAddPassword(e.target.value)}
                      disabled={signupMutation.isPending}
                    />
                  </div>
                  {addErrors.password && <p className="text-[10px] text-destructive font-medium">{addErrors.password}</p>}
                </div>

                {/* Role Select */}
                <div className="space-y-1">
                  <Label htmlFor="add-role" className="text-xs font-semibold text-muted-foreground">Security Role</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                      <Shield className="h-4 w-4" />
                    </span>
                    <select
                      id="add-role"
                      className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all duration-200 focus:ring-primary/20 cursor-pointer"
                      value={addRole}
                      onChange={(e) => setAddRole(e.target.value)}
                      disabled={signupMutation.isPending}
                    >
                      <option value="user">User (Standard Access)</option>
                      <option value="admin">Admin (Full Access)</option>
                    </select>
                  </div>
                </div>

                <Button type="submit" className="w-full relative transition-all active:scale-[0.98] cursor-pointer mt-4" disabled={signupMutation.isPending}>
                  {signupMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating User...
                    </>
                  ) : (
                    "Save User Account"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit User Modal Dialog Overlay */}
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
                setEditingUserId(null)
              }}
              disabled={editMutation.isPending}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-md p-1.5 bg-muted/50 border border-border/50 cursor-pointer"
              aria-label="Close edit modal"
            >
              <X className="h-4 w-4" />
            </button>
            
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Edit2 className="h-4.5 w-4.5 text-primary" />
                Edit User Details
              </CardTitle>
              <CardDescription>Update profile information for this user account.</CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                {editErrors.general && (
                  <div className="rounded-lg bg-destructive/15 p-3 text-xs font-medium text-destructive border border-destructive/20 flex gap-2 items-start">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{editErrors.general}</span>
                  </div>
                )}

                {/* Username */}
                <div className="space-y-1">
                  <Label htmlFor="edit-username" className="text-xs font-semibold text-muted-foreground">Username</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                      <User className="h-4 w-4" />
                    </span>
                    <Input
                      id="edit-username"
                      type="text"
                      className="pl-10"
                      value={editUserName}
                      onChange={(e) => setEditUserName(e.target.value)}
                      disabled={editMutation.isPending}
                    />
                  </div>
                  {editErrors.userName && <p className="text-[10px] text-destructive font-medium">{editErrors.userName}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <Label htmlFor="edit-email" className="text-xs font-semibold text-muted-foreground">Email Address</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                      <Mail className="h-4 w-4" />
                    </span>
                    <Input
                      id="edit-email"
                      type="email"
                      className="pl-10"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      disabled={editMutation.isPending}
                    />
                  </div>
                  {editErrors.email && <p className="text-[10px] text-destructive font-medium">{editErrors.email}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <Label htmlFor="edit-phone" className="text-xs font-semibold text-muted-foreground">Phone Number</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                      <Phone className="h-4 w-4" />
                    </span>
                    <Input
                      id="edit-phone"
                      type="tel"
                      className="pl-10"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      disabled={editMutation.isPending}
                    />
                  </div>
                  {editErrors.phone && <p className="text-[10px] text-destructive font-medium">{editErrors.phone}</p>}
                </div>

                {/* Role Select */}
                <div className="space-y-1">
                  <Label htmlFor="edit-role" className="text-xs font-semibold text-muted-foreground">Security Role</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                      <Shield className="h-4 w-4" />
                    </span>
                    <select
                      id="edit-role"
                      className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all duration-200 focus:ring-primary/20 cursor-pointer"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      disabled={editMutation.isPending}
                    >
                      <option value="user">User (Standard Access)</option>
                      <option value="admin">Admin (Full Access)</option>
                    </select>
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

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false)
          setUserToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        description={`Are you sure you want to delete user "${userToDelete?.userName}"? This action cannot be undone and will permanently remove their account from the system.`}
        confirmText="Delete User"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
