# Data Isolation

## Feature Description

Data isolation prevents one account from seeing another account's data. The app enforces this in frontend cache keys, local storage keys, auth-protected API routes, and MongoDB ownership filters.

## Flowchart

```mermaid
flowchart TD
  A["User signs in"] --> B["Auth store receives user ID"]
  B --> C["React Query keys include user scope"]
  B --> D["Local storage keys include user scope"]
  C --> E["Private cache belongs to this user"]
  D --> F["Browser stash belongs to this user"]
  E --> G["API request with auth cookie"]
  F --> G
  G --> H["requireAuth loads req.user"]
  H --> I["Controller adds user-owned filter"]
  I --> J["MongoDB query includes user ID"]
  J --> K["Only current user's documents return"]
```

## Main Files

| Area | Files |
|---|---|
| Query scope | `client/src/lib/query-scope.ts` |
| Scoped local storage | `client/src/lib/user-storage.ts` |
| Auth store | `client/src/stores/auth.store.ts` |
| App auth/cache clearing | `client/src/App.tsx` |
| Backend auth | `backend/src/middleware/auth.middleware.ts` |
| User-owned controllers | `backend/src/controllers/business.controller.ts`, `resume.controller.ts`, `report.controller.ts`, `user.controller.ts` |

## Data Rules

- Private query roots are cleared on login, logout, auth failure, and user switch.
- Local stashes use `multitool.user.<userId>...`.
- Backend owner checks use `user: req.user._id`.
