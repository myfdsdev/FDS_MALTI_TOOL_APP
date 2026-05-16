# Calendar

## Feature Description

Calendar shows tasks by due date. It reads the current user's dated tasks and groups them by day for planning.

## Flowchart

```mermaid
flowchart TD
  A["User opens /business/calendar"] --> B["Client chooses from/to date range"]
  B --> C["GET /api/business/calendar"]
  C --> D["Validate date query"]
  D --> E["Find tasks for current user within range"]
  E --> F["Group tasks by YYYY-MM-DD"]
  F --> G["Render calendar task list"]
  G --> H["User opens or edits task"]
```

## Main Files

| Area | Files |
|---|---|
| Page | `client/src/pages/business/BusinessCalendarPage.tsx` |
| Business hooks | `client/src/lib/business.queries.ts` |
| Date controls | `client/src/components/business/DateTimePicker.tsx` |
| Backend | `backend/src/controllers/business.controller.ts`, `backend/src/routes/business.routes.ts` |
| Model | `backend/src/models/Task.model.ts` |

## Data Rules

- Calendar query filters tasks by `user: req.user._id`.
- Tasks without a due date do not appear in the calendar response.
- Invalid date ranges return a validation error.
