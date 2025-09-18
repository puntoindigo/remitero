"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

interface CommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CommandItemProps extends React.HTMLAttributes<HTMLDivElement> {
  onSelect?: () => void
}

const Command = React.forwardRef<HTMLDivElement, CommandProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-white text-gray-950",
        className
      )}
      {...props}
    />
  )
)
Command.displayName = "Command"

const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, ...props }, ref) => (
    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
      <input
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
)
CommandInput.displayName = "CommandInput"

const CommandEmpty = React.forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("py-6 text-center text-sm", className)}
      {...props}
    />
  )
)
CommandEmpty.displayName = "CommandEmpty"

const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden p-1 text-gray-950 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500",
        className
      )}
      {...props}
    />
  )
)
CommandGroup.displayName = "CommandGroup"

const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
  ({ className, onSelect, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-gray-100 aria-selected:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onSelect={onSelect}
      {...props}
    />
  )
)
CommandItem.displayName = "CommandItem"

export { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem }
