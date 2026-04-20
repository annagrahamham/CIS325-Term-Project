# MSU Events App

A campus events app for viewing, creating, and organizing Murray State University events.

## Features

- User registration for students, faculty, and staff
- User login and logout
- Forgot password flow
- Calendar view of upcoming events
- Month-by-month calendar navigation
- Event details panel
- Create new events
- Create new organizations
- Event favorites / check-ins
- Organization following support in the backend
- Notifications endpoint for upcoming favorited events
- Local user session persistence with `localStorage`
- SQLite database for storing users, organizations, events, follows, and favorites

## Main Pages

- Login page
- Registration page
- Dashboard calendar
- Organization and event creation forms

## Development

Install dependencies and start the app from the project root:

```bash
npm install
npm run dev
```

Backend only:

```bash
npm run start:backend
```

Frontend only:

```bash
npm run dev:frontend
```

## Project Structure

- `src/App.jsx` handles app routing between login, registration, and dashboard views
- `src/Frontend/Login.jsx` handles login and password reset
- `src/Frontend/Registration.jsx` handles account creation
- `src/Frontend/Dashboard.jsx` handles the calendar, organizations, events, and favorites
- `src/Backend/express.js` defines the API routes
- `src/Backend/server.js` sets up the SQLite database
