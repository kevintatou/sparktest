/**
 * Generic localStorage-based storage service
 * This service provides localStorage operations for any data type
 */

import type { ChangeEvent, GenericStorageService } from './storage'
import type { StorageHelpers } from './utils'

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