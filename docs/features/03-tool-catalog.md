# Tool Catalog

## Feature Description

The Tool Catalog powers Business Ideas, category pages, sidebar tool groups, and `/tools/:toolId`. Most tools are AI prompt tools. Utility tools like Link Saver and URL Shortener run deterministic backend services instead of fake AI output.

## Flowchart

```mermaid
flowchart TD
  A["User opens Business Ideas or a category"] --> B["GET /api/tools"]
  B --> C["Backend returns categories and tools"]
  C --> D["Client groups tools by category"]
  D --> E["User opens /tools/:toolId"]
  E --> F["ToolPage renders dynamic form"]
  F --> G["POST /api/tools/:toolId/generate"]
  G --> H{"Tool type"}
  H -->|AI prompt tool| I["AI provider or mock fallback"]
  H -->|Link Saver| J["URL scraper"]
  H -->|URL Shortener| K["Short-link service"]
  I --> L["Save generation history"]
  J --> L
  K --> L
  L --> M["Render output"]
```

## Main Files

| Area | Files |
|---|---|
| Catalog config | `backend/src/config/tools.config.ts`, `backend/src/config/tools/*` |
| Tool routes/controllers | `backend/src/routes/tools.routes.ts`, `backend/src/controllers/tools.controller.ts` |
| Tool generation | `backend/src/services/ai.service.ts`, `backend/src/services/ai/*` |
| Frontend pages | `client/src/pages/BusinessIdeas.tsx`, `client/src/pages/CategoryPage.tsx`, `client/src/pages/Tool.tsx` |
| Tool UI | `client/src/components/tools/ToolPage.tsx`, `client/src/components/tools/ToolForm.tsx`, `client/src/components/tools/ToolOutput.tsx` |

## Data Rules

- Tool definitions are public.
- Generation is private and requires login.
- Saved generation history is stored with the current user's ID.
