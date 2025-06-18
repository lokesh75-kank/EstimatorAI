# Phase 3: Estimation Engine

## Step 1: Data-Connector Layer

### Define a connector interface

```typescript
interface IDataConnector {
  connect(): Promise<void>;
  fetchInventory(params: FetchParams): Promise<ItemRecord[]>;
  heartbeat(): Promise<boolean>;
}
```

### Implement adapters for each source:
- SQLAdapter (MySQL/Postgres via knex or Sequelize)
- NoSQLAdapter (MongoDB via mongoose or DynamoDB via AWS SDK)
- RestAdapter (generic HTTP client with OAuth/API-key support)
- FileAdapter (CSV/Excel via papaparse/xlsx)

### Mapping/configuration

Create a JSON or DB table storing field-mapping rules:

```json
{
  "vendorA": { 
    "codeField": "item_sku", 
    "priceField": "unit_cost"
  }
}
```

On adapter init, load mapping and normalize records to `{ item_code, description, unit_price, lead_time, available_qty }`.

## Step 2: Inventory Ingestion & Caching

### Batch sync
- Schedule nightly jobs (e.g. cron or AWS EventBridge → Lambda) to pull full catalog.

### Real-time lookups
- On-demand fetch for volatile SKUs, with `adapter.fetchInventory`.

### Cache layer
- Use Redis with TTL per-vendor (configured in a "vendor_settings" table).
- Wrap adapter calls:

```typescript
if (cache.has(key)) return cache.get(key);
const data = await adapter.fetchInventory(...);
cache.set(key, data, ttl);
return data;
```

### Validation
- After fetch, run schema checks (non-negative prices, required fields) and log or reject invalid entries.

## Step 3: BOM Generation Rules Engine

### Rule definitions
Store rules as JSON or in a rules DB table:

```json
{
  "office_building": {
    "per_sqft": { "smoke_detector": 0.00075 },
    "per_floor": { "horn_strobe": 2 },
    "min_qty": { "fire_extinguisher": 4 }
  }
}
```

### Rule-evaluator service
Load the rule set for given occupancy type.

Compute base quantities:

```typescript
qty = floorArea * rule.per_sqft.smoke_detector;
qty = Math.max(qty, rule.min_qty.fire_extinguisher);
```

### Override layer
- Accept user overrides in request payload
- Merge them into computed BOM before finalizing.

### Edge-case fallback
If a scenario isn't covered, dispatch an OpenAI function call:

```python
functions = [ … define suggest_equipment() … ]
response = openai.chat.completions.create({ prompt, functions });
bomOverrides = response.data.arguments;
```

## Step 4: Cost Estimation Module

### Equipment cost
```typescript
equipmentCost = bomItems.reduce((s, i) => s + i.qty * i.unit_price, 0);
```

### Labor estimation
- Define labor-hours per device type in labor_rates table
- Geo-detect ZIP → lookup regional hourly rate
- Compute `laborCost = Σ(deviceHours × regionalRate)`

### Permit & fees lookup
- Maintain permit_fees table keyed by jurisdiction
- Query by project ZIP/state; add fee entries

### Margins & contingencies
- Store markup percentages in pricing_policies
- Apply: equipmentCost × equipmentMarkup, laborCost × laborMarkup, plus contingency buffer

### Taxes
- Integrate with tax-rate API or local rates table
- Compute taxAmount

## Step 5: Structured Output & Persistence

### Define JSON schema
- Define JSON schema for API response
- Generate via code (e.g. using TypeScript interfaces or JSON Schema)

### Persist estimates
- Save input params, computed BOM, cost breakdown, and metadata (connector version, rule version) into an estimates table

### Export formats
Implement exporters:
- CSV/Excel (e.g. via json2csv or xlsx)
- PDF (e.g. via pdfkit or headless Chrome + HTML template)

## Step 6: API & UI Implementation

### Backend API routes (Next.js / Express)
- POST /api/estimate → run engine, return JSON
- GET /api/estimate/:id → fetch stored record
- GET /api/inventory → list available items

### Frontend components (+TypeScript + React)
- ProjectForm: inputs (area, floors, occupancy, overrides)
- BomTable: editable grid of { code, description, qty, unit_price, subtotal }
- CostSummary: breakdown panels for equipment, labor, fees, margins, taxes
- ExportButtons: download CSV/PDF

### State management
- Use React Context or Zustand to hold current estimate state and overrides

### Authentication & role checks
- Protect API with JWT
- Disable editing for "viewer" role

## Step 7: Monitoring & CI/CD

### Automated tests
- Unit tests for each adapter, rule-evaluator, cost formulas (Jest/Mocha)
- Integration tests: mock inventories → full-stack estimate → verify output

### Metrics & alerts
- Emit connector latencies, cache hit-rates, error counts to Prometheus
- Configure Grafana alerts on error spikes or price anomalies

### Deployment pipeline
- GitHub Actions or CircleCI: on push to main, run tests, lint, then deploy to staging/production
- Version your rules and connector code so each release is traceable

This detailed roadmap omits value explanations and instead provides concrete implementation tasks, configurations, and code-level outlines for Phase 3.


