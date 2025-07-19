// Export all storage services and types
export * from "./local-storage"
export * from "./api-storage"
export * from "./hybrid-storage"
export * from "./sparktest-storage"
export * from "./storage"
export * from "./dummy-definitions"
export * from "./generic"

// For convenience, also export specific services
export { LocalStorageService } from "./local-storage"
export { ApiStorageService } from "./api-storage"
export { HybridStorageService } from "./hybrid-storage"
export { SparkTestStorageService } from "./sparktest-storage"
export type { StorageService } from "./storage"

// Default storage instance - requires @sparktest/core for config
import { LocalStorageService } from "./local-storage"
import { SparkTestStorageService } from "./sparktest-storage"

// This will be determined at runtime based on configuration
let _storage: any = null

export const getStorage = () => {
  if (_storage) return _storage
  
  // Use environment variable to determine which storage to use
  const useRustApi = typeof process !== 'undefined' && 
                     process.env?.NEXT_PUBLIC_USE_RUST_API === "true"
  
  _storage = useRustApi 
    ? new SparkTestStorageService()
    : new LocalStorageService()
    
  return _storage
}

// Default export for convenience
export const storage = getStorage()
