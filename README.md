# React + FastAPI CRUD Boilerplate

A full-stack Items CRUD app. Backend in FastAPI + SQLite, frontend in React 18 + Vite.

---

## Quick Start

```bash
# Terminal 1 — backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8080
# → http://localhost:8080
# → interactive API docs at http://localhost:8080/docs

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
│   ├── main.py          # App entry point — wires everything together
│   ├── database.py      # SQLite connection and session management
│   ├── models.py        # ORM table definitions (Python class → DB table)
│   ├── schemas.py       # Pydantic models — shape of request/response data
│   ├── crud.py          # All database operations (pure logic, no HTTP)
│   └── routers/
│       └── items.py     # HTTP endpoints for /api/items
└── frontend/
    └── src/
        ├── main.jsx                  # React entry point (equivalent to index.js)
        ├── App.jsx                   # Root component: owns state + API calls
        └── components/
            ├── ItemForm.jsx          # Create / Edit form
            └── ItemList.jsx          # Table of items with Edit/Delete buttons
```

---

## Backend — FastAPI Concepts

### What is FastAPI?

FastAPI is a Python web framework like Flask, but built for modern Python. The biggest
practical differences you'll notice coming from Flask:

- **Type hints everywhere** — FastAPI reads your function signatures to validate data automatically.
- **async-first** — routes can be `async def`, which allows handling more requests concurrently.
- **Auto-generated docs** — visit `/docs` and you get a fully interactive API explorer for free.

---

### Middleware

**What it is:** Code that runs on every request before it reaches your route, and/or on every
response before it goes back to the client. Think of it as a filter that wraps the entire app.

**Flask equivalent:** `@app.before_request`, `@app.after_request`, or Flask extensions like
`flask-cors`.

**In this project** we use one middleware: CORS (Cross-Origin Resource Sharing).

```python
# main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow requests from any domain (fine for local dev)
    allow_methods=["*"],   # allow GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],
)
```

**Why CORS is needed:** Browsers block JavaScript from calling a different domain/port by default.
Our frontend runs on port 5173, our backend on 8080 — that counts as a different "origin".
Without CORS middleware, every `fetch()` call from React would be blocked by the browser before
it even reached FastAPI.

---

### Router

**What it is:** A mini-app that groups related routes under a common prefix. You define routes
on the router, then attach the router to the main app.

**Flask equivalent:** `Blueprint`. The concept is identical.

```python
# routers/items.py
router = APIRouter(prefix="/api/items", tags=["items"])

@router.get("/")          # → GET  /api/items/
@router.post("/")         # → POST /api/items/
@router.get("/{id}")      # → GET  /api/items/42
@router.put("/{id}")      # → PUT  /api/items/42
@router.delete("/{id}")   # → DELETE /api/items/42
```

```python
# main.py — attach the router to the app, same as app.register_blueprint() in Flask
app.include_router(items.router)
```

The benefit: as the app grows you add more routers (`users.py`, `orders.py`, etc.) without
touching `main.py` beyond one `include_router` line.

---

### Dependency Injection (`Depends`)

**What it is:** A way to declare that a function needs something (like a DB session) and have
FastAPI automatically provide it before calling your route. You write the "how to get it" once,
then just declare "I need it" in each route.

**Flask equivalent:** Flask doesn't have this built-in. The closest thing is `flask.g` combined
with `@app.before_request` to set up a DB connection, but it's manual and global. FastAPI's
`Depends` is more explicit and scoped per-request.

```python
# database.py — define HOW to get a session
def get_db():
    db = SessionLocal()
    try:
        yield db          # hand the session to the route
    finally:
        db.close()        # always close it after, even if an exception occurred


# routers/items.py — declare that this route NEEDS a session
@router.get("/")
def list_items(db: Session = Depends(get_db)):
    #                       ^^^^^^^^^^^^^^^^
    #   FastAPI sees this, calls get_db(), and passes the result as `db`
    return crud.get_items(db)
```

The `yield` in `get_db()` is key: everything before `yield` runs before the route, and
everything after runs after — guaranteed, even if the route raises an exception. It's like a
`with` statement that FastAPI manages for you.

---

### Pydantic Schemas

**What it is:** Python classes that define the exact shape of data coming in (request body) and
going out (response). FastAPI uses them to validate and serialize automatically.

**Flask equivalent:** You'd do this manually — `request.get_json()`, then check fields yourself,
maybe with `marshmallow` or `cerberus`. Pydantic is built into FastAPI and happens automatically.

