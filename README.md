# AI-Powered Fire & Security Systems Estimator

An intelligent estimation system that automates the process of generating accurate, compliant proposals for fire alarm and security systems integration.

## 🎯 Target Audience

- Fire alarms and Security Systems Integrators (small to mid-sized)
- General Contractors & Builders needing turnkey safety solutions
- Facility Managers for schools, hospitals, warehouses, etc.
- Architectural & MEP Engineering Firms
- Government & Municipal Agencies

## 💡 Core Features

### 1. Intelligence Layer
- LLM-powered understanding of customer requirements
- NFPA, NEC, UL standards compliance
- Automated BoM generation and system layout recommendations
- Professional proposal generation

### 2. Input Collection Engine
- Email parser for requirements
- Blueprint/AutoCAD parser
- Form-based input for scope details
- Image & floor plan recognition

### 3. Cost Estimation Engine
- Vendor pricing database
- Automated device estimation
- Labor and permit cost calculation
- Dynamic profit margin management

### 4. Proposal Generation Engine
- Auto-populated templates
- Comprehensive SOW sections
- Customizable branding
- Compliance documentation

### 5. Deployment & Compliance
- AWS infrastructure (GovCloud support)
- Model validation pipeline
- Regular compliance updates
- SOC2 + ISO 27001 compliance

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- AWS Account
- OpenAI API Key

### Quick Start
1. Clone the repository
2. Set up environment variables (see `docs/environment-setup.md`)
3. Install dependencies:
   ```bash
   # Backend
   pip install -r requirements.txt
   
   # Frontend
   cd frontend
   npm install
   ```
4. Start the development servers:
   ```bash
   # Backend
   uvicorn estimator_agent.api:app --reload --port 8001
   
   # Frontend
   cd frontend
   npm start
   ```

## 📚 Documentation

- [Development Setup](docs/development-setup.md)
- [Environment Configuration](docs/environment-setup.md)
- [API Documentation](docs/api-documentation.md)

## 🔐 Security

- All API keys stored in AWS Secrets Manager
- SOC2 + ISO 27001 compliance
- Regular security audits
- Data encryption at rest and in transit

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🛠️ Development Best Practices

### Version Control
- Use Git religiously — commit after each working section
- Don't trust built-in revert functions yet
- If AI gets stuck in loops, git reset --hard and start fresh

### Testing Strategy
- Write high-level integration tests that simulate user clicking through the app
- Avoid low-level unit tests — focus on end-to-end functionality
- Implement tests before moving to the next feature
- Use tests as guardrails for safe refactoring

### Debugging
- Copy-paste error messages directly into the LLM
- Ask AI to think through 3-4 possible causes before coding
- Reset after each failed attempt — don't accumulate "layers of crap"
- Add extensive logging when debugging complex issues
- If one model fails repeatedly, switch to a different LLM

### Advanced Configuration
- Write detailed instructions files (some founders write 100+ lines)
- Download API docs locally instead of pointing to web docs
- Use screenshots to show UI bugs or design inspiration
- Try voice input tools like Aqua for 2x faster prompting

### Architecture Best Practices
- Keep files small and modular — easier for both humans and LLMs
- Choose mature frameworks with lots of training data (Rails > Rust/Elixir)
- Build complex features as standalone projects first, then integrate
- Use service-based architecture with clear API boundaries
- Test complex functionality in isolation before adding to main codebase 