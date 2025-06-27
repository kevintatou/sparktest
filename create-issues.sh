#!/bin/bash

# --- SparkTest OSS GitHub Issue Script ---
# Run this inside your repo dir after gh auth login

gh issue create --title "Fix & enable CI workflow for tests" \
  --body "- Ensure the GitHub Actions workflow runs pnpm commands correctly\n- Remove any leftover npm/yarn lockfiles\n- Ensure tests pass in CI and e2e logic is triggered\n- Add README badge if missing" \
  --label "CI"

gh issue create --title "Implement full CRUD for test suites in UI + backend" \
  --body "- Add Create / Edit / Delete support for Test Suites\n- UI form for creating new Suite\n- Show list of definitions in suite\n- Optional: assign colors or tags" \
  --label "feature,suites"

gh issue create --title "Add confirmation + visual feedback for all test operations" \
  --body "- Success toasts for creating runs/definitions/suites\n- Error handling when form submission fails\n- Disable buttons during async ops" \
  --label "enhancement,UX"

gh issue create --title "Allow selecting Test Definition when creating a new run" \
  --body "- New Run page should show a dropdown to select a Test Definition\n- Hide custom fields unless enabled\n- Pre-fill run name with def name" \
  --label "feature,runs"

gh issue create --title "Add logs UI panel to Test Run details page" \
  --body "- Add 'Logs' section to each run page\n- Show stdout/stderr or fake logs from mock\n- Add loading state while fetching logs\n- Expand/collapse or toggle autoscroll" \
  --label "feature,logs"

gh issue create --title "Add fallback logic when no Test Definitions exist" \
  --body "- Show helpful message when there are no test definitions\n- Prevent crash in create run page when definition is undefined\n- Add call to action: create a definition" \
  --label "bug,UX"

gh issue create --title "Verify backend logic for run creation via CRD/standalone config" \
  --body "- Investigate direct test run creation without a Test Definition\n- Add support for uploading a CRD/json config to trigger a run\n- Optional: flag in UI to create standalone runs" \
  --label "research,enhancement"

gh issue create --title "Add tooltips to all navigation icons and dropdowns" \
  --body "- Every sidebar icon should have a tooltip\n- Include tooltips in create dropdown\n- Ensure they appear correctly on mobile/desktop\n- Animate fade-in/out" \
  --label "UX,polish"

gh issue create --title "Verify Kubernetes Job logic with real Docker image" \
  --body "- Run a real test image using the executor logic\n- Add basic hello-world job spec\n- Ensure jobs appear in Kubernetes and finish\n- Optional: show status on run page" \
  --label "test,k8s"

gh issue create --title "Document how test runs actually work across services" \
  --body "- Add README section or developer doc\n- How SparkTest triggers tests\n- What role Docker images and commands play\n- How it fits in a microservice architecture" \
  --label "documentation"

gh issue create --title "Refactor storage strategy to support both local and remote backends" \
  --body "- Add a strategy interface for storage (localStorage vs API)\n- Move current logic to LocalStorageAdapter\n- Add switch flag or env to toggle mode" \
  --label "refactor,architecture"
