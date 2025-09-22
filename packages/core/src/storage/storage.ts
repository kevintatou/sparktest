// Storage service interface
export interface StorageService {
  // Core storage operations
  save(key: string, data: any): Promise<void>;
  load(key: string): Promise<any>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  
  // Metadata operations
  exists(key: string): Promise<boolean>;
  getKeys(): Promise<string[]>;
}
