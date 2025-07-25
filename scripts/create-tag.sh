#!/bin/bash

# Script to create and push git tags for SparkTest releases
# Usage: ./create-tag.sh [tag_name] [commit_hash]
# Example: ./create-tag.sh v0.2.0 22760f9f5b90d68f17f51af0862b04c25b5e4caf
# If no arguments provided, defaults to v0.2.0 and current HEAD

set -e

# Show help if requested
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo "Usage: $0 [tag_name] [commit_hash]"
    echo ""
    echo "Creates and pushes a git tag for SparkTest releases"
    echo ""
    echo "Arguments:"
    echo "  tag_name     The name of the tag to create (default: v0.2.0)"
    echo "  commit_hash  The commit to tag (default: current HEAD)"
    echo ""
    echo "Examples:"
    echo "  $0                    # Create v0.2.0 tag at current HEAD"
    echo "  $0 v0.3.0             # Create v0.3.0 tag at current HEAD"
    echo "  $0 v0.2.0 abc123      # Create v0.2.0 tag at commit abc123"
    echo ""
    exit 0
fi

# Parse arguments
TAG_NAME=${1:-"v0.2.0"}
TARGET_COMMIT=${2:-""}

echo "Creating $TAG_NAME tag for SparkTest release..."

# Ensure we're on the main branch
git fetch origin main
git checkout main

# Set target commit (use HEAD if not specified)
if [ -z "$TARGET_COMMIT" ]; then
    TARGET_COMMIT=$(git rev-parse HEAD)
    echo "Using current HEAD: $TARGET_COMMIT"
else
    echo "Using specified commit: $TARGET_COMMIT"
    # Verify the commit exists
    if ! git cat-file -e "$TARGET_COMMIT" 2>/dev/null; then
        echo "Error: Commit $TARGET_COMMIT does not exist"
        exit 1
    fi
fi

# Show commit details
echo "Target commit details:"
git log --oneline -1 "$TARGET_COMMIT"

# Check if tag already exists
if git tag -l | grep -q "^$TAG_NAME$"; then
    echo "Tag $TAG_NAME already exists locally"
    git show "$TAG_NAME" --no-patch --format="Tagger: %an <%ae>%nDate: %ad%nMessage: %s"
else
    echo "Creating annotated tag $TAG_NAME..."
    git tag -a "$TAG_NAME" "$TARGET_COMMIT" -m "Release version $TAG_NAME

This release corresponds to the version bump in the monorepo.
All packages in the monorepo are now at the corresponding version:
- @tatou/core
- @tatou/storage-service
- @tatou/oss
- sparktest-core
- sparktest-api  
- sparktest-bin"
fi

echo "Attempting to push tag to origin..."
if git push origin "$TAG_NAME"; then
    echo "✅ Successfully pushed $TAG_NAME tag to GitHub!"
    echo "Tag should now be visible at: https://github.com/kevintatou/sparktest/tags"
else
    echo "❌ Failed to push tag to origin"
    echo ""
    echo "This usually indicates one of the following issues:"
    echo "1. Missing GITHUB_TOKEN environment variable"
    echo "2. Insufficient permissions to push tags"
    echo "3. Authentication configuration issues"
    echo ""
    echo "To resolve this, ensure:"
    echo "- GITHUB_TOKEN is set with repo permissions"
    echo "- The token has permission to push to kevintatou/sparktest"
    echo "- Git is configured with proper credentials"
    echo ""
    echo "Local tag has been created successfully and can be pushed manually by a user with appropriate permissions."
    exit 1
fi