/**
 * Generic hybrid storage service
 * This service tries API first and falls back to localStorage on failure
 */

import type { ChangeEvent, GenericStorageService, StorageConfig } from "./storage"

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
      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      if (this.config.onFallback) {
        this.config.onFallback(errorMessage)
      } else {
        console.warn("API call failed, falling back to local storage:", error)
      }

      if (this.config.onError) {
        this.config.onError(error as Error, "API call failed")
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
      if (typeof unsub === "function") return unsub
      // If API returns null/undefined, fallback
      return this.localStorage.subscribe(callback)
    } catch (error) {
      if (this.config.onFallback) {
        this.config.onFallback("API subscription failed")
      } else {
        console.warn("API subscription failed, falling back to local storage:", error)
      }

      try {
        const unsub = this.localStorage.subscribe(callback)
        if (typeof unsub === "function") return unsub
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
