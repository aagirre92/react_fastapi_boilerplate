# Project Context



Full-stack learning project: **React 18 + FastAPI** boilerplate.



## Developer Background



- Comfortable with: Python, HTML, CSS, jQuery, Flask

- Learning: React and FastAPI — this project is the hands-on vehicle for that

- Preference: explain React/FastAPI patterns when introducing them; don't assume prior knowledge of either. Draw Flask→jQuery parallels where helpful.



## Stack



| Layer    | Technology                        |

|----------|-----------------------------------|

| Frontend | React 18, Vite 5                  |

| Backend  | FastAPI, Uvicorn                  |

| Styling  | Plain CSS (no framework yet)      |

| HTTP     | Native `fetch` (no axios/react-query yet) |



## Actual Project Structure



```

project/

├── backend/

│   ├── main.py            # FastAPI app + CORS middleware + routes

│   └── requirements.txt   # fastapi, uvicorn

├── frontend/

│   ├── index.html         # Vite entry point; mounts <div id="root">

│   ├── package.json       # react 18.2, react-dom 18.2, vite 5 — no other deps yet

│   └── src/

│       ├── main.jsx       # ReactDOM.createRoot entry; wrapped in StrictMode

│       └── App.jsx        # Single component: fetches /api/hello, renders message

└── README.md

```



No `components/`, `hooks/`, `pages/`, or `routers/` folders exist yet — don't reference them until created.



## Current State of the Code



**Backend (`backend/main.py`)**

- Single FastAPI app instance

- CORS middleware configured with `allow_origins=["*"]` (open — fine for local dev)

- One route: `GET /api/hello` → `{"message": "Hello from FastAPI!"}`

- Routes use sync `def`, not `async def`



**Frontend (`frontend/src/App.jsx`)**

- Single `App` component; no routing, no separate components

- Uses `useState` + `useEffect` to fetch `http://localhost:8000/api/hello` on mount

- API base URL is hardcoded as `http://localhost:8000`



## Coding Conventions



### Python / FastAPI

- Follow PEP 8; descriptive names over abbreviations

- Use `async def` for new route handlers (current routes are sync — migrate when touched)

- Use Pydantic models for request/response bodies when adding endpoints beyond simple GETs

- Keep routes in `main.py` until there are enough to justify splitting into `routers/`



### JavaScript / React

- Functional components only — no class components

- Hooks for all state and side-effects (`useState`, `useEffect`, etc.)

- One component per file; filename matches component name (PascalCase)

- `camelCase` for variables/functions; `PascalCase` for components

- Keep `App.jsx` lean — extract into `components/` when a second component is needed



### General

- Minimal, targeted changes — prefer surgical edits over broad refactors

- Add a brief comment when a pattern is non-obvious (especially React hooks or FastAPI middleware)



## Dev Commands



```bash

# Backend — from project root

cd backend

pip install -r requirements.txt

uvicorn main:app --reload        # http://localhost:8000

&#x20;                                # interactive docs at /docs



# Frontend — from project root

cd frontend

npm install

npm run dev                      # http://localhost:5173

```



## Known Gotchas



- `@vitejs/plugin-react` is **not** in `package.json` — JSX transform will fail on `npm run dev`. Add it before running the frontend:

&#x20; ```bash

&#x20; npm install -D @vitejs/plugin-react

&#x20; ```

&#x20; Then create `vite.config.js`:

&#x20; ```js

&#x20; import { defineConfig } from 'vite'

&#x20; import react from '@vitejs/plugin-react'

&#x20; export default defineConfig({ plugins: [react()] })

&#x20; ```

- API base URL (`http://localhost:8000`) is hardcoded in `App.jsx` — use a `VITE_API_URL` env var when this needs to change.

- No `.env` files exist yet in either frontend or backend.



## Key Decisions (update as project evolves)



- CORS: currently `allow_origins=["*"]` — tighten to `["http://localhost:5173"]` when ready

- No auth, no database, no state manager yet

