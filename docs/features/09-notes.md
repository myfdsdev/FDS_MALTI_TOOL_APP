# Notes

## Feature Description

Notes let a user save project notes, task notes, pinned notes, and global notes. Link Saver can create notes from link previews. All notes are private to the user.

## Flowchart

```mermaid
flowchart TD
  A["User opens /business/notes"] --> B["GET /api/business/notes"]
  B --> C["Find notes where user=current user"]
  C --> D["Render notes"]
  D --> E{"User action"}
  E -->|create| F["POST /api/business/notes"]
  E -->|update| G["PATCH /api/business/notes/:id"]
  E -->|delete| H["DELETE /api/business/notes/:id"]
  F --> I{"Project or task attached?"}
  I -->|yes| J["Verify project/task belongs to user"]
  I -->|no| K["Create global note"]
  J --> L["Save note with user ID"]
  K --> L
  G --> M["Find owned note, then update"]
  H --> N["Find owned note, then delete"]
```

## Main Files

| Area | Files |
|---|---|
| Page | `client/src/pages/BusinessNotes.tsx` |
| Notes UI | `client/src/components/business/NoteDialog.tsx`, `client/src/components/business/views/NotesView.tsx` |
| Client data | `client/src/lib/business.queries.ts`, `client/src/lib/business.api.ts` |
| Backend | `backend/src/controllers/business.controller.ts`, `backend/src/routes/business.routes.ts` |
| Model | `backend/src/models/Note.model.ts` |

## Data Rules

- Every note stores `user`.
- Optional `project` and `task` references are checked before save.
- A user cannot read, update, or delete another user's note.
