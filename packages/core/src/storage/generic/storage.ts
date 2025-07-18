/**
 * Generic storage interfaces and types for building hybrid storage services
 * This module provides reusable storage patterns that can work with any data type
 */

export interface ChangeEvent<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: T
  old?: T
}

export interface GenericStorageService<T> {
  getItems(): Promise<T[]>
  saveItem(item: T): Promise<T>
  deleteItem(id: string): Promise<boolean>
  getItemById(id: string): Promise<T | undefined>
  subscribe(callback: (payload: ChangeEvent<T>) => void): () => void
  initialize(): Promise<void>
}

export interface StorageConfig {
  // API Configuration
  apiBaseUrl?: string
  apiTimeout?: number
  maxRetries?: number
  
  // LocalStorage Configuration
  storagePrefix?: string
  maxStorageSize?: number
  
  // Fallback Behavior
  fallbackTimeout?: number
  offlineThreshold?: number
  
  // Data Transformation
  transformRequest?: (data: any) => any
  transformResponse?: (data: any) => any
  
  // Error Handling
  onError?: (error: Error, context: string) => void
  onFallback?: (reason: string) => void
}