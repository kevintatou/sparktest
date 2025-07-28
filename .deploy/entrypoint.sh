#!/bin/bash

set -e

if [ -z "$GH_REPO_URL" ] || [ -z "$GH_RUNNER_TOKEN" ]; then
  echo "Missing GH_REPO_URL or GH_RUNNER_TOKEN"
  exit 1
fi

# Configure runner
./config.sh --unattended \
  --url "$GH_REPO_URL" \
  --token "$GH_RUNNER_TOKEN" \
  --labels spark-runner \
  --name docker-runner

# Run runner
./run.sh
