# AI Estimator - User Journey & UI/UX Flow

Below is a detailed, end-to-end UI/UX flow for creating and managing estimation projects in the AI Estimator. The flow is project-centric, allowing users to organize their work better and leverage AI agents for automated estimation creation.

## 1. Entry Point: Landing Page
**Screen:** `/` (Landing Page)

**Elements:**
- **Hero Section:** Main value proposition with "Create New Project" and "Connect Data Sources" CTAs
- **Feature Highlights:** Cards showcasing AI estimation, data integration, cost accuracy
- **Quick Links:** "Create New Project", "Connect Data Sources", "View Projects", "Learn More"
- **Navigation:** Logo, "Projects", "Data Sources", "Login/Register"

**Primary Actions:**
- Click "Create New Project" → Project Creation Wizard
- Click "Connect Data Sources" → Data Sources Dashboard
- Click "View Projects" → Projects Dashboard

## 2. Project Creation Wizard
**Screen:** `/projects/new`

**Multi-step wizard with progress indicator:**
1. **Project Details** → 2. **Data Sources** → 3. **Requirements** → 4. **Review & Create**

### Step 1: Project Details
**Fields:**
- Project Name (required, max 50 chars)
- Client Name (typeahead from past clients)
- Client Email (email validation)
- Project Location (autocomplete with Google Places)
- Building Type (dropdown: office, residential, industrial, etc.)
- Square Footage (number input)
- Number of Floors (number input)
- Number of Zones (number input)
- Project Description (free text, optional)

**Actions:**
- Next (enabled only when required fields valid)
- Save Draft (auto-saves progress)

**Validation & Feedback:**
- Real-time inline errors
- Auto-save on field blur
- Progress indicator updates

### Step 2: Data Sources
**Two-column layout:**
- **Left:** List of available data connectors with status badges
- **Right:** "Add New Source" button + connector preview

**Data Source Types:**
- ERP Systems (SAP, Oracle, etc.)
- CRM Systems (Salesforce, HubSpot, etc.)
- Inventory Management (QuickBooks, etc.)
- Custom APIs
- File Uploads (CSV, Excel)

**Actions:**
- Toggle connectors to include in project
- Add New Source → Data Source Wizard
- Next/Back navigation

### Step 3: Requirements
**Document Upload & Requirements:**
- Drag & drop file upload area
- Supported formats: PDF, DOCX, XLSX, CSV
- Requirements text input
- Building specifications
- Security requirements
- Compliance needs

**Actions:**
- Upload documents
- Add requirements text
- Next/Back navigation

### Step 4: Review & Create
**Summary view:**
- Project details summary
- Selected data sources
- Uploaded documents
- Requirements summary

**Actions:**
- Back to edit any step
- Create Project (final action)

**Post-Creation:** Redirects to Project Dashboard

## 3. Project Dashboard
**Screen:** `/projects/[id]`

**Layout:**
- **Header:** Project name, status badges, back navigation
- **Left Sidebar:** Project info + Quick Actions
- **Main Content:** Tabbed interface

### Left Sidebar - Project Info
**Project Details:**
- Client information
- Location and building specs
- Project status and priority badges

**Quick Actions:**
- **"Create AI Estimation"** (primary action)
- **"Manual Estimation"** (link to wizard)
- **"Edit Project"** (project settings)

### Main Content - Tabbed Interface

#### Overview Tab
**Content:**
- Project description
- Key metrics cards (Data Sources, Documents, Estimations)
- **AI Agent Section:** Prominent call-to-action with description
- Recent activity

#### Estimations Tab
**Content:**
- List of all project estimations
- Status badges (Pending, Processing, Completed, Failed)
- Estimation details (cost, BOM items, confidence)
- **"New Estimation"** button for AI agent

#### Documents Tab
**Content:**
- Project document management
- Upload/view/download functionality
- Document status and metadata

#### Settings Tab
**Content:**
- Project configuration
- Team access settings
- Export options

## 4. AI Estimation Creation
**Trigger:** "Create AI Estimation" button from Project Dashboard

**Process:**
1. **Initialization:** Shows loading state with spinner
2. **Data Analysis:** AI analyzes project requirements, data sources, documents
3. **Processing:** Real-time progress updates
4. **Completion:** Results displayed with cost breakdown

**AI Agent Features:**
- Analyzes uploaded documents for requirements
- Integrates data from connected sources
- Applies industry-standard BOM rules
- Calculates regional labor rates
- Considers compliance requirements
- Provides confidence scores

**Results Display:**
- Total estimated cost
- Detailed BOM breakdown
- Confidence percentage
- Assumptions and notes
- Export options (PDF, CSV)

## 5. Manual Estimation Wizard
**Screen:** `/estimation/new?projectId=[id]`

**Alternative to AI estimation with manual control:**
- Step 1: Project Overview
- Step 2: Document Upload
- Step 3: BOM Configuration
- Step 4: Cost Review & Export

## 6. Projects Dashboard
**Screen:** `/projects`

**Features:**
- **Project List:** All user projects with status, priority, last updated
- **Filters:** Status, priority, date range, client
- **Search:** Project name, client, location
- **Actions:** View project, create estimation, edit, archive

**Project Cards Include:**
- Project name and client
- Status and priority badges
- Last updated timestamp
- Quick action buttons
- Estimated vs actual cost (if available)

## 7. Data Sources Management
**Screen:** `/data-sources`

**Features:**
- **Data Source Cards:** List of all configured connectors
- **Status Indicators:** Connected, disconnected, error states
- **Last Sync Info:** Timestamp and record count
- **Actions:** Edit, resync, toggle, delete

**Add Source Wizard:**
- Step 1: Choose Source Type
- Step 2: Connection Details
- Step 3: Field Mapping
- Step 4: Cache & Sync Settings
- Step 5: Review & Test

## 8. Estimation Details & Export
**Screen:** `/estimations/[id]`

**Content:**
- **Cost Breakdown:** Detailed BOM with line items
- **Assumptions:** AI reasoning and confidence factors
- **Compliance Check:** Code requirements and flags
- **Export Options:** PDF proposal, CSV data, email to client

## UX Details & Best Practices

### **Consistency**
- Keep "Back"/"Next" in consistent positions
- Primary actions always on the right
- Consistent color scheme and typography

### **Progress Management**
- Auto-save after each step
- Show "Saved" indicators
- Draft recovery on page reload

### **Guidance & Help**
- Contextual help icons
- AI chat integration
- Tooltips for complex features
- Progressive disclosure for advanced options

### **Performance**
- Lazy-load large tables
- Show skeleton loaders
- Optimistic UI updates
- Background processing for AI tasks

### **Accessibility**
- All form elements properly labeled
- Color-contrast compliant
- Keyboard navigation support
- Screen reader friendly

### **Mobile Responsiveness**
- Responsive design for all screen sizes
- Touch-friendly interface elements
- Optimized layouts for mobile workflows

## Key User Benefits

1. **Project Organization:** All work organized by projects with clear status tracking
2. **AI Integration:** Seamless AI agent integration for automated estimation
3. **Data Connectivity:** Easy integration with existing business systems
4. **Flexibility:** Both AI and manual estimation options
5. **Professional Output:** Branded proposals and detailed breakdowns
6. **Collaboration:** Team access and sharing capabilities

This project-centric flow ensures users can efficiently manage multiple estimation projects while leveraging AI capabilities for faster, more accurate cost estimates. The workflow supports both automated AI estimation and manual control, providing flexibility for different use cases and user preferences.