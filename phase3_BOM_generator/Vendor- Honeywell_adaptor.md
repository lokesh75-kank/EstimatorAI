implified “AI-Driven Vendor Discovery” Backend: Honeywell-Only

Below is a lean implementation plan to connect exclusively to Honeywell’s catalog for your initial MVP. We’ll focus on one “connector” so you can validate end-to-end sourcing before adding more vendors.

1. Connector Registry (Honeywell Entry)
Data Record:

yaml
Copy
Edit
connector:
  id: honeywell
  type: punchout
  endpoint: https://partners.honeywell.com/oci
  auth:
    clientId: <YOUR_CLIENT_ID>
    clientSecret: <YOUR_SECRET>
  fieldMapping:
    item_code: partNumber
    description: productDescription
    unit_price: listPrice
    lead_time: leadTimeDays
    available_qty: stockQuantity
  ttl_hours: 12
Storage:

Store this in your registry table or JSON config file.

Provides credentials, endpoint URL, and mapping rules.

2. Honeywell Adapter
Purpose:

Handle the OCI punch-out or API call to Honeywell’s catalog.

Authenticate via OAuth2 or API‐key as required by Honeywell’s partner portal.

Responsibilities:

Build Request:

Include authentication headers (clientId/secret).

Specify the project region or ZIP code in query parameters if supported.

Fetch Full Catalog:

Pull all relevant product lines (smoke detectors, horns, strobes, pull stations).

Parse Response:

For each record, translate partNumber, productDescription, etc.

Produce a canonical object:

json
Copy
Edit
{
  "item_code": "...",
  "description": "...",
  "unit_price": ...,
  "lead_time": ...,
  "available_qty": ...
}
Error Handling & Retry:

Wrap calls in a retry policy (e.g., 3 attempts with backoff).

On persistent failure, log the error and notify the orchestrator.

3. Discovery Orchestrator (Honeywell-Only)
Trigger:

When project details (ZIP, building type) are set or updated.

Process Flow:

Enqueue a “Honeywell Fetch” Task in your job queue.

Worker Invokes the Honeywell Adapter to pull & normalize data.

Store Results in your cache layer (e.g., Redis) under key /vendor/honeywell/{zip} with a 12-hour TTL.

Publish Status: update job state to complete (or error) for front-end to poll.

4. Sample Selector
Selection Logic:

Once Honeywell’s full catalog is cached, select 3–5 representative SKUs:

Prioritize core devices: e.g., first 5 smoke detectors, horns, strobes based on alphabetical or category filter.

Store these in Redis under samples:{projectId} for fast retrieval.

5. API Endpoints
GET /api/vendor-discovery/status?projectId=XYZ

Returns { state: "in_progress"|"complete"|"error", message? } based solely on the Honeywell task.

GET /api/vendor-discovery/samples?projectId=XYZ

If status is complete, returns the 3–5 Honeywell SKUs from your sample store.

POST /api/vendor-discovery/retry?projectId=XYZ

Allows manual retry of the Honeywell fetch task if needed.

6. Caching & TTL
Cache Key: honeywell:catalog:ZIPCODE

Expiration: 12 hours (as per connector registry).

Fallback on Cache Hit: if within TTL, return cached data immediately—no new API call.

7. Monitoring & Alerts
Success Metric:

Honeywell fetch latency and success rate.

Alerting:

Notify if fetch fails >2 consecutive times, so you can rotate credentials or investigate portal issues.

Next Steps
Validate End-to-End: Spin up the Honeywell adapter, run a project trigger, and ensure the front-end receives and displays the 3–5 sample SKUs.

Iterate UI States: Test loading, success, and error banners on the project page.

Expand Later: Once stable, replicate the same pattern for additional vendors (Graybar, Grainger) using the same registry-adapter-orchestrator architecture.

This targeted approach lets you get “AI-Driven Vendor Discovery” live quickly—powered solely by Honeywell—for your first MVP rollout.

