import sqlite3
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

DATABASE_PATH = Path(__file__).parent / "todos.db"

SEED_TODOS = [
    ("Item 1", "Set up the project folders", 1),
    ("Item 2", "Write the HTML structure", 1),
    ("Item 3", "Style the page with CSS", 0),
    ("Item 4", "Build the FastAPI backend", 0),
    ("Item 5", "Connect the frontend to the backend", 0),
]



class Todo(BaseModel):
    id: int
    title: str
    description: str
    completed: bool


class TodoCreate(BaseModel):
    title: str
    description: str
    completed: bool = False


class TodoUpdate(BaseModel):
    completed: bool



def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            completed INTEGER NOT NULL DEFAULT 0
        )
        """
    )

    count = connection.execute("SELECT COUNT(*) FROM todos").fetchone()[0]
    if count == 0:
        connection.executemany(
            "INSERT INTO todos (title, description, completed) VALUES (?, ?, ?)",
            SEED_TODOS,
        )

    connection.commit()
    connection.close()



@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_database()
    yield


app = FastAPI(title="Todo API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Todo API is running"}


@app.get("/todos", response_model=list[Todo])
def get_todos():
    connection = get_connection()
    cursor = connection.execute("SELECT * FROM todos ORDER BY id")
    rows = cursor.fetchall()
    connection.close()

    return [Todo(**dict(row)) for row in rows]



@app.post("/todos", response_model=Todo, status_code=201)
def create_todo(todo: TodoCreate):
    connection = get_connection()
    cursor = connection.execute(
        """
        INSERT INTO todos (title, description, completed)
        VALUES (?, ?, ?)
        """,
        (todo.title, todo.description, todo.completed),
    )
    connection.commit()
    new_id = cursor.lastrowid
    connection.close()

    return Todo(id=new_id, **todo.model_dump())


@app.put("/todos/{todo_id}", response_model=Todo)
def update_todo(todo_id: int, update: TodoUpdate):
    connection = get_connection()
    connection.execute(
        """
        UPDATE todos
        SET completed = ?
        WHERE id = ?
        """,
        (update.completed, todo_id),
    )
    connection.commit()
    row = connection.execute("SELECT * FROM todos WHERE id = ?", (todo_id,)).fetchone()
    connection.close()

    if row is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return Todo(**dict(row))
