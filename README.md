# TaskFlow — Task Manager

A full-stack task manager built with React, FastAPI, SQLAlchemy, and SQLite. Tasks are stored in a local SQLite database, so they remain available after restarting the API.

## Features

- Create, edit, complete, reactivate, and delete tasks
- Search titles and descriptions; filter by All, Active, and Completed
- Server-calculated total, completed, and remaining statistics
- Input validation, loading/error/empty/success feedback, and responsive accessible UI
- SQLite persistence and a paginated API

## Technology and architecture

- Backend: Python 3.11+, FastAPI, SQLAlchemy 2, Pydantic, SQLite, Uvicorn
- Frontend: React, JavaScript ES modules, Vite, CSS, Fetch API
- Tests: Pytest, FastAPI TestClient, HTTPX, isolated in-memory SQLite

```text
backend/app/       API, database, ORM model, schemas, routes
backend/tests/     API tests and isolated test fixture
frontend/src/      React UI, API service, and styles
screenshots/       Place manually captured UI screenshots here
```

## Prerequisites

- Python 3.11 or newer
- Node.js and npm
- Windows PowerShell (commands below use PowerShell syntax)

Before continuing, check that Python is installed and registered with the Python launcher:

```powershell
py -0p
```

The list must contain an installed Python 3.11 or newer. If it says **No suitable Python runtime found**, install Python from python.org and enable the Python Launcher (and PATH option) in the installer. Close and reopen PowerShell, then run `py -0p` again. A `python` command that only opens the Microsoft Store is an App Execution Alias, not an installed Python runtime.

## Run locally

Open two PowerShell terminals. Run backend commands only in `backend`, and frontend commands only in `frontend` (the `package.json` is in the frontend folder).

### Backend

```powershell
Set-Location .\backend
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Start this terminal in the project root, or replace `.ackend` with the full path to your backend folder. `py -3` uses an installed Python 3 version; if only Python 3.11 is installed, `py -3.11` also works.

If PowerShell blocks virtual-environment activation, use `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in that terminal, then activate again. The API creates `backend/taskflow.db` on first startup.

### Frontend

```powershell
Set-Location .\frontend
npm install
npm run dev
```

Start this terminal in the project root, or replace `.rontend` with the full path to your frontend folder.

Open <http://localhost:5173>. Interactive API documentation is at <http://localhost:8000/docs> and the health endpoint is <http://localhost:8000/api/health>.

## Configuration and data

The backend reads `DATABASE_URL`; its default is `sqlite:///./taskflow.db` (relative to the backend working directory). The frontend reads `VITE_API_BASE_URL`; its default is `http://localhost:8000/api`. Copy `.env.example` to `.env` to document local values; Vite loads `frontend/.env` for frontend variables, so copy `frontend/.env.example` there when overriding the frontend URL. Never place secrets in frontend variables. Local database files are ignored by Git.

Tables are created automatically at API startup. Back up the SQLite database file to preserve your local tasks.

## API

All task routes start with `/api/tasks`. JSON examples use `http://localhost:8000` as the origin.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | API health |
| GET | `/api/tasks?search=plan&completed=false&limit=20&offset=0` | Search, filter, newest-first list, pagination |
| GET | `/api/tasks/stats` | Complete collection statistics |
| GET | `/api/tasks/{task_id}` | Read one task |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/{task_id}` | Update supplied fields |
| DELETE | `/api/tasks/{task_id}` | Delete a task (204 response) |

Create example:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8000/api/tasks -ContentType 'application/json' -Body '{"title":"Plan the week","description":"Choose three priorities"}'
```

Titles are trimmed, required, and limited to 120 characters. Descriptions are optional and limited to 2,000 characters. Missing IDs return 404; invalid input returns 422.

## Tests and production build

```powershell
cd backend
python -m pip install -r requirements.txt
python -m pytest -q
```

```powershell
cd frontend
npm install
npm run build
```

The test fixture uses an in-memory SQLite database and does not write to the development database.

## Manual browser checklist

1. Start the backend and frontend, then open the app.
2. Add a task with a description; confirm it appears and total/remaining update.
3. Search by part of its title and by a word in its description.
4. Toggle All, Active, and Completed; confirm counts still describe every task.
5. Edit the task, mark it complete and active, then delete it and confirm the dialog.
6. Restart the backend and confirm remaining tasks persist.
7. Resize to a narrow mobile viewport and navigate form controls with the keyboard.

## Troubleshooting

- **Network error:** Ensure Uvicorn is running on port 8000 and the frontend URL is correct.
- **CORS error:** The API allows Vite at `localhost:5173` and `127.0.0.1:5173`.
- **Python command not found:** Install Python 3.11+ and enable the Python launcher, or use the full path to `python.exe`.
- **`py -3.11` says no runtime is installed:** Install Python 3.11+ first. Do not run the activation command until `py -3 -m venv .venv` finishes successfully and creates `.venv`.
- **`Activate.ps1` is not recognized:** From `backend`, use the exact relative path `\.venv\Scripts\Activate.ps1` (with `.` then a backslash). If the environment was never created, return to Python installation and create it first.
- **`npm` says `package.json` is missing:** You are likely still inside `backend`. Change directory to the sibling `frontend` folder before running npm commands.
- **Activation blocked:** Use the process-scoped PowerShell execution policy command in the backend instructions.
- **Port in use:** Start Uvicorn with `--port 8001`, then set `VITE_API_BASE_URL=http://localhost:8001/api` in `frontend/.env` and restart Vite.

## Security notes

This portfolio app is intended for local development. It has no authentication or authorization, so do not expose it publicly with private data. CORS is restricted to the two local Vite origins. Keep local environment files and SQLite data out of source control.

## Screenshots

No screenshots are included. Capture your own screenshots and save them in `screenshots/` before adding image links to this section.

## Future improvements

- User accounts and per-user task ownership
- Database migrations and deployment configuration
- Frontend component tests and end-to-end browser tests
- Bulk actions, due dates, and task priorities

## License

MIT. See [LICENSE](LICENSE).
