# Dashboard

## Feature Description

The Dashboard is the first authenticated screen. It shows popular tools, today's due tasks, recent generations, category shortcuts, and usage count for the current user.

## Flowchart

```mermaid
flowchart TD
  A["Authenticated user opens /dashboard"] --> B["Load user from auth store"]
  B --> C["Fetch tools catalog"]
  B --> D["Fetch usage status"]
  B --> E["Fetch recent history"]
  B --> F["Fetch today's tasks"]
  C --> G["Render popular tools"]
  D --> H["Render daily usage pill"]
  E --> I["Render recent generations"]
  F --> J["Render Today widget"]
  G --> K["User opens tool or category"]
  I --> L["User opens history"]
  J --> M["User opens project task"]
```

## Main Files

| Area | Files |
|---|---|
| Page | `client/src/pages/Dashboard.tsx` |
| Data hooks | `client/src/lib/queries.ts`, `client/src/lib/business.queries.ts` |
| Tool cards/icons | `client/src/components/tools/ToolCard.tsx`, `client/src/lib/tool-icons.ts` |
| Today widget | `client/src/components/business/TodayWidget.tsx` |

## Data Rules

- History query keys include the active user scope.
- Today tasks come from the backend with `user: req.user._id`.
- Dashboard never shows another user's projects, tasks, or generation history.
