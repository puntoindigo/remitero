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
      {children}
    </PopoverContext.Provider>
  )
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const { open, setOpen } = React.useContext(PopoverContext)
    
    if (asChild) {
      return React.cloneElement(props.children as React.ReactElement, {
        onClick: () => setOpen(!open),
        ref,
      })
    }
    
    return (
      <button
        ref={ref}
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
          "z-50 w-72 rounded-md border bg-white p-4 text-gray-900 shadow-md outline-none animate-in fade-in-0 zoom-in-95",
          className
        )}
        style={{
          position: "absolute",
          top: "100%",
          left: align === "start" ? "0" : align === "end" ? "auto" : "50%",
          right: align === "end" ? "0" : "auto",
          transform: align === "center" ? "translateX(-50%)" : "none",
          marginTop: `${sideOffset}px`,
        }}
        {...props}
      />
    )
  }
)
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }