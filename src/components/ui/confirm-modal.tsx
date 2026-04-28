"use client"
import { useState } from "react"
import { AlertCircle, AlertTriangle, LogOut, Trash2, X, Loader2 } from "lucide-react"
import { Button } from "./button"

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  type?: "danger" | "warning" | "info"
  confirmText?: string
  cancelText?: string
  icon?: "delete" | "logout" | "warning"
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "danger",
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  icon = "warning"
}: ConfirmModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error("Confirm error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getIcon = () => {
    switch (icon) {
      case "delete": return <Trash2 className="w-6 h-6 text-red-500" />
      case "logout": return <LogOut className="w-6 h-6 text-blue-500" />
      default: return <AlertTriangle className="w-6 h-6 text-amber-500" />
    }
  }

  const getTypeStyles = () => {
    switch (type) {
      case "danger": return "bg-red-50 text-red-600 border-red-100"
      case "warning": return "bg-amber-50 text-amber-600 border-amber-100"
      default: return "bg-blue-50 text-blue-600 border-blue-100"
    }
  }

  const getButtonStyles = () => {
    switch (type) {
      case "danger": return "bg-red-500 hover:bg-red-600 text-white shadow-red-100"
      case "warning": return "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-100"
      default: return "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100"
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={!isSubmitting ? onClose : undefined}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 border-none">
        <div className="p-8 flex flex-col items-center text-center">
          {/* Icon Circle */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${getTypeStyles()}`}>
            {getIcon()}
          </div>
          
          <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed px-2">
            {message}
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 pt-0">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 h-12 rounded-xl font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`flex-1 h-12 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${getButtonStyles()}`}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmText}
          </Button>
        </div>
        
        {/* Close Button */}
        {!isSubmitting && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
