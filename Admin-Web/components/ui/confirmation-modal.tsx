"use client"

import * as React from "react"
import { AlertTriangle, AlertCircle, Info, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "destructive" | "warning" | "info"
  isLoading?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
  isLoading = false,
}: ConfirmationModalProps) {
  // Listen for escape key press to close the modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose, isLoading])

  if (!isOpen) return null

  // Variant helper styles
  const iconConfig = {
    destructive: {
      icon: AlertCircle,
      iconClass: "text-destructive bg-destructive/10 border-destructive/20",
      buttonVariant: "default" as const,
      confirmBg: "bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 dark:border-red-500/30 border border-transparent",
    },
    warning: {
      icon: AlertTriangle,
      iconClass: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      buttonVariant: "default" as const,
      confirmBg: "bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30 dark:border-amber-500/30 border border-transparent",
    },
    info: {
      icon: Info,
      iconClass: "text-primary bg-primary/10 border-primary/20",
      buttonVariant: "default" as const,
      confirmBg: "bg-primary text-primary-foreground hover:bg-primary/95",
    },
  }

  const activeConfig = iconConfig[variant]
  const IconComponent = activeConfig.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop blur overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200"
        onClick={() => !isLoading && onClose()}
      />

      {/* Modal Dialog Card */}
      <Card className="w-full max-w-md relative z-10 border-border bg-card/95 backdrop-blur-xl shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-md p-1.5 bg-muted/50 border border-border/50 transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Close confirmation modal"
        >
          <X className="h-4 w-4" />
        </button>

        <CardHeader className="pb-4 pt-6 px-6">
          <div className="flex items-start gap-4">
            {/* Variant Icon Indicator */}
            <div className={cn(
              "h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 shadow-xs",
              activeConfig.iconClass
            )}>
              <IconComponent className="h-5 w-5" />
            </div>

            <div className="space-y-1 pr-6">
              <CardTitle className="text-lg font-bold leading-tight text-foreground">
                {title}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                {description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-2 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer font-medium min-w-[80px]"
          >
            {cancelText}
          </Button>
          <Button
            variant={activeConfig.buttonVariant}
            onClick={onConfirm}
            disabled={isLoading}
            className={cn("cursor-pointer font-medium min-w-[100px]", activeConfig.confirmBg)}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
