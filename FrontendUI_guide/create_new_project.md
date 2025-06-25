# Create New Project - UI/UX Flow Guide

## Overview
The Create New Project wizard is a 4-step process that guides users through setting up a new estimation project with AI-powered vendor sourcing capabilities.

## Step Flow
1. **Project Details** - Basic project information
2. **Requirements** - Upload documents & specifications  
3. **Data Sources** - Connect to business systems & AI vendor sourcing
4. **Review & Create** - Review and create project

---

## Step 1: Project Details

### Purpose
Collect essential project information to establish the foundation for estimation with professional-grade validation and user experience.

### Form Structure
The form is organized into logical sections for better user experience:

#### 1. Basic Project Details Section
- **Project Name** (required, max 100 chars)
  - Professional placeholder: "e.g., Downtown Office Building Fire System"
  - Real-time validation with error messages
  - Visual feedback with red border and background for errors

- **Building Type** (required, dropdown)
  - Options: Office Building, Residential, Commercial, Industrial, Healthcare, Education, Retail, Warehouse, Hospitality, Government, Other
  - Enhanced with additional professional building types

- **Square Footage** (required, number input)
  - Unit indicator: "sq ft" displayed on the right
  - Validation: > 0, < 1,000,000
  - Professional formatting with placeholder "0"

- **Number of Floors** (optional, number input)
  - Range: 1-100 floors
  - Default value: 1

#### 2. Client Information Section
- **Client Name** (optional, text input)
  - Professional placeholder: "Enter client name"

- **Client Email** (optional, email validation)
  - Professional placeholder: "client@example.com"
  - Real-time email format validation
  - Visual error feedback

- **Client Phone** (optional, tel input)
  - Professional placeholder: "(555) 123-4567"
  - Phone number formatting support

- **Project Location** (optional, text input)
  - Professional placeholder: "Enter project address or location"

#### 3. Timeline & Budget Section
- **Estimated Start Date** (optional, date picker)
  - HTML5 date input for easy selection

- **Estimated End Date** (optional, date picker)
  - HTML5 date input for easy selection

- **Project Priority** (dropdown)
  - Options: Low Priority, Medium Priority, High Priority
  - Professional labeling

- **Budget** (optional, number input)
  - Currency symbol ($) displayed on the left
  - Step: 0.01 for precise amounts
  - Validation: non-negative values
  - Professional placeholder: "0"

#### 4. Project Description Section
- **Detailed Description** (optional, textarea)
  - 5 rows for comprehensive input
  - Professional placeholder: "Describe the project scope, specific requirements, compliance needs, and any special considerations..."
  - Helpful guidance text below: "Include details about fire safety requirements, security system needs, compliance standards, and any special considerations."

### Professional UI Features

#### Visual Design
- **Sectioned Layout**: Clear visual separation with section headers
- **Professional Typography**: Consistent font weights and sizes
- **Enhanced Spacing**: Generous padding and margins for readability
- **Color Scheme**: Professional blue accent colors with gray backgrounds
- **Border Styling**: Subtle borders with focus states

#### Form Elements
- **Larger Input Fields**: 16px padding for better touch targets
- **Focus States**: Blue ring focus indicators
- **Transition Effects**: Smooth color transitions on interaction
- **Required Field Indicators**: Red asterisks (*) for required fields
- **Unit Indicators**: Currency ($) and unit (sq ft) symbols

#### Validation & Error Handling
- **Real-time Validation**: Field-level validation on blur
- **Visual Error States**: Red borders and light red backgrounds
- **Error Messages**: Clear, helpful error text below fields
- **Form-level Validation**: Prevents progression with validation errors
- **Smart Validation Rules**:
  - Project name: required, max 100 characters
  - Building type: required selection
  - Square footage: required, > 0, < 1,000,000
  - Email: format validation when provided
  - Budget: non-negative values

#### User Experience Enhancements
- **Disabled Next Button**: Automatically disabled when validation fails
- **Professional Placeholders**: Helpful examples in input fields
- **Help Text Panel**: Blue information panel with guidance
- **Responsive Design**: Adapts to all screen sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation

### Navigation & Validation
- **Next Button**: Disabled until all required fields are valid
- **Validation Feedback**: Real-time error messages and visual indicators
- **Progress Tracking**: Clear indication of current step
- **Error Prevention**: Form-level validation before step progression

### Help & Guidance
- **Information Panel**: Blue panel explaining the importance of accurate project details
- **Field Guidance**: Helpful text under description field
- **Professional Context**: Fire & security system specific guidance

---

## Step 2: Requirements

### Purpose
Upload project documents and specifications for AI processing and analysis.

### Document Upload Area
- **Drag & Drop Zone** with visual feedback
- **File Types Supported**: PDF, DOCX, JPG, PNG, ZIP
- **Upload Button** for file selection
- **File Size Limits**: Displayed below upload area

### Document Processing Info
- **Info Panel** explaining automatic document processing
- **Extraction Details**: Requirements, specifications, technical details
- **Processing Status**: Real-time feedback during upload

### Features
- Multiple file upload support
- File preview and removal
- Processing progress indicators
- Error handling for unsupported files

---

## Step 3: Data Sources

### Purpose
Connect to business systems and enable AI-powered vendor sourcing for project materials.

### AI Vendor Sourcing Section

#### Toggle Control
- **Checkbox**: "Allow AI agent to source vendors, details, and materials as per project requirements"
- **Default State**: Enabled (true)
- **Description**: Explains AI sourcing capabilities

#### AI Sourcing States

##### Loading State
- **Progress Banner**: Blue background with spinner
- **Status Text**: "Vendor Sourcing: finding best prices for smoke detectors…"
- **Animation**: Fade-in slide-down entrance
- **Accessibility**: `role="status"` for screen readers

