# Estimator AI Agent 🔥🛡️

An AI-powered estimation system for fire & security systems that automates document processing, compliance checking, and proposal generation.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.11+
- npm or yarn

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Estimator_AI_agent
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Start the development servers**
   ```bash
   # Start frontend only
   npm run dev

   # Or start both frontend and backend
   npm run dev:frontend & npm run dev:backend
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 📁 Project Structure

```
Estimator_AI_agent/
├── frontend/                 # Next.js React frontend
│   ├── app/                 # Next.js 13+ app directory
│   ├── components/          # Reusable UI components
│   ├── services/           # API services
│   ├── types/              # TypeScript type definitions
│   └── lib/                # Utility functions
├── backend/                 # Node.js/Express backend
│   ├── src/                # Source code
│   └── config/             # Configuration files
└── docs/                   # Documentation
```

## 🎯 Features

### ✅ Working Features
- **Document Upload & Processing** - Upload PDFs, images, and documents
- **AI-Powered Extraction** - Automatically extract building details and device information
- **Interactive UI Components** - Modern, responsive design with animations
- **Project Management** - Create and manage estimation projects
- **Data Source Integration** - Connect to external data sources
- **Real-time Chat Interface** - AI assistant for project questions

### 🔧 Recent Improvements
- ✅ Fixed all TypeScript compilation errors
- ✅ Cleaned up API service configuration
- ✅ Improved component architecture
- ✅ Added proper error handling
- ✅ Enhanced document processing workflow
- ✅ Streamlined build process

## 🛠️ Available Scripts

### Root Directory Commands
```bash
npm run dev              # Start frontend development server
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only
npm run build           # Build frontend for production
npm run install:all     # Install all dependencies
```

### Frontend Commands (from /frontend)
```bash
npm run dev             # Development server
npm run build           # Production build
npm run start           # Start production server
npm run lint            # Run ESLint
```

### Backend Commands (from /backend)
```bash
npm run dev             # Development server with hot reload
npm run build           # Build TypeScript
npm run start           # Start production server
npm test                # Run tests
```

## 🏗️ Architecture

### Frontend Stack
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations
- **Heroicons** - Icon library

### Backend Stack
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **OpenAI API** - AI processing
- **AWS Services** - Cloud integration

## 🔄 User Journey

1. **Project Creation** - Start with basic project details
2. **Document Upload** - Upload architectural plans, specifications
3. **AI Processing** - Automatic extraction of building data and device requirements
4. **Review & Edit** - Verify and modify extracted information
5. **BOM Generation** - Generate bill of materials with compliance checking
6. **Proposal Creation** - Create professional proposals with pricing

## 🚦 Current Status

### ✅ Completed
- Frontend build system working
- Component architecture established
- API services configured
- Document upload workflow
- Project management interface

### 🔄 In Progress
- Backend API endpoints
- AI processing pipeline
- Database integration

### 📋 Planned
- Advanced compliance checking
- Automated pricing
- PDF proposal generation
- Email integration

## 🐛 Troubleshooting

### Common Issues

1. **"npm run dev" not found**
   ```bash
   # Make sure you're in the right directory
   cd frontend && npm run dev
   # Or use the root command
   npm run dev
   ```

2. **Module not found errors**
   ```bash
   # Reinstall dependencies
   npm run install:all
   ```

3. **Build errors**
   ```bash
   # Clean and rebuild
   cd frontend && rm -rf .next && npm run build
   ```

## 📚 Documentation

- [Frontend README](./frontend/README.md) - Detailed frontend documentation
- [Backend README](./backend/README.md) - Backend API documentation
- [User Journey](./README_USER_JOURNEY.md) - Complete user workflow

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and build
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Ready to start estimating? Run `npm run dev` and visit http://localhost:3000** 🚀 