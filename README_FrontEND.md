// This file outlines the suggested folder structure and frontend pages for your AI Estimator app in a TypeScript + Next.js + TailwindCSS setup.

// ✅ FOLDER STRUCTURE (in /app or /src/app if using app router)

/app
 ┣ /dashboard
 ┃ ┗ page.tsx              // Estimation dashboard
 ┣ /estimate
 ┃ ┣ /[id]
 ┃ ┃ ┗ page.tsx           // Proposal detail view
 ┃ ┗ page.tsx              // Estimation form page
 ┣ /upload
 ┃ ┗ page.tsx              // RFQ & blueprint upload page
 ┣ /settings
 ┃ ┗ page.tsx              // Company branding, markup configs
 ┣ layout.tsx              // App layout shell
 ┗ page.tsx                // Landing page (overview/demo)

/components
 ┣ EstimationForm.tsx      // Form for intake (building specs)
 ┣ ProposalCard.tsx        // Reusable proposal summary card
 ┣ Sidebar.tsx             // Sidebar navigation
 ┣ Topbar.tsx              // Top navigation with avatar/branding
 ┗ ChatWidget.tsx          // AI chatbot interface (optional)

/types
 ┗ estimation.ts           // Interfaces for Project, Proposal, BOM, etc.

/lib
 ┣ api.ts                  // Axios setup
 ┣ utils.ts                // Cost calculator, formatters
 ┗ openai.ts               // API wrapper for estimation logic

/styles
 ┗ globals.css             // Tailwind & base styles


// ✅ THEMING: TAILWIND + SHADCN + CUSTOM BRAND

// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#FF5E3A',
        secondary: '#1F2937',
        accent: '#FDBA74',
        background: '#F9FAFB',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
};


// ✅ RECOMMENDED UI LIBRARIES
// - shadcn/ui
// - lucide-react (icons)
// - react-hook-form (form validation)
// - react-query or tanstack query (API data)
// - framer-motion (animations)


// ✅ STARTING GUIDE FOR CURSOR
// 1. Clone the Next.js TypeScript starter: `npx create-next-app@latest ai-estimator --typescript`
// 2. Replace /app with the structure above
// 3. Install Tailwind + ShadCN: `npx shadcn-ui@latest init`
// 4. Add sidebar + topbar layout in `layout.tsx`
// 5. Implement upload + estimation logic page by page
// 6. Use `src/types/estimation.ts` to define core entities: Project, Proposal, LineItem
// 7. Connect to your backend endpoints from /lib/api.ts

// Let me know if you want page templates, layout code, or a full working starter repo.
