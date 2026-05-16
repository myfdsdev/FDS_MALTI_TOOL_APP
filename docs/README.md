# Multi-Tool SaaS Docs

Start here when you need to understand the app features and data flow. Each main feature has its own Markdown file inside `docs/features`.

| Doc | Purpose |
|---|---|
| [Feature Files Index](./features/README.md) | One-file-per-feature documentation list. |
| [Authentication](./features/01-authentication.md) | Login, register, Google login, email verification, session flow. |
| [Dashboard](./features/02-dashboard.md) | First authenticated screen, usage, recent history, task summary. |
| [Tool Catalog](./features/03-tool-catalog.md) | Business Ideas, categories, dynamic tool pages, generation flow. |
| [URL Shortener](./features/04-url-shortener.md) | Real short-link creation and public redirect flow. |
| [History](./features/05-history.md) | User-owned generation history. |
| [Business Management](./features/06-business-management.md) | Workspace hub and sidebar section. |
| [Projects And Tasks](./features/07-projects-and-tasks.md) | Project boards, task CRUD, checklists, reorder flow. |
| [Calendar](./features/08-calendar.md) | Due-date task calendar. |
| [Notes](./features/09-notes.md) | Project, task, pinned, and global notes. |
| [Link Saver](./features/10-link-saver.md) | URL preview, scoped browser history, save preview as note. |
| [Resumes](./features/11-resumes.md) | Resume builder, AI helpers, share, PDF/DOCX export. |
| [Growth Reports](./features/12-growth-reports.md) | AI-required website growth reports with share/export flow. |
| [Profile And AI Settings](./features/13-profile-ai-settings.md) | User AI provider/model/key settings. |
| [Admin](./features/14-admin.md) | Admin stats, users, settings, cleanup flow. |
| [Data Isolation](./features/15-data-isolation.md) | User-scoped cache, storage, and backend ownership rules. |
| [Detailed Data Isolation Flow](./data-isolation-flow.md) | Extra implementation notes for account data separation. |
| [Detailed Growth Reports](./growth-reports.md) | Larger architecture notes for Growth Reports. |

Mermaid diagrams in these Markdown files render as flowchart images in GitHub, many docs viewers, and supported Markdown previews.
