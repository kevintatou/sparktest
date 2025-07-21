"use client"

import { useState, useEffect, useRef } from "react"
import { useIsMobile } from "./use-mobile"

export function useSidebar() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

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

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    if (!isMobile && isMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    }
  }, [isMobile, isMobileMenuOpen])

  return {
    isCreateOpen,
    setIsCreateOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    dropdownRef,
    isMobile,
  }
}
