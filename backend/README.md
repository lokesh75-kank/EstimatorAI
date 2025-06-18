# Estimator AI Backend

This is the backend service for the Estimator AI application, which provides BOM (Bill of Materials) generation and cost estimation functionality.

## Features

- Data connector layer for multiple inventory sources (SQL, REST APIs)
- BOM generation rules engine with AI-powered rule discovery
- Cost estimation with equipment, labor, permits, and taxes
- RESTful API endpoints for estimate generation and management

## Prerequisites

- Node.js 18 or higher
- MySQL 8.0 or higher
- OpenAI API key

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and update the configuration:
   ```bash
   cp .env.example .env
   ```
4. Update the configuration files in `config/` directory with your settings

## Configuration

The application uses several configuration files:

- `rules.json`: BOM generation rules for different building types
- `labor-rates.json`: Labor rates by ZIP code and item type
- `permit-fees.json`: Permit fees by state and special features
- `tax-rates.json`: Tax rates by state
- `markup-rates.json`: Markup rates for different cost components
- `sql-connector.json`: SQL database connection settings
- `rest-connector.json`: REST API connection settings

## Development

Start the development server:

```bash
npm run dev
```

## Building

Build the application:

```bash
npm run build
```

## Running

Start the production server:

```bash
npm start
```

## API Endpoints

### Estimates

- `POST /api/estimate`: Generate a new estimate
- `GET /api/estimate/:id`: Get an estimate by ID
- `GET /api/estimate`: List estimates
- `GET /api/estimate/:id/export`: Export an estimate

## Testing

Run tests:

```bash
npm test
```

## Linting

Run linter:

```bash
npm run lint
```

## Formatting

Format code:

```bash
npm run format
```

## Architecture

The backend is built with a modular architecture:

- `connectors/`: Data source adapters (SQL, REST)
- `bom/`: BOM generation rules engine
- `cost/`: Cost estimation module
- `services/`: Business logic services
- `routes/`: API route handlers
- `middleware/`: Express middleware
- `config/`: Configuration files

## License

MIT 