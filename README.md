# Scan to Print

A mobile-first Scan-to-Print web application foundation implementing the requested 1–76 feature scope.

## Run
```bash
npm install
npm run dev
```

For production:
```bash
npm run build
npm run preview
```

## Current working foundation
- PDF/JPG/PNG/Word upload UI
- Drag/drop
- Mobile camera capture
- Multi-page document workspace
- Page rotate/delete
- Print settings
- Live pricing
- B/W vs colour rates
- A4/A3
- Single/double side
- N-up and margin controls
- Guest flow
- Hindi/English UI
- Delete Now
- Order status flow
- Owner dashboard UI
- Phase 2–5 feature registry

## Production integrations required
Payment gateways (UPI/card/wallet), real printer release, WhatsApp/SMS, OCR, cloud import, delivery, and shop hardware need server-side credentials/services and/or a local print agent. The frontend is structured so those integrations can be attached without changing the customer workflow.

## Important
The privacy statement should only be advertised as "documents are not saved" after the backend actually enforces short-lived storage and automatic deletion.