```python
# schemas.py
class ItemCreate(BaseModel):
    name: str                    # required — if missing, FastAPI returns 422 automatically
    description: str | None = None   # optional

class ItemResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    model_config = {"from_attributes": True}  # allows reading from ORM objects, not just dicts
```

```python
# routers/items.py
@router.post("/", response_model=ItemResponse)  # FastAPI uses ItemResponse to shape the output
def create_item(data: ItemCreate, ...):         # FastAPI uses ItemCreate to validate the input
    #            ^^^^^^^^^^^^^^^^
    #   if the request body doesn't match ItemCreate, FastAPI rejects it before this runs
```

We use three schema classes:
- `ItemCreate` — shape of the POST body (no `id`, the DB assigns that)
- `ItemUpdate` — shape of the PUT body (same fields, different intent)
- `ItemResponse` — shape of what we return (includes `id`)

---

### ORM + SQLAlchemy

**What it is:** ORM (Object-Relational Mapper) lets you work with the database using Python
objects instead of raw SQL. SQLAlchemy is the library; it's the same one used in Flask-SQLAlchemy.

**Flask equivalent:** Flask-SQLAlchemy wraps SQLAlchemy. Here we use SQLAlchemy directly — slightly
more setup, but you see exactly what's happening without magic.

```python
# models.py — defines the "items" table as a Python class
class Item(Base):
    __tablename__ = "items"
    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, nullable=False)
    description = Column(String, nullable=True)
```

```python
# database.py — creates the engine (the connection to the file)
engine = create_engine("sqlite:///./app.db", connect_args={"check_same_thread": False})
#                                   ^^^^^^
#                   SQLite stores everything in this single file next to main.py
```

When the app starts, `Base.metadata.create_all(bind=engine)` in `main.py` reads all your model
classes and creates the corresponding tables in `app.db` if they don't exist yet. No migrations
needed for this simple setup.

---

### SOA Layer Summary

The backend follows a Service-Oriented Architecture — each file has one job:

| File | Layer | Responsibility | Flask analogy |
|---|---|---|---|
| `routers/items.py` | Presentation | HTTP in/out, status codes, 404s | `views.py` / Blueprint routes |
| `crud.py` | Service | DB queries, business logic | Helper functions you'd write manually |
| `models.py` | Data | Table definitions | Flask-SQLAlchemy models |
| `schemas.py` | DTO | Request/response contracts | `marshmallow` schemas |
| `database.py` | Infrastructure | Connection, session lifecycle | `db = SQLAlchemy(app)` setup |

The rule: **`routers/` knows about HTTP. `crud.py` does not.** `crud.py` only receives a
session and data, runs a query, and returns an ORM object. This means you could reuse `crud.py`
from a background job, a CLI script, or a different framework — it has no HTTP dependency.

---

## Frontend — React Concepts

### What is React?

React is a JavaScript library for building UIs. Instead of manually updating the DOM with jQuery
(`$('#list').append(...)`), you describe what the UI should look like for a given state, and
React figures out the minimal DOM changes needed.

The mental shift: **you don't touch the DOM — you update state, and React re-renders.**

---

### JSX

**What it is:** HTML-like syntax written inside JavaScript files. Babel/Vite compiles it to
regular JavaScript before the browser sees it.

**jQuery equivalent:** The HTML string you'd write inside `$(...).html("...")`.

```jsx
// This looks like HTML but it's JSX — it's JavaScript
return (
  <div>
    <h1>Items</h1>
    <p>{message}</p>   {/* curly braces = JavaScript expression */}
  </div>
);
```

---

### Components

**What they are:** JavaScript functions that return JSX. Each component is responsible for one
piece of the UI. They are reusable and composable.

**jQuery equivalent:** There's no direct equivalent — jQuery works on existing DOM elements.
Components are closer to Jinja2 macros, but they also manage their own logic and state.

```jsx
// A component is just a function that returns JSX
export default function ItemList({ items, onDelete }) {
  return (
    <ul>
      {items.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  );
}
```

---

### Props

**What they are:** Read-only values passed from a parent component to a child, declared as
function parameters. The child cannot modify them — it can only use them or call handler
functions passed down as props.

**jQuery equivalent:** Like arguments to a function. The parent calls the child with data.

```jsx
// Parent passes data and a handler
<ItemList items={items} onDelete={handleDelete} />

// Child receives them as parameters
function ItemList({ items, onDelete }) { ... }
```

