# DMCC

Digital Media Control Center is an AI-assisted media protection platform for teams that need to monitor how their owned visual content is being reused online.

The product is designed for organizations such as sports clubs, leagues, agencies, media teams, and rights-holders who want to:

- upload and register protected media assets
- detect likely unauthorized reuse
- understand why a match was flagged
- assess business and platform risk
- track how content spreads
- create enforcement cases
- generate takedown-ready legal drafts

This repository contains the full web application, including the frontend, API routes, monitoring engine, detection logic, AI assistance layer, and persistence layer.

## What The Product Does

DMCC helps a rights team move from raw content uploads to actionable enforcement workflows.

Core product capabilities:

- Asset registration: upload protected images and generate fingerprints
- Detection intelligence: explainable matching instead of only a similarity number
- Threat scoring: combines confidence, virality, and platform risk
- Spread tracking: shows how detected content appears over time
- Reverse search: upload any image and find similar protected assets in the system
- AI assistant: answer operational questions from system data
- Legal assistant: generate takedown and enforcement draft language
- Case management: create and track investigation workflows
- Connector monitoring: ingest external content from monitored sources

## Current Scope

This version is a strong MVP with real application structure and real backend flows.

What is real in the current build:

- a production-style Next.js application shell and dashboard
- database-backed persistence using SQLite
- case workflow storage and status history
- live Reddit-based discovery connector
- Gemini integration for explanations, assistant replies, and legal drafts
- optional Google Vision label extraction for uploaded media

What is still MVP-grade:

- external coverage is limited to the configured connector set
- no multi-user authentication or role system yet
- no queue workers, background schedulers, or distributed crawl infrastructure
- no enterprise database deployment configuration yet
- no full legal audit trail, approval chain, or outbound notification system

## Who This Is For

DMCC is useful for teams that manage owned content at scale and need faster visibility into potential misuse:

- sports clubs and leagues
- brand protection teams
- digital rights operations teams
- agencies managing athlete or creator content
- media companies protecting licensed visual assets

## Product Flow

1. A user uploads a protected image.
2. The system fingerprints the asset using hash and label data.
3. Connectors ingest monitored external content.
4. The matching engine compares discovered content against protected assets.
5. Detections are enriched with explainable intelligence and threat scoring.
6. The team reviews detections, creates cases, and tracks status.
7. The AI and legal tools help summarize risk and prepare response actions.

## Main Features

### 1. Protected Asset Registry

Users can upload protected images through the application. Each upload is stored, fingerprinted, and added to the protected asset inventory.

### 2. Explainable Detection Intelligence

Detections do not stop at a raw similarity score. The system adds reasoning such as:

- matching labels
- likely shared scene context
- branding or logo overlap
- semantic match summary

When Gemini is configured, the explanation layer becomes richer and more natural.

### 3. Threat Score

Each detection includes a combined threat score built from:

- confidence score
- virality estimate
- platform risk

This helps teams prioritize which detections deserve immediate attention.

### 4. Spread Tracking

Each detection stores appearance and engagement data so the UI can show:

- timeline progression
- platform distribution
- views and shares over time

### 5. Reverse Search

Users can upload any image and search for the most similar protected assets already stored in the system.

### 6. AI Assistant

The operations panel includes a data-aware assistant for questions such as:

- Which assets are most at risk?
- What were the top violations this week?
- Why was this detection flagged?

If Gemini is configured, responses are generated with model support using current application data. Otherwise, the assistant falls back to deterministic backend logic.

### 7. Legal Draft Generation

For a selected detection, the system can produce takedown-ready draft language. With Gemini enabled, this becomes more polished and context-aware. Without Gemini, the backend still generates a structured fallback draft.

### 8. Case Management

Detections can be turned into cases with workflow state:

- open
- investigating
- resolved

Case records also store status history for auditability inside the app.

### 9. Connector Monitoring

The system includes monitored connectors and crawl jobs. The current live connector is Reddit-based discovery using subreddit feeds. Additional connectors can be added through the same monitoring pipeline.

## Architecture

### Frontend

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion

### Backend

- Next.js route handlers in `src/app/api`
- service layer in `src/lib`
- SQLite persistence using Node's built-in SQLite module
- AI integrations for Gemini and Google Vision

