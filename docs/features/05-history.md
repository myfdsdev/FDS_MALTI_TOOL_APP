# History

## Feature Description

History shows the logged-in user's tool generations. Users can filter by tool, delete one item, or clear history. Deleted items are soft-deleted with `status: "deleted"`.

## Flowchart

```mermaid
flowchart TD
  A["User runs a tool"] --> B["Backend creates Generation document"]
  B --> C["Generation stores user ID, tool ID, inputs, output"]
  D["User opens /history"] --> E["GET /api/user/history"]
  E --> F["requireAuth loads current user"]
  F --> G["Find active generations for this user"]
  G --> H["Render history list"]
  H --> I{"User action"}
  I -->|delete item| J["DELETE /api/user/history/:id"]
  I -->|clear all| K["DELETE /api/user/history"]
  J --> L["Set status=deleted"]
  K --> L
```

## Main Files

| Area | Files |
|---|---|
| Frontend page | `client/src/pages/History.tsx` |
| Frontend queries | `client/src/lib/queries.ts` |
| Backend controller | `backend/src/controllers/user.controller.ts` |
| Backend routes | `backend/src/routes/user.routes.ts` |
| Model | `backend/src/models/Generation.model.ts` |

## Data Rules

- History reads always filter by `user: req.user._id`.
- Delete and clear operations only affect the current user's records.
- Query cache keys are scoped by active user ID.