##### Success State
- **Header**: "🤖 AI-Sourced Sample SKUs"
- **Preview Table** with columns:
  - Code (monospace font)
  - Description
  - Unit Price (formatted as currency)
  - Vendor (badge with hover tooltip showing source)
  - Action (Edit button)
- **Controls**:
  - "Refresh samples" link
  - "Configure manual connectors" link
- **Styling**: Alternating row colors, vendor badges with hover effects

##### Error State
- **Error Banner**: Red background with error icon
- **Error Message**: "Vendor sourcing failed. Please check your network or configure a manual source."
- **Action Buttons**:
  - "Retry" button
  - "Configure Manual Source" link
- **Accessibility**: `role="alert"` for immediate notification

### Manual Data Source Connectors

#### Available Connectors
1. **ERP System** (📊)
   - Description: SAP, Oracle, etc.
   - Connect Button: "Connect ERP"

2. **CRM System** (👥)
   - Description: Salesforce, HubSpot, etc.
   - Connect Button: "Connect CRM"

3. **Project Management** (📋)
   - Description: Jira, Asana, etc.
   - Connect Button: "Connect PM Tool"

#### Connector Features
- **Hover Effects**: Border color changes on hover
- **Visual Icons**: Emoji icons for each connector type
- **Status Indicators**: Connection status badges
- **Quick Actions**: Connect buttons for each system

### Information Panel
- **Title**: "Data Source Integration"
- **Description**: Explains how data sources populate project details
- **Icon**: Information icon with blue styling

---

## Step 4: Review & Create

### Purpose
Review all project information before final creation and redirect to estimation.

### Review Sections

#### Project Information
- Project Name
- Building Type
- Square Footage
- Number of Floors

#### Client Information
- Client Name (or "Not specified")
- Client Email (or "Not specified")
- Client Phone (or "Not specified")
- Project Location (or "Not specified")
- Priority (capitalized)

#### Timeline & Budget
- Estimated Start Date (or "Not specified")
- Estimated End Date (or "Not specified")
- Budget (formatted as currency or "Not specified")

#### Project Description
- **Conditional Display**: Only shown if description exists
- **Styling**: Gray background with padding
- **Format**: Preserves line breaks and formatting

### Success Message
- **Panel**: Green background with checkmark icon
- **Title**: "Ready to Create Project"
- **Description**: Explains next steps after project creation
- **Next Action**: Redirects to project detail page

### Navigation
- **Back Button**: Returns to previous step
- **Create Project Button**: Final action to create project
- **Loading State**: "Creating Project..." during submission

---

## User Experience Features

### Progress Indicator
- **Visual Steps**: Numbered circles with completion checkmarks
- **Current Step**: Blue background with white text
- **Completed Steps**: Green background with checkmark
- **Future Steps**: Gray background with step number

### Responsive Design
- **Desktop**: Sidebar layout with main content area
- **Mobile**: Stacked layout with full-width sections
- **Tablet**: Adaptive layout between desktop and mobile

### Accessibility
- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Clear focus indicators
- **Error Announcements**: Screen reader notifications for errors

### Animation & Feedback
- **Smooth Transitions**: Between steps and states
- **Loading States**: Spinners and progress indicators
- **Success Feedback**: Visual confirmation of actions
- **Error Handling**: Clear error messages with recovery options

---

## Technical Implementation

### State Management
- **Form Data**: Centralized project data state with comprehensive field coverage
- **Step Navigation**: Current step tracking with validation
- **Validation State**: Real-time field validation with error tracking
- **AI Sourcing State**: Loading, success, error states

### API Integration
- **Project Creation**: POST to `/api/projects` with comprehensive data mapping
- **Backend Integration**: Proper data transformation between frontend and backend schemas
- **Error Handling**: Detailed error messages and fallback handling
- **Success Flow**: Redirect to project detail page with proper data

### Data Schema
- **Frontend Schema**: Comprehensive ProjectFormData interface
- **Backend Mapping**: Proper transformation to backend API format
- **Validation**: Both client-side and server-side validation
- **Type Safety**: Full TypeScript support with proper interfaces

### Performance
- **Lazy Loading**: Components loaded as needed
- **Optimized Build**: Next.js production optimization
- **Caching**: Form data persistence across steps
- **Debounced Validation**: Performance-optimized field validation

---

## Backend Integration Details

### API Endpoints
- **POST /api/projects**: Create new project with comprehensive validation
- **GET /api/projects**: Fetch all projects
- **Error Handling**: Proper HTTP status codes and error messages

### Data Transformation
- **Frontend to Backend**: Proper field mapping and type conversion
- **Required Fields**: Validation of essential project information
- **Optional Fields**: Graceful handling of missing data
- **Schema Compliance**: Adherence to backend API requirements

### Error Management
- **Validation Errors**: Field-level and form-level error handling
- **API Errors**: Proper error propagation from backend
- **User Feedback**: Clear error messages and recovery options
- **Fallback Handling**: Graceful degradation on API failures

---

## Future Enhancements

### AI Integration
- **Real Vendor APIs**: Connect to actual vendor databases
- **Smart Recommendations**: ML-based material suggestions
- **Price Optimization**: Best price finding algorithms
- **Compliance Checking**: Automatic compliance validation

### Advanced Features
- **Template Projects**: Pre-configured project templates
- **Team Collaboration**: Multi-user project editing
- **Version Control**: Project revision history
- **Export Options**: PDF, Excel, CSV export formats
- **Advanced Validation**: Custom validation rules per building type
- **Auto-save**: Automatic form data persistence
- **Draft Projects**: Save and resume project creation