### Storage

Application data is stored in:

- `data/dmcc.sqlite` for active persistence
- `public/uploads` for uploaded files

If `data/mvp-db.json` already exists from an older version, the app migrates that data into SQLite on first read.

## Key Application Areas

- `src/app/dashboard/page.tsx` - executive monitoring dashboard
- `src/app/detections/page.tsx` - detailed detection review
- `src/app/assets/page.tsx` - protected asset library
- `src/app/assets/[id]/page.tsx` - single asset intelligence view
- `src/app/upload/page.tsx` - asset upload flow
- `src/app/operations/page.tsx` - connector, AI, legal, reverse search, and case operations

Important backend modules:

- `src/lib/mvp-db.ts` - SQLite persistence and migration
- `src/lib/mvp-service.ts` - core asset, detection, and case workflows
- `src/lib/mvp-monitoring-engine.ts` - connector execution and detection ingestion
- `src/lib/reddit-connector.ts` - live Reddit discovery fetcher
- `src/lib/mvp-ai.ts` - Gemini-backed enrichment and assistant/legal flows
- `src/lib/mvp-intelligence.ts` - matching logic, reasoning, spread, and scoring

## API Overview

Representative API routes:

- `POST /api/assets/upload` - upload and fingerprint a protected asset
- `GET /api/assets` - list stored assets
- `GET /api/detections` - list current detections
- `GET /api/analytics` - return analytics and trends
- `POST /api/reverse-search` - reverse search against protected assets
- `POST /api/assistant` - ask the AI assistant
- `POST /api/legal/takedown` - generate a legal draft
- `GET /api/cases` - list cases
- `POST /api/cases` - create a case from a detection
- `POST /api/monitoring/jobs` - run monitoring jobs

## Getting Started

### Prerequisites

- Node.js 22 or newer
- npm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create local environment configuration:

```bash
copy .env.example .env.local
```

3. Start the development server:

```bash
npm run dev
```

4. Open the app:

```text
http://localhost:3000
```

## Environment Variables

Use `.env.example` as the starting point.

### Required for AI Features

- `GEMINI_API_KEY`
  Enables Gemini-backed detection explanations, assistant answers, and legal drafting.

### Optional

- `GEMINI_MODEL`
  Overrides the Gemini model. Default: `gemini-2.5-flash`

- `REDDIT_SUBREDDITS`
  Comma-separated subreddits to monitor. Example: `soccer,football,sports`

- `REDDIT_FETCH_LIMIT`
  Maximum number of Reddit posts fetched per monitoring cycle

- `GOOGLE_APPLICATION_CREDENTIALS`
  Path to a Google service account file for Vision label extraction

- `GOOGLE_CLOUD_PROJECT`
  Google Cloud project id for Vision usage

## Recommended Demo Flow

To understand the product quickly:

1. Start the app and open `/upload`
2. Upload one or more sports-related images
3. Open `/dashboard` to see overview metrics
4. Open `/detections` to inspect match explanations and threat scores
5. Open `/operations` and run a monitoring cycle
6. Ask the assistant a question
7. Generate a takedown draft for a detection
8. Create a case and update its status

## Detection Logic Summary

The system compares protected and discovered content using:

- fingerprint similarity
- label overlap
- platform inference
- virality estimation
- ownership signals

This produces:

- match explanations
- semantic summaries
- risk levels
- threat scores
- spread snapshots

## Production Readiness Notes

This repository is closer to a product-grade MVP than a fully production-hardened platform.

Before calling it production-ready, the next major areas would be:

- authentication and authorization
- managed database deployment
- background jobs and retry queues
- connector scaling and rate-limit orchestration
- observability and alerting
- audit trails and legal review workflow
- secure secret management and deployment hardening

## Verification

The codebase has been validated with:

```bash
npm run lint
node node_modules/typescript/bin/tsc --noEmit
```

In this coding environment, `next build` compiles the project but fails at a later framework spawn step with `spawn EPERM`, which is an environment restriction rather than an application compile failure.

## Project Positioning

In simple terms:

DMCC is an AI-assisted rights protection and media misuse detection platform that helps organizations register owned media, discover suspicious reuse, explain why it was flagged, prioritize risk, and manage enforcement actions from one interface.
