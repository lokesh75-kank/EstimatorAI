# Frontend Project Structure

## 📁 Root Structure

```
frontend/
├── app/                    # Next.js 14 app directory
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configurations
├── styles/               # Global styles and Tailwind config
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## 📁 App Directory Structure

```
app/
├── (auth)/               # Authentication routes
│   ├── login/
│   └── register/
├── dashboard/            # Main dashboard
│   ├── page.tsx
│   └── layout.tsx
├── data-sources/         # Vendor data source management
│   ├── page.tsx         # Data sources dashboard
│   ├── [id]/            # Individual source details
│   │   └── page.tsx
│   └── new/             # New source configuration
│       ├── page.tsx
│       └── steps/       # Multi-step form components
│           ├── source-type.tsx
│           ├── connection.tsx
│           ├── mapping.tsx
│           ├── sync-settings.tsx
│           └── preview.tsx
├── estimates/           # Estimation management
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
├── settings/            # Application settings
│   └── page.tsx
├── layout.tsx           # Root layout
└── page.tsx            # Landing page
```

## 📁 Components Directory

```
components/
├── common/              # Shared components
│   ├── Button/
│   ├── Card/
│   ├── Input/
│   ├── Select/
│   └── Toast/
├── data-sources/        # Data source specific components
│   ├── SourceCard/
│   ├── ConnectionForm/
│   ├── FieldMapping/
│   └── SyncSettings/
├── estimates/          # Estimation specific components
│   ├── EstimateForm/
│   ├── BOMTable/
│   └── CostSummary/
├── layout/            # Layout components
│   ├── Header/
│   ├── Sidebar/
│   └── Footer/
└── ui/                # UI components
    ├── Badge/
    ├── Drawer/
    ├── Modal/
    └── Stepper/
```

## 📁 Hooks Directory

```
hooks/
├── useDataSources.ts    # Data source management
├── useEstimates.ts      # Estimation management
├── useForm.ts          # Form handling
└── useToast.ts         # Toast notifications
```

## 📁 Lib Directory

```
lib/
├── api/                # API integration
│   ├── client.ts      # Axios instance
│   ├── data-sources.ts
│   └── estimates.ts
├── utils/             # Utility functions
│   ├── formatters.ts
│   ├── validators.ts
│   └── helpers.ts
└── constants/         # Application constants
    ├── routes.ts
    └── config.ts
```

## 📁 Types Directory

```
types/
├── data-source.ts     # Data source types
├── estimate.ts        # Estimate types
├── form.ts           # Form types
└── api.ts            # API response types
```

## 📁 Styles Directory

```
styles/
├── globals.css        # Global styles
└── tailwind.config.js # Tailwind configuration
```

## Component Structure Example

Each component directory should follow this structure:

```
ComponentName/
├── index.tsx          # Main component
├── ComponentName.tsx  # Component implementation
├── types.ts          # Component-specific types
├── styles.ts         # Component-specific styles
└── __tests__/        # Component tests
    └── ComponentName.test.tsx
```

## Key Features Implementation

### Data Source Configuration
- Multi-step form using Headless UI Stepper
- Form validation with React Hook Form + Zod
- Real-time connection testing
- Field mapping with drag-and-drop support
- Preview with MUI DataGrid

### Responsive Design
- Mobile-first approach with Tailwind
- Responsive grid layouts
- Adaptive drawer/modal behavior
- Touch-friendly interactions

### Accessibility
- ARIA labels and roles
- Keyboard navigation
- Focus management
- WCAG AA compliance

### State Management
- React Context for global state
- Local state with useState/useReducer
- Form state with React Hook Form
- API state with custom hooks

### Performance
- Code splitting with Next.js
- Lazy loading of components
- Optimized images
- Memoization where needed 