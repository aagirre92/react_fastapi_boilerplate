# React + FastAPI CRUD Boilerplate

A full-stack Items CRUD app. Backend in FastAPI + SQLite, frontend in React 18 + Vite.

---

## Quick Start

```bash
# Terminal 1 — backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8080
# → http://localhost:8080  (interactive docs at /docs)

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## Project Structure

```
project/
├── backend/
│   ├── main.py          # App entry point — registers middleware and router
│   ├── database.py      # SQLite connection and session setup
│   ├── models.py        # ORM table definition (maps Python class → DB table)
│   ├── schemas.py       # Pydantic models — validate request/response data
│   ├── crud.py          # All database operations (no HTTP logic here)
│   └── routers/
│       └── items.py     # HTTP endpoints — calls crud.py, returns responses
└── frontend/
    └── src/
        ├── App.jsx                   # Orchestrator: state + all fetch calls
        └── components/
            ├── ItemForm.jsx          # Create / Edit form
            └── ItemList.jsx          # Table of items with Edit/Delete buttons
```

---

## Backend — FastAPI

If you know Flask, FastAPI will feel familiar. Here's the mental mapping:

| Flask | FastAPI |
|---|---|
| `@app.route("/path", methods=["GET"])` | `@router.get("/path")` |
| `request.get_json()` | Function parameter with a Pydantic model |
| `jsonify(data)` | Just `return data` (FastAPI serializes automatically) |
| `abort(404)` | `raise HTTPException(status_code=404, ...)` |
| `flask_sqlalchemy` | `sqlalchemy` (same library, wired up manually) |

### SOA Layer Breakdown

The backend follows a Service-Oriented Architecture — each file has one job:

**`database.py` — Infrastructure layer**

Sets up the SQLite connection and a `get_db()` function. FastAPI calls `get_db()` automatically before each request (via `Depends`) and closes the session after. This is equivalent to Flask's `g` object pattern for DB sessions.

**`models.py` — Data layer**

Defines the `Item` class using SQLAlchemy ORM. This is the Python representation of your DB table — same concept as Flask-SQLAlchemy models.

```python
class Item(Base):
    __tablename__ = "items"
    id          = Column(Integer, primary_key=True)
    name        = Column(String, nullable=False)
    description = Column(String, nullable=True)
```

**`schemas.py` — DTO (Data Transfer Object) layer**

Pydantic models that define what data is accepted in requests and what is returned in responses. FastAPI uses these to validate inputs automatically — no manual `request.get_json()` checks needed.

```python
class ItemCreate(BaseModel):
    name: str
    description: str | None = None   # optional field
```

If the client sends invalid data (e.g. missing `name`), FastAPI rejects it with a 422 before your code even runs.

**`crud.py` — Service layer**

Pure database functions — no HTTP, no status codes, just SQLAlchemy queries. This is your business logic. Keeping it separate means you could swap FastAPI for Flask tomorrow without touching this file.

**`routers/items.py` — Presentation layer**

The HTTP surface of the app. Each function maps to one endpoint, calls `crud.py`, and translates the result into an HTTP response. The `Depends(get_db)` injects a DB session automatically.

```
GET    /api/items/       → list all items
GET    /api/items/{id}   → get one item
POST   /api/items/       → create item   (body: { name, description })
PUT    /api/items/{id}   → update item   (body: { name, description })
DELETE /api/items/{id}   → delete item
```

> Tip: visit `http://localhost:8080/docs` to see all endpoints and test them interactively — no Postman needed.

---

## Frontend — React

If you know jQuery, the mental shift to React is mostly about **who controls the DOM**.

| jQuery approach | React approach |
|---|---|
| You manipulate the DOM directly (`$('#list').append(...)`) | You update state — React re-renders the DOM for you |
| `$.ajax({ ... })` | `fetch(...)` inside `useEffect` or an event handler |
| One HTML file with inline scripts | Components — reusable JS functions that return HTML (JSX) |

### Component Breakdown

**`App.jsx` — Orchestrator**

Owns all shared state (`items` array, `editingItem`) and all `fetch` calls. Think of it as the controller. It passes data down to child components as **props** (read-only arguments), and passes handler functions so children can request changes without doing them directly.

```
App
 ├── items[]          ← fetched from API on load
 ├── editingItem      ← null = create mode, object = edit mode
 │
 ├── <ItemForm>       receives: editingItem, onSave, onCancel
 └── <ItemList>       receives: items, onEdit, onDelete
```

**`ItemForm.jsx` — Controlled form**

Has its own local state (`name`, `description`) for the input fields. When `editingItem` changes (i.e. the user clicks Edit on a row), a `useEffect` hook detects the change and pre-fills the form. On submit it calls `onSave(data)` — App does the actual fetch.

`useEffect` is React's way of reacting to changes. The `[editingItem]` at the end means "run this only when `editingItem` changes" — equivalent to an `onChange` watcher.

**`ItemList.jsx` — Pure display**

Receives the `items` array and renders a table. No state, no fetch — just props in, HTML out. Clicking Edit or Delete calls the handlers passed from App.

### Data Flow (one full cycle)

```
User clicks "Delete" on row 3
  → ItemList calls onDelete(3)        ← prop passed from App
  → App.handleDelete(3) runs
  → fetch DELETE /api/items/3
  → fetchItems() re-runs
  → items state updates
  → React re-renders ItemList automatically
```

---

## Key Concepts Glossary

| Term | What it means |
|---|---|
| **Props** | Read-only data passed from parent to child component (like function arguments) |
| **State** | Data owned by a component that, when changed, triggers a re-render |
| **useEffect** | Runs a side effect (fetch, sync) when specified values change |
| **useState** | Declares a state variable and a setter function |
| **Depends** | FastAPI's dependency injection — auto-runs `get_db()` before each route |
| **Pydantic** | Python library for data validation via type hints — used for schemas |
| **ORM** | Maps Python classes to DB tables so you write Python, not SQL |
