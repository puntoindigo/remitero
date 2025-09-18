"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface PopoverProps {
  children: React.ReactNode
}

interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end"
  sideOffset?: number
}

const PopoverContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {},
})

const Popover = ({ children }: PopoverProps) => {
  const [open, setOpen] = React.useState(false)
  
  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const { open, setOpen } = React.useContext(PopoverContext)
    const internalRef = React.useRef<HTMLElement>(null)
    
    React.useEffect(() => {
      if (internalRef.current) {
        // Store reference for positioning
        (internalRef.current as any).__popoverTrigger = true
      }
    }, [])
    
    if (asChild) {
      return React.cloneElement(props.children as React.ReactElement, {
        onClick: () => setOpen(!open),
        ref: (el: HTMLElement) => {
          internalRef.current = el
          if (typeof ref === 'function') ref(el)
          else if (ref) ref.current = el
        },
      })
    }
    
    return (
      <button
        ref={(el: HTMLButtonElement) => {
          internalRef.current = el
          if (typeof ref === 'function') ref(el)
          else if (ref) ref.current = el
        }}
        className={cn("", className)}
        onClick={() => setOpen(!open)}
        {...props}
      />
    )
  }
)
PopoverTrigger.displayName = "PopoverTrigger"

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align = "center", sideOffset = 4, ...props }, ref) => {
    const { open, setOpen } = React.useContext(PopoverContext)
    
    if (!open) return null
    
    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 w-72 rounded-md border bg-white p-4 text-gray-900 shadow-lg outline-none",
          "top-full left-0 mt-1",
          className
        )}
        {...props}
      />
    )
  }
)
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }