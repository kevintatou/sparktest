/**
 * Generic Storage Services - Framework Agnostic Storage Layer
 *
 * This module provides reusable storage services that can work with any data type
 * and any JavaScript framework. These services are designed to be extractable
 * to a separate npm package.
 */

// Core interfaces and types
export * from "./storage"

// Storage service implementations
export { GenericLocalStorageService } from "./local-storage"
export { GenericApiStorageService } from "./api-storage"
export { GenericHybridStorageService } from "./hybrid-storage"

// Storage utilities
export * from "./utils"
