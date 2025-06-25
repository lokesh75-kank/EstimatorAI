# Vendor Data Source Configuration - UI/UX Design Guide

A detailed UI/UX design guide for the Vendor Data Source Configuration micro-journey, covering each screen, key components, interactions, and edge cases from the estimator's point of view.

## 🎬 Entry & Context

### Global Nav Highlight
- Badge on "Data Sources" menu item: red dot or "⚠ Required" until at least one source is active
- Tooltip on hover: "Connect a vendor source to power live pricing in Smart BOM"

### Blocking Prompt
If user clicks "New Estimation" with no sources, show a full-screen modal:
- Title: "Vendor Data Required"
- Body: "To generate Smart BOMs, please configure at least one Vendor Data Source"
- Buttons: "Configure Now" (primary) / "Cancel" (secondary)

## 🖼 Data Sources Dashboard

### Layout
- Header: page title + "Add Data Source" button (MUI `<Button variant="contained">`)
- Grid: responsive 1–3-column Tailwind grid of cards

### Card Components

#### Empty State
- Large dashed border box
- Centered "➕ Add Your First Vendor Source"
- Subtext: "Live pricing, availability & metadata for Smart BOM"

#### Populated State
- Title: Vendor Name
- Status Badge: green "Active" or red "Error" with tooltip
- Last Synced: "2m ago"
- Record Count: "1,254 items"
- Actions: Edit (pencil icon), Resync (refresh icon), Disable (toggle)

### Interactions
- Hover card: subtle lift (Framer Motion)
- Click anywhere on card (except action icons) → details view

**Implementation Status**: ✅ Core components implemented
- `DataSourcesDashboard.tsx` - Main dashboard with grid layout
- `DataSourceCard.tsx` - Individual connector cards with status and actions
- `AddSourceButton.tsx` - Button to open add source wizard

## ➕ Add / Edit Data Source Flow

Use a full-screen Drawer (`<Drawer anchor="right">`) rather than a modal, to accommodate multi-step forms.

### Step A: Select Source Type
- Breadcrumb / Stepper at top: "1. Source Type → 2. Connection → 3. Mapping → 4. Sync Settings → 5. Preview" using Headless UI's Stepper
- Dropdown (MUI `<Select>`) with icons: SQL, NoSQL, REST API, CSV/Excel
- Next button disabled until selection made

**Implementation Status**: ✅ Step 1 implemented
- `AddSourceWizard.tsx` - Multi-step wizard with drawer layout
- `Step1ChooseType.tsx` - Source type selection with icons and validation

### Step B: Connection Details
Form (React Hook Form + Zod) fields vary by type:
- SQL: Host, Port, DB Name, Username, Password (with "Show/Hide"), SSL toggle
- REST: Base URL, Auth Type toggle (API Key / OAuth2), API Key field or Client ID/Secret fields
- CSV/Excel: File upload or S3 URL + IAM role selector

Test Connection button beneath form:
- On click: show inline spinner
- Success = green check + "Connection successful"
- Error = red alert with message
- Back / Next controls at bottom; "Next" only enabled when test passes

**Implementation Status**: ✅ Step 2 implemented
- `Step2ConnectionDetails.tsx` - Dynamic form based on source type
- Form validation with React Hook Form + Zod
- Test connection functionality with loading states

### Step C: Field Mapping
- Dual-column mapping table: left = your canonical fields (item_code, description, unit_price, available_qty), right = vendor's fields (auto-discover via schema introspection)
- Auto-Map button: attempts best-guess mapping; user adjusts mismatches
- Validation: highlight unmapped required fields in red; disable "Next" until resolved

**Implementation Status**: 🔄 In Progress
- Need to implement `Step3FieldMapping.tsx`
- Auto-discovery and mapping logic required

### Step D: Sync & Cache Settings
- Toggle Group (Headless UI `<Switch.Group>`): Batch Sync vs. Real-Time
- Batch Schedule Picker: simple cron presets ("Daily at 2 AM", "Hourly") using a dropdown + time picker
- Cache TTL Input: number + unit (hours/days)
- Tooltip: explain TTL's effect
- Next enabled once at least one sync type is configured

**Implementation Status**: ⏳ Pending
- Need to implement `Step4SyncSettings.tsx`
- Sync configuration and cache TTL settings

### Step E: Preview & Approve
- Preview Table (MUI DataGrid): show 5–10 normalized sample rows
- Inline warnings on any anomalies (e.g. price ≤ 0) with yellow icons & hover tooltips
- Approve & Enable button (primary) + "Back" (secondary)
- On click: drawer closes, toast "Source 'X' enabled. Initial sync in progress"

**Implementation Status**: ⏳ Pending
- Need to implement `Step5Preview.tsx`
- Sample data preview and final approval

## ✅ Post-Configuration Feedback

### Toast Notification
- Duration: 3 s
- Message: "Vendor Source 'ACME Fire Supplies' added and syncing"

### Dashboard Update
- New card appears, status "Syncing…" with spinner icon
- After sync: update to "Active" + last-synced timestamp

### Estimation Wizard CTA
On the "New Estimation" screen, a green banner appears:
- "Your vendor data is live—run Smart BOM now!"

**Implementation Status**: ⏳ Pending
- Toast notifications system
- Real-time status updates
- Integration with estimation wizard

## 📱 Mobile Considerations
- Drawer becomes full-screen page
- Cards stack in one column
- Mapping Table displays as accordion: each canonical field expands to show vendor field dropdown
- Stepper condenses to "Step X of 5" label

**Implementation Status**: ✅ Responsive design implemented
- Mobile-first approach with Tailwind CSS
- Responsive grid layouts
- Drawer adapts to mobile screens

## 🎨 Visual & Interaction Details

### Design Elements
- Color Palette: use Tailwind's neutral grays + your brand accent
- Icons: Heroicons for status (check, x, info, refresh, pencil)

### Animations
- Card hover: scale: 1.02, shadow lift
- Drawer slide-in: Framer Motion x: [100%, 0]
- Toast fade + slide-up

### Accessibility
- All form inputs labeled; error messages linked via aria-describedby
- Keyboard focus trap in drawer; "Esc" to close
- Contrast ratios meet WCAG AA

**Implementation Status**: ✅ Design system implemented
- Tailwind CSS for styling
- Heroicons for consistent iconography
- Accessibility considerations in place

## 📊 Implementation Progress Summary

### Completed (✅)
- Data Sources Dashboard layout and components
- Add Source Wizard framework with drawer
- Step 1: Source Type Selection
- Step 2: Connection Details with validation
- Responsive design and mobile considerations
- Type definitions and interfaces

### In Progress (🔄)
- Step 3: Field Mapping component
- Auto-discovery and mapping logic

### Pending (⏳)
- Step 4: Sync & Cache Settings
- Step 5: Preview & Approve
- Toast notification system
- Real-time status updates
- Integration with estimation wizard

### Next Steps
1. Complete Step 3 (Field Mapping) with auto-discovery
2. Implement Step 4 (Sync Settings) with batch/real-time options
3. Build Step 5 (Preview) with sample data display
4. Add toast notifications and real-time updates
5. Integrate with estimation wizard for seamless flow