import { LocalStorageService } from "./local-storage"
import { ApiStorageService } from "./api-storage"
import { HybridStorageService } from "./hybrid-storage"
import { SparkTestStorageService } from "./sparktest-storage"
import { StorageService } from "./storage"
import { USE_RUST_API } from "@sparktest/core/config"

// Export the new generic storage services for future extraction
export * from "./generic"
export { SparkTestStorageService }

export const storage: StorageService = USE_RUST_API
  ? new SparkTestStorageService() // Use the new SparkTest storage service
  : new LocalStorageService()
