# My Todo List

A simple todo list app. The frontend is plain HTML, CSS and JavaScript. It loads todos from a FastAPI backend that stores them in SQLite.

## Project structure

```
todo-list-project/
├── frontend/
│   ├── index.html      # page structure
│   ├── styles.css      # styling
│   └── script.js       # fetches and renders todos
├── backend/
│   ├── main.py         # FastAPI app, Pydantic models, SQLite setup
│   ├── requirements.txt
│   └── todos.db        # created automatically on first run
└── evidence/
    ├── html-before-css.png
    ├── styled-frontend.png
    └── integrated-application.png
```

## Running the app

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
fastapi dev main.py
```

The API runs at http://127.0.0.1:8000. The interactive docs are at http://127.0.0.1:8000/docs.

On startup the app creates the `todos` table and adds five starter todos if the table is empty.

### 2. Frontend

In a second terminal:

```bash
cd frontend
python3 -m http.server 5500
```

Open http://127.0.0.1:5500. You can also open `frontend/index.html` directly in the browser.

## API

| Method | Endpoint      | Description                          |
|--------|---------------|--------------------------------------|
| GET    | `/todos`      | List all todos                       |
| POST   | `/todos`      | Create a todo (`title`, `description`) |
| PUT    | `/todos/{id}` | Set a todo's `completed` value       |

Each todo looks like this:

```json
{ "id": 1, "title": "Item 1", "description": "Set up the project folders", "completed": true }
```

## How data flows

1. **SQLite:** todos are stored in the `todos` table. `completed` is stored as `0` or `1`.
2. **FastAPI:** `GET /todos` opens a connection, runs `SELECT * FROM todos`, and turns each row into a `Todo` Pydantic model. That converts `0`/`1` to `false`/`true`. FastAPI then returns the list as JSON.
3. **Browser:** `script.js` calls `fetch("http://127.0.0.1:8000/todos")` and parses the JSON. For each todo it builds an `<li>` and appends it to `#todo-list`. Completed todos get the `completed` class, which gives them a different style.
   ## html-before-css
<img width="900" height="800" alt="html-before-css" src="https://github.com/user-attachments/assets/e18bc3f3-4906-4f2a-8c90-2354a21f8b9f" />
    ## integrated-application
<img width="900" height="850" alt="integrated-application" src="https://github.com/user-attachments/assets/ae17d47f-f0c0-4b95-b895-f74b4e29e385" />
    ## styled-frontend
<img width="900" height="800" alt="styled-frontend" src="https://github.com/user-attachments/assets/dae0d8b8-cb86-45a2-80be-65040a3d5ec2" />

## Features

- Lists todos from the database, with different styles for completed and incomplete items
- Adds new todos using the "New task" card and the **+** button (bonus)
- Marks a todo complete or incomplete by clicking its status circle (bonus)
- Responsive layout for small screens
