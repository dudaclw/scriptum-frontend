# Scriptum

A minimalist Markdown note editor and organizer, focused on productivity.

## Key Features

* **Create, edit, and delete** notes in Markdown (rich-text editing via Tiptap)
* **Tags** and **pinning** for important notes
* **Instant search** by title or content
* **Command palette** (`Cmd/Ctrl + K`) for quick note navigation
* **Authentication** (sign in / sign up, email verification flow)
* **Dark mode** (system-aware, via `next-themes`)
* **Responsive interface** (work in progress)

## Stack

| Layer          | Technologies                                                              |
| -------------- | -------------------------------------------------------------------------- |
| Frontend       | React 19 · TypeScript · React Router · Tailwind CSS (shadcn/ui, Radix UI) |
| Editor         | Tiptap · react-markdown + remark-gfm                                     |
| State          | Zustand (with persisted auth store)                                      |
| Forms          | React Hook Form + Zod                                                    |
| HTTP client    | Axios                                                                    |
| Build / Tooling| Vite · Biome (lint & format)                                             |

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/dudaclw/scriptum-frontend.git
cd scriptum-frontend

# 2. Install dependencies
bun install            # or npm/yarn

# 3. Configure the backend URL
#    The API base URL is currently hardcoded in src/domain/service/api.ts
#    (http://localhost:8080/api). Update it there, or wire up an
#    environment variable, to point at your backend instance.

# 4. Run in dev mode
bun run dev             # http://localhost:5173

# 5. Build for production
bun run build

# 6. Lint / format
bun run lint
```

This project expects a companion backend exposing `/auth`, `/users`, `/notes`, and `/tags`
REST endpoints (see `src/domain/service/api.ts` for the full contract).

## Project Structure

```
src/
├── domain/       # entities (Note, User, Tag) and the API service layer
├── lib/store/    # Zustand stores (auth, notes, settings)
├── hooks/        # reusable logic (auth guard, notes/tags API hooks, etc.)
├── schemas/      # Zod validation schemas
├── layouts/      # shared page layouts
├── pages/        # route-level views (auth, notes, settings, home)
└── components/   # UI components (shadcn/ui-based) and feature components
```

## Known Gaps / Roadmap

* [x] Automatic dark mode
* [ ] Move API base URL to an environment variable (`.env`)
* [ ] Export notes to PDF/HTML
* [ ] Public note sharing
* [x] Finish responsive layout


## Authors

* Giovane Comelli / 9gods
* Rafael Gonçalves
* Eduarda Kacprzak / [dudaclw](https://github.com/dudaclw)
* Giullia Vilanova
* Maria Eduarda Kolitski
