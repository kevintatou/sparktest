import { LocalStorageService } from "./local-storage"
import { ApiStorageService } from "./api-storage"
import { HybridStorageService } from "./hybrid-storage"
import type { StorageService } from "./storage"
import { USE_RUST_API } from "./config"

export const storage: StorageService = USE_RUST_API
  ? new HybridStorageService() // Use hybrid storage for automatic fallback
  : new LocalStorageService()

// Export everything for external use
export { LocalStorageService, ApiStorageService, HybridStorageService }
export type { StorageService }
export type * from "./types"
