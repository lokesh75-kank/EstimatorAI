import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { createEstimateRouter } from './routes/estimate';
import { RulesEngine } from './bom/RulesEngine';
import { CostEstimator } from './cost/CostEstimator';
import { EstimationService } from './services/EstimationService';
import { SQLAdapter } from './connectors/adapters/SQLAdapter';
import { RESTAdapter } from './connectors/adapters/RESTAdapter';

// Load environment variables
config();

// Initialize components
const rulesEngine = new RulesEngine(
  require('../config/rules.json'),
  process.env.OPENAI_API_KEY || ''
);

const costEstimator = new CostEstimator(
  require('../config/labor-rates.json'),
  require('../config/permit-fees.json'),
  require('../config/tax-rates.json'),
  require('../config/markup-rates.json'),
  parseFloat(process.env.CONTINGENCY_RATE || '0.1')
);

// Initialize connectors
const connectors = new Map();
const sqlConfig = require('../config/sql-connector.json');
const restConfig = require('../config/rest-connector.json');

if (sqlConfig.enabled) {
  connectors.set('sql', new SQLAdapter(sqlConfig));
}

if (restConfig.enabled) {
  connectors.set('rest', new RESTAdapter(restConfig));
}

// Initialize estimation service
const estimationService = new EstimationService(
  rulesEngine,
  costEstimator,
  connectors,
  process.env.APP_VERSION || '1.0.0'
);

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/estimate', createEstimateRouter(estimationService));

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 