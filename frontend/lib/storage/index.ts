import { LocalStorageService } from "./local-storage"
import { ApiStorageService } from "./api-storage"
import { StorageService } from "./storage"
import { USE_RUST_API } from "@/lib/config"

export const storage: StorageService = USE_RUST_API
  ? new ApiStorageService()
  : new LocalStorageService()