---

### State (`useState`)

**What it is:** Data owned by a component. When state changes, React automatically re-renders
the component and any children that depend on it. You never modify state directly — you always
call the setter function.

**jQuery equivalent:** A variable you'd store somewhere and manually sync to the DOM. With React,
the sync is automatic.

```jsx
const [items, setItems] = useState([]);
//     ^^^^^  ^^^^^^^^^
//     value  setter — call this to update, never modify `items` directly

setItems(newItems);  // triggers re-render automatically
```

---

### `useEffect` — Running Code When Something Changes

**What it is:** A hook that runs a function after render, optionally only when specific values
change. Used for fetching data, syncing forms, subscriptions, etc.

**jQuery equivalent:** `$(document).ready(...)` for on-load effects, or a manual `onChange`
watcher for responding to variable changes.

```jsx
// [] = run once on mount (like document.ready)
useEffect(() => {
  fetchItems();
}, []);

// [editingItem] = run every time editingItem changes
useEffect(() => {
  if (editingItem) {
    setName(editingItem.name);
  }
}, [editingItem]);
```

---

### Component Breakdown

**`App.jsx` — Orchestrator**

Owns all shared state (`items`, `editingItem`) and all `fetch` calls. It passes data down as
props and passes handler functions so children can request changes without performing them.

```
App
 ├── state: items[], editingItem
 ├── functions: fetchItems, handleSave, handleDelete
 │
 ├── <ItemForm>   ← receives: editingItem, onSave, onCancel
 └── <ItemList>   ← receives: items, onEdit, onDelete
```

**`ItemForm.jsx` — Controlled Form**

Has local state for its input fields (`name`, `description`). A `useEffect` watches
`editingItem` — when it changes (user clicked Edit), the form pre-fills. On submit it calls
`onSave(data)` and App does the actual fetch.

**`ItemList.jsx` — Pure Display**

No state, no fetch — just renders the `items` array it receives as a prop. Clicking Edit or
Delete calls the handlers passed from App.

---

### Full Request Cycle (Delete example)

```
User clicks "Delete" on row 3
  → ItemList calls onDelete(3)              ← prop function from App
  → App.handleDelete(3) runs
  → fetch("DELETE /api/items/3")
      → FastAPI router receives DELETE /api/items/3
      → get_db() runs, injects DB session
      → crud.delete_item(db, 3) runs
      → SQLAlchemy deletes row from app.db
      → router returns 204 No Content
  → App calls fetchItems() to refresh
  → fetch("GET /api/items/")
      → FastAPI returns updated list
  → setItems(newList) updates state
  → React re-renders ItemList with new data
```

---

## API Reference

| Method | URL | Body | Response |
|---|---|---|---|
| GET | `/api/items/` | — | `[{ id, name, description }]` |
| GET | `/api/items/{id}` | — | `{ id, name, description }` |
| POST | `/api/items/` | `{ name, description? }` | `{ id, name, description }` |
| PUT | `/api/items/{id}` | `{ name, description? }` | `{ id, name, description }` |
| DELETE | `/api/items/{id}` | — | 204 No Content |

> All endpoints are explorable at `http://localhost:8080/docs` — you can test them directly from
> the browser without any extra tool.

---

## Key Terms Glossary

| Term | Meaning |
|---|---|
| **Middleware** | Code that wraps every request/response. CORS middleware handles cross-origin browser restrictions. |
| **Router** | Groups related routes under a prefix. Same as Flask's Blueprint. |
| **Depends** | FastAPI's dependency injection — auto-runs setup code (like `get_db`) before a route. |
| **Pydantic** | Library for data validation via type hints. Defines what request/response bodies must look like. |
| **Schema** | A Pydantic class describing the shape of data (DTO — Data Transfer Object). |
| **ORM** | Maps Python classes to DB tables. Write Python, not SQL. |
| **Component** | A JavaScript function that returns JSX. The building block of a React UI. |
| **Props** | Read-only data passed from parent to child component (like function arguments). |
| **State** | Data owned by a component. Changing it triggers a re-render. |
| **useState** | React hook that declares a state variable and its setter function. |
| **useEffect** | React hook that runs a side effect when specified values change. |
| **JSX** | HTML-like syntax in JavaScript files, compiled by Vite before the browser sees it. |
| **Vite** | The build tool that serves the frontend in dev mode and compiles JSX. Equivalent to Flask's dev server, but for JS. |
