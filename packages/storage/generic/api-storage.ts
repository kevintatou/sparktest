/**
 * Generic API-based storage service
 * This service provides API operations for any data type with request/response transformations
 */

import type { ChangeEvent, GenericStorageService } from './storage'

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