# Workout Logger Client

The React frontend for the Workout Logger application.

## Tech Stack

- **React 19**
- **Vite** — build tool and dev server
- **Tailwind CSS 4** — utility-first styling
- **React Router DOM 7** — client-side routing

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx          # App shell with nav and header
│   ├── ExercisePicker.jsx  # Modal for adding exercises to a log
│   └── ExerciseBrowser.jsx # Searchable, filterable exercise list (used inside picker)
├── context/
│   └── AuthContext.jsx     # Auth state, login/logout, token storage
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx       # Stats (streak, weekly count, total) + recent logs
│   ├── MyLogs.jsx          # User's log list with category filter
│   ├── NewLog.jsx          # Create a workout log
│   ├── EditLog.jsx         # Edit an existing log
│   ├── LogDetail.jsx       # View a single log
│   ├── Exercises.jsx       # Full exercise browser with sidebar filters
│   ├── CreateExercise.jsx  # Create a new exercise
│   ├── EditExercise.jsx    # Edit an exercise you own
│   └── Community.jsx       # Community feed with likes and comments
└── services/
    └── api.js              # Centralised fetch wrapper and API methods
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

> The client expects the API to be running at `http://localhost:8000`. See the [API README](../Workout-Logger-API/README.md) for setup instructions.

## Pages & Features

### Dashboard
Displays a personalised greeting, three stat cards (this week's logs, total logs, current streak), and the 5 most recent logs.

### My Logs
Lists all of the user's workout logs with category filter pills. Each log links to its detail page.

### New Log / Edit Log
Form for creating or editing a workout log. Fields include title, date, intensity, category, notes, and an exercise picker modal that supports search and category filtering.

### Log Detail
Read-only view of a single log with all exercises, sets, reps, and weight.

### Exercises
Full-page exercise browser with a sidebar containing:
- Text search
- Category filter (vertical pill list)
- Difficulty filter (radio group — Beginner → Intermediate → Advanced)
- Muscle group filter (multi-select checkboxes)

Exercises you created show a chevron and expand to reveal **Edit** and **Delete** actions. Delete requires inline confirmation before removing the exercise.

### Create Exercise / Edit Exercise
Form for creating or editing an exercise. Fields include name, category, difficulty, description, and muscle group checkboxes.

### Community
Community feed showing all users' workout logs. Each card can be expanded to view exercises. Features:
- **Likes** — toggle with instant optimistic UI update
- **Comments** — post a comment on any log; delete your own comments
- **Category filter** — filter the feed by workout category

## API Integration

All API calls go through `src/services/api.js`, which handles token injection from `localStorage` and throws on non-2xx responses. The base URL defaults to `http://localhost:8000`.

Authentication tokens are stored in `localStorage` and managed through `AuthContext`.
