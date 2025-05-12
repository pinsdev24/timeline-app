# Timeline Explorer Application

A comprehensive web application for exploring historical events on interactive timelines with user authentication, comments, and media management capabilities.

## Project Structure

The application follows a microservices architecture:

- **Web**: Angular frontend application
- **Services**:
  - `auth_service`: Handles user authentication and authorization
  - `comment_service`: Manages user comments on events
  - `event_service`: Provides timeline and event data
  - `media_service`: Manages media files associated with events

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- MongoDB (v4.4 or higher)

## Running the Application

### 1. Running the Microservices

Each microservice needs to be started individually. Open a separate terminal window for each service.

#### Auth Service

```bash
cd services/auth_service
npm install
npm run dev
```

The auth service will run on http://localhost:3001 by default.

#### Comment Service

```bash
cd services/comment_service
npm install
npm run dev
```

The comment service will run on http://localhost:3002 by default.

#### Event Service

```bash
cd services/event_service
npm install
npm run dev
```

The event service will run on http://localhost:3003 by default.

#### Media Service

```bash
cd services/media_service
npm install
npm run dev
```

The media service will run on http://localhost:3004 by default.

### 2. Running the Angular Frontend

```bash
cd web
npm install
npm start
```

The Angular application will be available at http://localhost:4200.

## Features

- Interactive timeline visualization
- User authentication and authorization
- Event creation and management
- Comment system with moderation capabilities
- Media upload and management
- Admin dashboard for content moderation

## Admin Features

Administrators and moderators have access to a dashboard for managing comments:

- View all comments (both approved and pending)
- Filter comments by status (pending/approved)
- Search comments by content, username, or event ID
- Approve pending comments
- Delete comments

Access the admin dashboard through the "Dashboard" link in the user dropdown menu (only visible to users with admin or moderator roles).

## Environment Configuration

Each service has its own `.env` file for configuration. Make sure these are properly set up before running the services.

## Testing

To run tests for any of the services:

```bash
cd services/<service_name>
npm test
```

To run tests for the Angular application:

```bash
cd web
npm test
```

## Building for Production

### Services

For each service:

```bash
cd services/<service_name>
npm start
```

### Angular Application

```bash
cd web
npm run build
```

The build artifacts will be stored in the `web/dist/` directory.