/**
 * Storage utilities for localStorage operations
 * These utilities provide safe localStorage access with fallbacks
 */

export interface StorageHelpers {
  getFromStorage<T>(key: string, defaultValue: T): T
  setToStorage<T>(key: string, value: T): void
}

export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error("Failed to save to localStorage:", error)
  }
}

export const storageUtils: StorageHelpers = {
  getFromStorage,
  setToStorage,
}
