# Link Saver

## Feature Description

Link Saver previews any public URL and lets the user save the preview as a note. Recent previews and saved URL markers are kept in scoped local browser storage, so one account's browser stashes do not leak into another account.

## Flowchart

```mermaid
flowchart TD
  A["User opens /business/link-saver"] --> B["Scoped local storage loads for user ID"]
  B --> C["User enters URL"]
  C --> D["POST /api/tools/link-saver/generate"]
  D --> E["Backend URL scraper fetches metadata"]
  E --> F["Return title, description, image, favicon"]
  F --> G["Render preview card"]
  G --> H["Save preview in scoped history"]
  G --> I{"Save as note?"}
  I -->|yes| J["POST /api/business/notes"]
  J --> K["Create owned markdown note"]
  I -->|no| L["Preview only"]
```

## Main Files

| Area | Files |
|---|---|
| Page | `client/src/pages/BusinessLinkSaver.tsx` |
| Preview UI | `client/src/components/tools/LinkPreviewCard.tsx` |
| User storage | `client/src/lib/user-storage.ts` |
| Tool bridge | `backend/src/services/ai.service.ts`, `backend/src/services/linkPreview.service.ts` |
| Notes API | `backend/src/controllers/business.controller.ts` |

## Data Rules

- Link Saver browser history uses `multitool.user.<userId>...` storage keys.
- Legacy global Link Saver keys are removed when the page opens.
- Saving as note creates a note owned by the current user.
