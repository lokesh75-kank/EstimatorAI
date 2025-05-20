# Fire & Security Systems Estimator AI

A specialized AI agent for generating accurate cost estimates and technical proposals for fire protection and security systems across commercial, industrial, and residential sectors in the United States and Canada.

## Development Plan

### Phase 1: Core Backend Development (Current)
1. **System Detection & Analysis**
   - [x] Basic keyword-based system detection
   - [x] AI-powered system detection using OpenAI
   - [ ] Drawing analysis integration
   - [ ] Specification parsing improvements

2. **Cost Calculation Engine**
   - [x] Material cost calculations
   - [x] Labor cost calculations
   - [x] Equipment cost calculations
   - [x] Subcontractor cost calculations
   - [ ] Real-time supplier price updates
   - [ ] Regional cost adjustments
   - [ ] Historical cost database integration

3. **Compliance & Standards**
   - [x] Basic NFPA/ULC code checking
   - [x] Regional code database
   - [ ] Dynamic code updates
   - [ ] Insurance requirement checking
   - [ ] Local building code integration

4. **Value Engineering**
   - [x] Basic cost optimization suggestions
   - [x] AI-powered value engineering
   - [ ] Alternative solution recommendations
   - [ ] ROI calculations
   - [ ] Energy efficiency analysis

### Phase 2: API & Integration (Next)
1. **API Development**
   - [x] Basic FastAPI setup
   - [x] Core endpoints
   - [ ] Authentication & authorization
   - [ ] Rate limiting
   - [ ] API versioning
   - [ ] Webhook support

2. **Data Storage**
   - [ ] Project database setup
   - [ ] Cost history tracking
   - [ ] User preferences
   - [ ] Template management
   - [ ] Backup & recovery

3. **External Integrations**
   - [ ] Supplier API integration
   - [ ] Drawing software integration
   - [ ] Project management tools
   - [ ] Accounting software
   - [ ] CRM systems

### Phase 3: Frontend Development
1. **User Interface**
   - [ ] Project creation wizard
   - [ ] Drawing upload & analysis
   - [ ] Cost breakdown visualization
   - [ ] Proposal builder
   - [ ] Dashboard & reporting

2. **User Experience**
   - [ ] Responsive design
   - [ ] Dark/light mode
   - [ ] Accessibility features
   - [ ] Mobile optimization
   - [ ] Offline support

3. **Advanced Features**
   - [ ] Real-time collaboration
   - [ ] Version control
   - [ ] Template customization
   - [ ] Batch processing
   - [ ] Export options

### Phase 4: AI & Machine Learning
1. **Enhanced AI Capabilities**
   - [ ] Drawing recognition
   - [ ] Specification analysis
   - [ ] Cost prediction
   - [ ] Risk assessment
   - [ ] Value engineering

2. **Learning & Improvement**
   - [ ] Cost accuracy tracking
   - [ ] User feedback integration
   - [ ] Performance metrics
   - [ ] Automated updates
   - [ ] Quality assurance

### Phase 5: Testing & Deployment
1. **Testing**
   - [ ] Unit tests
   - [ ] Integration tests
   - [ ] Performance tests
   - [ ] Security audits
   - [ ] User acceptance testing

2. **Deployment**
   - [ ] CI/CD pipeline
   - [ ] Containerization
   - [ ] Cloud infrastructure
   - [ ] Monitoring setup
   - [ ] Backup systems

3. **Documentation**
   - [ ] API documentation
   - [ ] User guides
   - [ ] Developer guides
   - [ ] Training materials
   - [ ] Maintenance procedures

## Current Features

- Project cost estimation for multiple system types:
  - Fire alarm systems (NFPA, UL/ULC standards)
  - Fire suppression systems (wet/dry/clean agent)
  - Access control and intrusion detection
  - Video surveillance (CCTV) and perimeter security

- Comprehensive cost breakdowns including:
  - Material costs with supplier information
  - Labor costs with regional rate adjustments
  - Equipment rental costs
  - Subcontractor costs
  - Contingency calculations
  - Tax calculations

- Regional compliance checking:
  - NFPA standards (US)
  - ULC standards (Canada)
  - Local building codes
  - Insurance requirements

- Value engineering suggestions
- Risk factor identification
- Professional proposal generation

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/estimator-ai-agent.git
cd estimator-ai-agent
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Usage

1. Start the API server:
```bash
uvicorn estimator_agent.api:app --reload
```

2. Access the API documentation at `http://localhost:8000/docs`

### API Endpoints

- `POST /estimate`: Generate a project estimate
- `POST /proposal`: Generate a proposal from an estimate
- `GET /codes/{country}`: Get applicable codes for a country
- `GET /labor-rates/{country}`: Get labor rates for a country

### Example Usage

```python
from estimator_agent.models import ProjectLocation
from estimator_agent.agent import EstimatorAgent

# Initialize the estimator
estimator = EstimatorAgent()

# Create a project location
location = ProjectLocation(
    country="US",
    state_province="CA",
    city="San Francisco",
    postal_code="94105",
    seismic_zone="4",
    climate_zone="3"
)

# Generate an estimate
estimate = estimator.generate_estimate(
    project_id="PROJ-001",
    client_name="Acme Corp",
    project_name="Office Building Fire Protection",
    location=location,
    drawings={},  # Add your drawings data
    specifications={}  # Add your specifications data
)

# Generate a proposal
proposal = estimator.generate_proposal(estimate)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- NFPA for fire protection standards
- ULC for Canadian standards
- Various industry partners for cost data and best practices 