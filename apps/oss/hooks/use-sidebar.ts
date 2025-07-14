"use client"

import { useState, useEffect, useRef } from "react"

export function useSidebar() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCreateOpen(false)
      }
    }

    if (isCreateOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isCreateOpen])

  return {
    isCreateOpen,
    setIsCreateOpen,
    dropdownRef,
  }
}
