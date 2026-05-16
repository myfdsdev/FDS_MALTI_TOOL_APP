# Projects And Tasks

## Feature Description

Projects and Tasks let each user manage project boards, lists, priorities, due dates, checklists, notes, progress, and project completion counts. All reads and writes are owner-checked.

## Flowchart

```mermaid
flowchart TD
  A["User opens /business/projects"] --> B["GET /api/business/projects"]
  B --> C["Find projects where user=current user"]
  C --> D["Render projects and selected project"]
  D --> E{"User action"}
  E -->|create project| F["POST /api/business/projects"]
  E -->|open project| G["GET /api/business/projects/:id"]
  E -->|create task| H["POST /api/business/projects/:projectId/tasks"]
  E -->|update task| I["PATCH /api/business/tasks/:id"]
  E -->|reorder task| J["POST /api/business/tasks/reorder"]
  F --> K["Save with user ID"]
  G --> L["Find project by ID and user ID"]
  H --> M["Confirm project owner, then save task with user ID"]
  I --> N["Find task by ID and user ID"]
  J --> O["Bulk update only owned tasks"]
```

## Main Files

| Area | Files |
|---|---|
| Pages | `client/src/pages/Business.tsx`, `client/src/pages/Project.tsx` |
| Layout/components | `client/src/components/business/BusinessLayout.tsx`, `client/src/components/business/ProjectSidebar.tsx`, `client/src/components/business/TaskCard.tsx`, `client/src/components/business/TaskDialog.tsx` |
| Views | `client/src/components/business/views/BoardView.tsx`, `ListView.tsx`, `CalendarView.tsx`, `NotesView.tsx` |
| Backend | `backend/src/routes/business.routes.ts`, `backend/src/controllers/business.controller.ts` |
| Models | `backend/src/models/Project.model.ts`, `backend/src/models/Task.model.ts` |

## Data Rules

- Project, task, checklist, reorder, and delete operations check ownership.
- Project task counts update only when the project belongs to the user.
- Deleting a project also deletes owned tasks and related notes.
