"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-11 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    )
  }
)
Select.displayName = "Select"

const SelectTrigger = ({ children, className }: any) => <div className={className}>{children}</div>
const SelectValue = ({ placeholder }: any) => <span>{placeholder}</span>
const SelectContent = ({ children }: any) => <>{children}</>
const SelectItem = ({ value, children, className }: any) => (
  <option value={value} className={cn("text-slate-900 bg-white font-medium", className)}>
    {children}
  </option>
)

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
