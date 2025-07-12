/**
 * Generic storage interfaces and utilities for building hybrid storage services
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

export interface StorageHelpers {
  getFromStorage<T>(key: string, defaultValue: T): T
  setToStorage<T>(key: string, value: T): void
}

export class GenericLocalStorageService<T> implements GenericStorageService<T> {
  private storageKey: string
  private defaultItems: T[]
  private getItemId: (item: T) => string
  private helpers: StorageHelpers
  private insertMode: 'push' | 'unshift'
  private maxItems?: number

  constructor(
    storageKey: string,
    defaultItems: T[],
    getItemId: (item: T) => string,
    helpers: StorageHelpers,
    options?: {
      insertMode?: 'push' | 'unshift'
      maxItems?: number
    }
  ) {
    this.storageKey = storageKey
    this.defaultItems = defaultItems
    this.getItemId = getItemId
    this.helpers = helpers
    this.insertMode = options?.insertMode || 'push'
    this.maxItems = options?.maxItems
  }

  async getItems(): Promise<T[]> {
    return this.helpers.getFromStorage(this.storageKey, this.defaultItems)
  }

  async saveItem(item: T): Promise<T> {
    const list = await this.getItems()
    const id = this.getItemId(item)
    const index = list.findIndex((existing) => this.getItemId(existing) === id)
    
    if (index >= 0) {
      list[index] = item
    } else {
      if (this.insertMode === 'unshift') {
        list.unshift(item)
      } else {
        list.push(item)
      }
    }
    
    // Apply max items limit if specified
    if (this.maxItems && list.length > this.maxItems) {
      list.splice(this.maxItems)
    }
    
    this.helpers.setToStorage(this.storageKey, list)
    return item
  }

  async deleteItem(id: string): Promise<boolean> {
    const list = await this.getItems()
    const updated = list.filter((item) => this.getItemId(item) !== id)
    this.helpers.setToStorage(this.storageKey, updated)
    return true
  }

  async getItemById(id: string): Promise<T | undefined> {
    const list = await this.getItems()
    return list.find((item) => this.getItemId(item) === id)
  }

  subscribe(callback: (payload: ChangeEvent<T>) => void): () => void {
    let previousItems: T[] = []
    
    const interval = setInterval(async () => {
      try {
        const newItems = await this.getItems()
        
        // INSERT
        const inserted = newItems.filter(item => 
          !previousItems.some(prev => this.getItemId(prev) === this.getItemId(item))
        )
        for (const item of inserted) {
          callback({ eventType: 'INSERT', new: item })
        }
        
        // UPDATE
        for (const item of newItems) {
          const prev = previousItems.find(p => this.getItemId(p) === this.getItemId(item))
          if (prev && JSON.stringify(prev) !== JSON.stringify(item)) {
            callback({ eventType: 'UPDATE', new: item })
          }
        }
        
        // DELETE
        const deleted = previousItems.filter(item => 
          !newItems.some(newItem => this.getItemId(newItem) === this.getItemId(item))
        )
        for (const item of deleted) {
          callback({ eventType: 'DELETE', old: item })
        }
        
        previousItems = newItems
      } catch (err) {
        console.error('Polling error in subscribe:', err)
      }
    }, 10000)
    
    return () => clearInterval(interval)
  }

  async initialize(): Promise<void> {
    if (typeof window === 'undefined') return
    if (!localStorage.getItem(this.storageKey)) {
      this.helpers.setToStorage(this.storageKey, this.defaultItems)
    }
  }
}

export class GenericApiStorageService<T> implements GenericStorageService<T> {
  private endpoint: string
  private apiBaseUrl: string
  private getItemId: (item: T) => string
  private transformRequest?: (data: any) => any
  private transformResponse?: (data: any) => any

  constructor(
    endpoint: string,
    apiBaseUrl: string,
    getItemId: (item: T) => string,
    config?: {
      transformRequest?: (data: any) => any
      transformResponse?: (data: any) => any
    }
  ) {
    this.endpoint = endpoint
    this.apiBaseUrl = apiBaseUrl
    this.getItemId = getItemId
    this.transformRequest = config?.transformRequest
    this.transformResponse = config?.transformResponse
  }

  async getItems(): Promise<T[]> {
    const res = await fetch(`${this.apiBaseUrl}/${this.endpoint}`)
    if (!res.ok) throw new Error(`Failed to fetch ${this.endpoint}`)
    
    const data = await res.json()
    return this.transformResponse ? this.transformResponse(data) : data
  }

  async saveItem(item: T): Promise<T> {
    const id = this.getItemId(item)
    const method = id ? 'PUT' : 'POST'
    const url = id ? `${this.apiBaseUrl}/${this.endpoint}/${id}` : `${this.apiBaseUrl}/${this.endpoint}`
    
    const payload = this.transformRequest ? this.transformRequest(item) : item
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    
    if (!res.ok) throw new Error(`Failed to save ${this.endpoint}`)
    
    const data = await res.json()
    return this.transformResponse ? this.transformResponse(data) : data
  }

  async deleteItem(id: string): Promise<boolean> {
    const res = await fetch(`${this.apiBaseUrl}/${this.endpoint}/${id}`, { method: 'DELETE' })
    return res.ok
  }

  async getItemById(id: string): Promise<T | undefined> {
    const list = await this.getItems()
    return list.find((item) => this.getItemId(item) === id)
  }

  subscribe(callback: (payload: ChangeEvent<T>) => void): () => void {
    let previousItems: T[] = []
    
    const interval = setInterval(async () => {
      try {
        const newItems = await this.getItems()
        
        const inserted = newItems.filter(item => 
          !previousItems.some(prev => this.getItemId(prev) === this.getItemId(item))
        )
        for (const item of inserted) {
          callback({ eventType: 'INSERT', new: item })
        }
        
        for (const item of newItems) {
          const prev = previousItems.find(p => this.getItemId(p) === this.getItemId(item))
          if (prev && JSON.stringify(prev) !== JSON.stringify(item)) {
            callback({ eventType: 'UPDATE', new: item })
          }
        }
        
        const deleted = previousItems.filter(item => 
          !newItems.some(newItem => this.getItemId(newItem) === this.getItemId(item))
        )
        for (const item of deleted) {
          callback({ eventType: 'DELETE', old: item })
        }
        
        previousItems = newItems
      } catch (err) {
        console.error(`Polling error in ${this.endpoint} subscribe:`, err)
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }

  async initialize(): Promise<void> {
    // No-op for API mode
  }
}

export class GenericHybridStorageService<T> implements GenericStorageService<T> {
  private apiStorage: GenericStorageService<T>
  private localStorage: GenericStorageService<T>
  private config: StorageConfig

  constructor(
    apiStorage: GenericStorageService<T>,
    localStorage: GenericStorageService<T>,
    config: StorageConfig = {}
  ) {
    this.apiStorage = apiStorage
    this.localStorage = localStorage
    this.config = config
  }

  private async tryApiWithFallback<U>(
    apiMethod: () => Promise<U>,
    fallbackMethod: () => Promise<U>
  ): Promise<U> {
    try {
      return await apiMethod()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      if (this.config.onFallback) {
        this.config.onFallback(errorMessage)
      } else {
        console.warn('API call failed, falling back to local storage:', error)
      }
      
      if (this.config.onError) {
        this.config.onError(error as Error, 'API call failed')
      }
      
      return await fallbackMethod()
    }
  }

  async getItems(): Promise<T[]> {
    return this.tryApiWithFallback(
      () => this.apiStorage.getItems(),
      () => this.localStorage.getItems()
    )
  }

  async saveItem(item: T): Promise<T> {
    return this.tryApiWithFallback(
      () => this.apiStorage.saveItem(item),
      () => this.localStorage.saveItem(item)
    )
  }

  async deleteItem(id: string): Promise<boolean> {
    return this.tryApiWithFallback(
      () => this.apiStorage.deleteItem(id),
      () => this.localStorage.deleteItem(id)
    )
  }

  async getItemById(id: string): Promise<T | undefined> {
    return this.tryApiWithFallback(
      () => this.apiStorage.getItemById(id),
      () => this.localStorage.getItemById(id)
    )
  }

  subscribe(callback: (payload: ChangeEvent<T>) => void): () => void {
    // Try API subscription first, fallback to local storage if it fails
    try {
      const unsub = this.apiStorage.subscribe(callback)
      if (typeof unsub === 'function') return unsub
      // If API returns null/undefined, fallback
      return this.localStorage.subscribe(callback)
    } catch (error) {
      if (this.config.onFallback) {
        this.config.onFallback('API subscription failed')
      } else {
        console.warn('API subscription failed, falling back to local storage:', error)
      }
      
      try {
        const unsub = this.localStorage.subscribe(callback)
        if (typeof unsub === 'function') return unsub
      } catch (err) {
        // Both failed, return a no-op
        return () => {}
      }
      // If local returns null/undefined
      return () => {}
    }
  }

  async initialize(): Promise<void> {
    // Initialize both storage services
    await this.apiStorage.initialize()
    await this.localStorage.initialize()
  }
}