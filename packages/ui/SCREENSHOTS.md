# @tatou/ui Visual Examples

This document contains screenshots for all examples in EXAMPLES.tsx to help developers understand what each example looks like.

## How to Add Screenshots

To add screenshots for each example:

1. Start the development server with the examples page
2. Navigate to each example
3. Take screenshots at 1200x800 resolution
4. Save screenshots as `example-{number}-{name}.png` in this directory
5. Update this document with the screenshot references

## Example Screenshots

### 1. Minimal Setup Example

**File:** `example-1-minimal-setup.png`
**Description:** Complete OSS app with zero configuration showing sidebar (Dashboard, Runs, Definitions, Executors), header with search bar and GitHub link, theme toggle, and main content area.

### 2. SAAS Extension Example

**File:** `example-2-saas-extension.png`
**Description:** Extended navigation with additional "Billing", "Team", "Analytics" in sidebar, "Upgrade" and "Support" buttons in header, demonstrating easy SAAS feature addition.

### 3. Dashboard Layout Example

**File:** `example-3-dashboard-layout.png`
**Description:** Dashboard with sidebar, header, and 3 metric cards in a grid layout showing "Metric 1: 1,234", "Metric 2: 567", "Metric 3: 89" with proper spacing.

### 4. Minimal Layout Example

**File:** `example-4-minimal-layout.png`
**Description:** Clean layout with only header (no search), centered "Welcome" title and subtitle text, suitable for landing pages or marketing sites.

### 5. Status Examples

**File:** `example-5-status-badges.png`
**Description:** Row of status badges showing "✓ Passed" (green), "✗ Failed" (red), "⟳ Running" (blue), "⏸ Pending" (yellow), "⚠ Error" (red) with icons and colors.

### 6. CRUD Actions Example

**File:** `example-6-crud-actions.png`
**Description:** Row of action buttons - "Edit", "Copy", "Delete", "Approve", "Archive" with appropriate icons and different button styles.

### 7. Create Actions Example

**File:** `example-7-create-actions.png`
**Description:** Two create action buttons - "New Run" and "New Definition" with play and document icons, showing entity creation patterns.

### 8. Minimal Sidebar

**File:** `example-8-minimal-sidebar.png`
**Description:** Simple layout with only sidebar and basic content, showing the sidebar component in isolation for existing applications.

### 9. Cherry-Pick Example

**File:** `example-9-cherry-pick.png`
**Description:** Sidebar with only "Dashboard", "Runs", and "Custom Feature" items, demonstrating selective use of OSS navigation plus custom additions.

### 10. Next.js Integration Example

**File:** `example-10-nextjs-integration.png`
**Description:** Full application showing Next.js integration with custom Link component, active navigation state, and framework compatibility.

### 11. Custom Themed SAAS Application

**File:** `example-11-custom-theme-saas.png`
**Description:** Full SAAS app with purple theme colors, rounded corners, extended navigation (Billing, Team, Analytics), Upgrade button, and 3 feature cards showing custom branding.

### 12. Theme Preset Showcase

**File:** `example-12-theme-preset.png`
**Description:** Interactive example with theme switching button in header, showing color showcase card with Primary/Secondary/Outline/Destructive badges and buttons. Theme cycles through: default, modern, corporate, minimal.

## Screenshot Guidelines

- **Resolution:** 1200x800 pixels for consistency
- **Browser:** Use Chrome or Safari for best rendering
- **Content:** Capture the full example including sidebar and header when present
- **Format:** PNG format for crisp UI elements
- **Naming:** Follow the pattern `example-{number}-{kebab-case-name}.png`

## Implementation

Screenshots should be embedded in documentation using:

```markdown
![Example Name](./screenshots/example-1-minimal-setup.png)
```

Or in React documentation:

```tsx
// 📸 Screenshot: example-1-minimal-setup.png
// Shows: Complete OSS app with sidebar, header, search, and main content
```
