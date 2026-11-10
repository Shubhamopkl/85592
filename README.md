# Scan to Print

A deployable Flask starter for a Scan-to-Print workflow.

## Deploy on Render
1. Upload this project to a GitHub repository.
2. In Render, create a new **Web Service** from the repository.
3. Render will use `render.yaml`, or set:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
4. Open the generated Render URL.

## Included
- Customer upload page
- PDF page count
- Copy/mode/duplex price calculation
- Order token
- Live order status lookup
- Admin order queue
- SQLite database
- File upload validation
- Health endpoint
- Responsive UI

## Important production note
The payment endpoint in this starter is intentionally a demo endpoint. Before accepting real money, integrate Razorpay/another gateway with server-side signature verification and webhooks. For multi-instance production deployments, use managed PostgreSQL and object storage instead of local SQLite/uploads.
