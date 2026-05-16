# Growth Reports

## Feature Description

Growth Reports creates AI-generated business growth reports from a public website URL. The backend validates the URL, creates a queued report owned by the user, scrapes the site, requires a configured AI provider, and saves completed report content. If AI is not configured or fails, the report returns an error instead of fake data.

## Flowchart

```mermaid
flowchart TD
  A["User opens /business/reports/new"] --> B["Enter public website URL"]
  B --> C["POST /api/business/reports"]
  C --> D["requireAuth loads user"]
  D --> E{"AI config available?"}
  E -->|no| F["400 error: AI is not configured"]
  E -->|yes| G["checkAndConsume quota"]
  G --> H["Create queued GrowthReport with user ID"]
  H --> I["runReportGeneration"]
  I --> J["Scrape website snapshot"]
  J --> K["Call AI provider"]
  K --> L{"Valid complete report JSON?"}
  L -->|no| M["Mark report failed with error"]
  L -->|yes| N["Save completed report"]
  N --> O["Viewer polls and renders report"]
  O --> P["Export or share public link"]
```

## Main Files

| Area | Files |
|---|---|
| Pages | `client/src/pages/business/ReportsListPage.tsx`, `NewReportPage.tsx`, `ReportViewerPage.tsx`, `client/src/pages/PublicReport.tsx` |
| Components | `client/src/components/business/reports/*` |
| Client API | `client/src/lib/reports.api.ts`, `client/src/lib/reports.queries.ts`, `client/src/lib/reports.exporters.ts` |
| Backend | `backend/src/routes/report.routes.ts`, `backend/src/routes/publicReport.routes.ts`, `backend/src/controllers/report.controller.ts` |
| Report services | `backend/src/services/report/*` |
| Model | `backend/src/models/GrowthReport.model.ts` |

## Data Rules

- Reports are owned by `user: req.user._id`.
- Private report reads, retries, deletes, and share toggles check owner.
- Public report links work only when sharing is enabled.
- Reports do not fall back to fake content.
