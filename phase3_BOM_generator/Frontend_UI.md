1. “Data Sources” Dashboard
Purpose: Central hub to see all configured connectors at a glance.

Element	Description
Header Bar	Title “Data Sources” + “Add Source” button
Connector Cards/List	One card per source, showing:
• Name & Type (SQL, NoSQL, REST, File)	
• Status badge (Connected / Error / Not Configured)	
• Last sync timestamp & cache TTL	
• Quick-actions: Test ▶️, Edit ✏️, Delete 🗑️	
Global Actions	Filter by type, Search by name, Bulk “Test All”

Visual: Card–grid on desktop, list on mobile, consistent card heights, tailwind-based shadows & hover states.

2. “Add New Source” Wizard
Step 1: Choose Source Type
• Radio cards for SQL, NoSQL, REST, File
• Brief descriptions & icons

Step 2: Connection Details
• Form fields vary by type:

SQL: Host, Port, DB name, Username, Password, SSL toggle

Mongo/Dynamo: Connection URI, Region (for Dynamo)

REST: Base URL, Auth type (OAuth/API Key), Credential inputs

File: Upload sample CSV/Excel or point to S3/Blob path
• Real-time validation (e.g. ping after host/URL entry)

Step 3: Field Mapping
• Auto-detect fields from sample payload (or DB schema)
• Editable table of “Source Field” → “Standard Field” (item_code, unit_price, etc.)
• Inline search & dropdown to change mapping

Step 4: Cache & Sync Settings
• Cache TTL input (e.g. slider: 1 min – 24 h)
• Sync mode:

⏰ Scheduled full sync (cron expression picker)

⚡ On-demand real-time lookup

Step 5: Review & Test
• Summary of settings
• “Test Connection” button with live log output panel
• “Fetch Sample Records” button to display 5 normalized items in a mini-table

Finish:
• “Save & Enable” → returns to Data Sources Dashboard, card now shows “Connected” status.

3. Connector Detail & Edit View
Accessible via Edit ✏️ on a card. Prefills same wizard steps.

History panel on the right:
• Last 5 syncs with timestamps & outcomes
• Error logs collapsible

“Force Re-sync” button at top.

4. Inline BOM Generator Integration
Once a source is connected, enable it instantly in the BOM wizard:

Data-Source Selector
• Dropdown in “Step 2: Upload Documents” or “Step 3: Auto-Fill” where user can choose one or more data sources for inventory lookup.

Real-Time Preview
• As soon as a source is selected, show a “sample fetch” of normalized records (first 3 items) alongside the form.

Conflict Alerts
• If two sources define different unit_price for same item_code, visually flag in UI and allow user to choose precedence.

5. Error & Help Feedback
Inline tooltips on every form field with brief explanation.

Help icon opens context-sensitive side panel with:
• FAQs (“Why can’t I connect to my SQL DB?”)
• Link to API docs for advanced settings.

Live chat link to AI Agent – “Need help mapping fields? Ask me!”

6. Responsive & Accessibility
Mobile view: stacked sections, collapsible panels for mapping and settings.

Keyboard navigation: tab‐focus order through wizard steps.

ARIA labels on all interactive elements.

High-contrast mode toggle in header.

Visual Style Notes
Layout: 12-column grid; center wizard at max-width 800px.

Typography:

Headings: text-xl font-semibold

Labels: text-sm font-medium

Inputs: text-base

Colors (Tailwind tokens):

Primary buttons: bg-blue-500 hover:bg-blue-600 text-white

Status badges:

Connected: bg-green-100 text-green-800

Error: bg-red-100 text-red-800

Disabled: bg-gray-100 text-gray-600

Spacing: p-4 cards, gap-6 grid, consistent mb-4 between form fields.