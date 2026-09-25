const API_URL = "http://127.0.0.1:8000";

const todoListElement = document.getElementById("todo-list");
const formElement = document.getElementById("new-todo-form");
const titleInput = document.getElementById("todo-title");
const descriptionInput = document.getElementById("todo-description");
const messageElement = document.getElementById("message");

function showMessage(text) {
    messageElement.textContent = text;
    messageElement.hidden = false;
}

function hideMessage() {
    messageElement.hidden = true;
}


function createTodoElement(todo) {
    const taskElement = document.createElement("li");
    taskElement.classList.add("todo-item");
    if (todo.completed) {
        taskElement.classList.add("completed");
    }

    const textElement = document.createElement("div");
    textElement.classList.add("todo-text");

    const titleElement = document.createElement("h2");
    titleElement.classList.add("todo-title");
    titleElement.textContent = todo.title;

    const descriptionElement = document.createElement("p");
    descriptionElement.classList.add("todo-description");
    descriptionElement.textContent = todo.description;

    const statusElement = document.createElement("button");
    statusElement.type = "button";
    statusElement.classList.add("todo-status");
    statusElement.textContent = todo.completed ? "Completed" : "Incomplete";
    statusElement.setAttribute("aria-pressed", todo.completed);
    statusElement.addEventListener("click", () => toggleTodo(todo, taskElement));

    textElement.appendChild(titleElement);
    textElement.appendChild(descriptionElement);
    taskElement.appendChild(textElement);
    taskElement.appendChild(statusElement);

    return taskElement;
}

function renderTodos(todos) {
    todoListElement.innerHTML = "";
    for (const todo of todos) {
        todoListElement.appendChild(createTodoElement(todo));
    }
}

function loadTodos() {
    fetch(`${API_URL}/todos`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
            return response.json();
        })
        .then((todos) => {
            hideMessage();
            renderTodos(todos);
        })
        .catch((error) => {
            console.error("Could not load todos:", error);
            showMessage("Could not load todos. Is the backend running on port 8000?");
        });
}

function addTodo(event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    if (!title || !description) {
        return;
    }

    fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
            return response.json();
        })
        .then((createdTodo) => {
            hideMessage();
            todoListElement.appendChild(createTodoElement(createdTodo));
            formElement.reset();
            titleInput.focus();
        })
        .catch((error) => {
            console.error("Could not add todo:", error);
            showMessage("Could not add the todo. Please try again.");
        });
}

function toggleTodo(todo, taskElement) {
    fetch(`${API_URL}/todos/${todo.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !todo.completed }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
            return response.json();
        })
        .then((updatedTodo) => {
            hideMessage();
            taskElement.replaceWith(createTodoElement(updatedTodo));
        })
        .catch((error) => {
            console.error("Could not update todo:", error);
            showMessage("Could not update the todo. Please try again.");
        });
}

formElement.addEventListener("submit", addTodo);
loadTodos();
