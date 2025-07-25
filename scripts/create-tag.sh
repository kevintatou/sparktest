#!/bin/bash

# Script to create and push v0.2.0 tag
# This script was created to address issue #118: Tagging failed

set -e

echo "Creating v0.2.0 tag for SparkTest release..."

# Ensure we're on the main branch at the merge commit
git fetch origin main
git checkout main

# Verify we're at the correct commit (merge commit from PR #117)
EXPECTED_COMMIT="22760f9f5b90d68f17f51af0862b04c25b5e4caf"
CURRENT_COMMIT=$(git rev-parse HEAD)

if [ "$CURRENT_COMMIT" != "$EXPECTED_COMMIT" ]; then
    echo "Warning: Current commit $CURRENT_COMMIT does not match expected $EXPECTED_COMMIT"
    echo "Current commit details:"
    git log --oneline -1
fi

# Check if tag already exists
if git tag -l | grep -q "^v0.2.0$"; then
    echo "Tag v0.2.0 already exists locally"
    git show v0.2.0 --no-patch --format="Tagger: %an <%ae>%nDate: %ad%nMessage: %s"
else
    echo "Creating annotated tag v0.2.0..."
    git tag -a v0.2.0 -m "Release version v0.2.0

This release corresponds to the version bump in PR #117.
All packages in the monorepo are now at version 0.2.0:
- @tatou/core: 0.2.0  
- @tatou/storage-service: 0.2.0
- @tatou/oss: 0.2.0
- sparktest-core: 0.2.0
- sparktest-api: 0.2.0  
- sparktest-bin: 0.2.0"
fi

echo "Attempting to push tag to origin..."
if git push origin v0.2.0; then
    echo "✅ Successfully pushed v0.2.0 tag to GitHub!"
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