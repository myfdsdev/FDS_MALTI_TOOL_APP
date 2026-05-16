# Admin

## Feature Description

Admin lets admin users view stats, list users, update user roles/plans, delete users, and configure global AI settings. Only users with `role: "admin"` can open the page or use the admin API.

## Flowchart

```mermaid
flowchart TD
  A["Admin opens /admin"] --> B["RequireAdmin checks user role"]
  B -->|not admin| C["Redirect to /dashboard"]
  B -->|admin| D["GET /api/admin/stats"]
  B --> E["GET /api/admin/users"]
  B --> F["GET /api/admin/settings"]
  D --> G["Render platform stats"]
  E --> H["Render user management"]
  F --> I["Render AI settings"]
  H --> J{"Admin action"}
  J -->|update role/plan| K["PATCH /api/admin/users/:id"]
  J -->|delete user| L["DELETE /api/admin/users/:id"]
  L --> M["Delete user's generations, reports, notes, projects, resumes, short links, tasks"]
```

## Main Files

| Area | Files |
|---|---|
| Page | `client/src/pages/Admin.tsx` |
| Client hooks | `client/src/lib/queries.ts` |
| Backend routes | `backend/src/routes/admin.routes.ts` |
| Backend controller | `backend/src/controllers/admin.controller.ts` |
| Settings model | `backend/src/models/Settings.model.ts` |

## Data Rules

- Admin page is blocked in the frontend by `RequireAdmin`.
- Admin API is protected by auth and admin middleware.
- Admin cannot delete their own account.
- User deletion cleans related user-owned data.
