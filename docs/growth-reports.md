# Growth Reports Architecture

Growth Reports lives inside Business Management. A logged-in user enters a public website URL, the backend creates a user-owned report job, scrapes the page, calls the configured AI provider, validates the AI JSON, and stores the completed report. If AI is not configured, fails, or returns incomplete data, the user gets an error. The system does not create fake fallback reports.

For the short per-feature doc, see [features/12-growth-reports.md](./features/12-growth-reports.md).

## End-To-End Flow

```mermaid
flowchart TD
  A["User opens /business/reports/new"] --> B["Submit website URL"]
  B --> C["POST /api/business/reports"]
  C --> D["requireAuth loads req.user"]
  D --> E{"AI config available?"}
  E -->|no| F["400 AI is not configured"]
  E -->|yes| G["checkAndConsume quota"]
  G --> H["Create GrowthReport status=queued"]
  H --> I["Return reportId to client"]
  I --> J["Client navigates to /business/reports/:id"]
  H --> K["runReportGeneration starts"]
  K --> L["Scrape public website snapshot"]
  L --> M["Call AI provider"]
  M --> N{"AI output valid and complete?"}
  N -->|no| O["Save status=failed with error"]
  N -->|yes| P["Save status=completed with report content"]
  J --> Q["Poll report every 2 seconds"]
  Q --> R{"Status"}
  R -->|queued/processing| Q
  R -->|failed| S["Show error and retry option"]
  R -->|completed| T["Render report viewer"]
  T --> U["Export or share"]
```

## Status Flow

```mermaid
stateDiagram-v2
  [*] --> queued: create report
  queued --> scraping: generation starts
  scraping --> analyzing: snapshot saved
  analyzing --> generating: AI call starts
  generating --> completed: valid AI report saved
  queued --> failed: error
  scraping --> failed: error
  analyzing --> failed: error
  generating --> failed: AI failed or invalid
  failed --> queued: retry
  completed --> queued: retry
```

## Main Files

| Area | Files |
|---|---|
| Frontend pages | `client/src/pages/business/ReportsListPage.tsx`, `NewReportPage.tsx`, `ReportViewerPage.tsx`, `client/src/pages/PublicReport.tsx` |
| Frontend components | `client/src/components/business/reports/*` |
| Client data/export | `client/src/lib/reports.api.ts`, `client/src/lib/reports.queries.ts`, `client/src/lib/reports.exporters.ts` |
| Backend routes | `backend/src/routes/report.routes.ts`, `backend/src/routes/publicReport.routes.ts` |
| Backend controller | `backend/src/controllers/report.controller.ts` |
| Backend services | `backend/src/services/report/index.ts`, `scraper.ts`, `generator.ts`, `prompts.ts` |
| Model/validator | `backend/src/models/GrowthReport.model.ts`, `backend/src/validators/report.validator.ts` |

## AI Requirement

```mermaid
flowchart TD
  A["Create or retry report"] --> B["resolveAIConfigForUser"]
  B --> C{"Config found?"}
  C -->|no| D["Stop before quota/report generation"]
  C -->|yes| E["Consume quota"]
  E --> F["Scrape and call AI"]
  F --> G{"AI JSON passes validation?"}
  G -->|no| H["Report fails with clear error"]
  G -->|yes| I["Report completes"]
```

The report generator validates that AI output includes:

- Valid report sections.
- Valid score values.
- At least five monetization streams.
- Valid setup effort values.
- Required summary and recommendation content.

## Public Sharing

```mermaid
flowchart TD
  A["Owner opens completed report"] --> B["Toggle share enabled"]
  B --> C["POST /api/business/reports/:id/share"]
  C --> D["Verify report belongs to current user"]
  D --> E["Create public slug"]
  E --> F["Return /reports/r/:slug"]
  F --> G["Public visitor opens page"]
  G --> H["GET /api/public/reports/:slug"]
  H --> I["Find enabled shared report"]
  I --> J["Render read-only public report"]
```

## Export Flow

```mermaid
flowchart LR
  A["Completed report"] --> B["Export menu"]
  B --> C["PDF"]
  B --> D["DOCX"]
  B --> E["PPTX"]
  B --> F["XLSX"]
  B --> G["HTML"]
  B --> H["CSV"]
  B --> I["TXT"]
  C --> J["Browser download"]
  D --> J
  E --> J
  F --> J
  G --> J
  H --> J
  I --> J
```

## Data Rules

- Every report stores `user: req.user._id`.
- Private report reads, updates, retries, deletes, and share actions always check owner.
- Public reports only load through an enabled share slug.
- Disabling share clears the slug, so old public links stop working.
- Admin user deletion removes that user's Growth Reports.
