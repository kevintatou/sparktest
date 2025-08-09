#!/bin/bash

# Migration script to update all imports from local UI components to @tatou/ui package
# This script can be run to complete the migration of all UI component imports

echo "Starting migration from local UI components to @tatou/ui package..."

# Directory containing the OSS app
OSS_DIR="./apps/oss"

# Update all TypeScript/React files to use @tatou/ui imports
find "$OSS_DIR" -name "*.tsx" -o -name "*.ts" | while read file; do
    echo "Processing: $file"
    
    # Replace all @/components/ui/* imports with @tatou/ui
    sed -i 's|from "@/components/ui/[^"]*"|from "@tatou/ui"|g' "$file"
    sed -i 's|import.*from.*"@/components/ui/[^"]*"|import { /* Add specific components */ } from "@tatou/ui"|g' "$file"
done

echo "Migration complete! Please:"
echo "1. Review the changes made to ensure all imports are correct"
echo "2. Update import statements to include specific component names"
echo "3. Run tests to verify everything still works"
echo "4. Remove the local UI components directory: apps/oss/components/ui/"