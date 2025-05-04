# Feature Design: Authentication System and Events Management

## Authentication Overview

The Sahaja Yoga Telangana website uses NextAuth.js for authentication, providing secure user login and registration functionality. The authentication system supports credential-based (email/password) authentication, with optional support for OAuth providers like Google and GitHub.

## Authentication Components

### Authentication Flow

1. **Registration**:
   - User submits registration form with name, email, and password
   - Server validates input 
   - Password is hashed using bcrypt
   - User is stored in MongoDB

2. **Login**:
   - User submits login form with email and password
   - Server validates credentials against database
   - NextAuth.js creates and manages session
   - User is redirected to home page on success

3. **Session Management**:
   - NextAuth.js handles session tokens
   - Middleware protects routes based on authentication status
   - User role-based access control (Admin vs User)

## Authentication Technical Implementation

### NextAuth.js Configuration

The NextAuth.js configuration is set up in `src/app/api/auth/[...nextauth]/options.ts` with the following providers:

- Credentials provider for email/password login
- Google OAuth provider (optional)
- GitHub OAuth provider (optional)

Custom callbacks handle:
- `signIn`: Create user in database if they don't exist
- `jwt`: Add user role to token
- `session`: Add user information to session

### Database Model

The User model in MongoDB includes:
- name
- email
- hashed password
- role (Admin/User)
- avatar (optional)
- password reset token (for recovery)

### Authentication API Routes

- `/api/auth/register`: User registration
- `/api/auth/login`: Credential validation
- `/api/auth/[...nextauth]`: NextAuth.js API routes

### Middleware

The `middleware.ts` file handles route protection:
- Admin routes under `/admin/*` are restricted to users with Admin role
- Some user routes are protected and require authentication

## Events Feature

### Overview

The Events feature allows displaying upcoming events on the homepage and provides an admin interface for managing events.

### Components

1. **Events Display**:
   - Homepage component showing upcoming events in a card layout
   - Events are filtered to show only future dates
   - Each event card displays title, description, date, time, and location
   - Events are accessible via the "Upcoming Events" navigation item in the main menu

2. **Admin Events Management**:
   - Admin panel interface for creating, viewing, and deleting events
   - Form for adding new events with validation
   - Table display of all events with status indicators
   - Delete functionality with confirmation

### Technical Implementation

#### MongoDB Model

The Event model includes:
- title
- description
- date
- time
- location
- image (optional)
- isActive (boolean)
- createdAt (timestamp)

#### API Routes

- `GET /api/events`: Fetch upcoming events
- `POST /api/events`: Create new event (admin only)
- `GET /api/events/[id]`: Get specific event
- `PUT /api/events/[id]`: Update event (admin only)
- `DELETE /api/events/[id]`: Delete event (admin only)

#### Frontend Components

- `Events.tsx`: Component for displaying events on homepage
- `admin/events/page.tsx`: Admin interface for event management

### Sample Event

For testing purposes, we've added a sample event to the Events component:

- **Title**: Shri Krishna Puja 2025
- **Description**: Three-day event featuring meditation, music, collective gatherings, and special pujas dedicated to Lord Krishna
- **Date**: August 15-17, 2025
- **Location**: Hyderabad, Telangana
- **Image**: ShriMatajiKrishnaPuja.jpg (stored in the public directory) 