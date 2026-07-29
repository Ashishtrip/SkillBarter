# Skill Barter

Skill Barter is a Next.js + TypeScript web application that enables people to exchange skills through one-on-one barter-style matches. It allows users to offer skills they can teach and list skills they want to learn. The platform facilitates the formation of exchanges between users, complete with a contextual chat and a structured lifecycle (pending → active → completed).

This repository contains the full application source, API route handlers, Mongoose models, utility libraries, and tests.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict)
- **Database**: MongoDB (Mongoose for ODM)
- **Authentication**: NextAuth.js (OAuth providers: Google, Apple + Credentials), JWT sessions
- **Styling**: Tailwind CSS
- **Testing**: Jest (Unit testing) + Playwright (End-to-end testing)
- **Deployment**: Dockerized, Vercel-compatible

## 📂 Project Structure

```text
skill-barter/
├── src/
│   ├── app/                # Next.js App Router pages and API routes
│   │   ├── api/            # API endpoints (auth, user, skills, search, exchanges)
│   │   ├── auth/           # Authentication pages (signin)
│   │   ├── dashboard/      # User dashboard
│   │   ├── profile/        # User profile editor and display
│   │   ├── search/         # Search partners and skills
│   │   ├── exchanges/      # Exchanges list and detail pages
│   │   └── layout.tsx      # Top-level layout, seeds NextAuth session
│   ├── components/         # Reusable React UI components
│   │   ├── Chat.tsx        # Exchange messaging UI
│   │   ├── ExchangeCard.tsx# Exchange tile (status, actions)
│   │   ├── Header.tsx      # Top header
│   │   ├── Navbar.tsx      # Navigation components
│   │   ├── SkillsBrowser.tsx# Skills listing and add handlers
│   │   └── Modals/         # Modals for add/edit operations
│   ├── lib/                # Server-side utilities and helpers
│   │   ├── auth.ts         # NextAuth configuration
│   │   ├── mongodb.ts      # MongoDB connection singleton
│   │   └── api-helpers.ts  # Standardized API response wrappers
│   ├── models/             # Mongoose schemas
│   │   ├── User.ts         # User schema (skills, projects, education, etc.)
│   │   ├── Skill.ts        # Skill schema
│   │   └── Exchange.ts     # Exchange schema and message subdocuments
│   └── types/              # Shared TypeScript interfaces
├── public/                 # Static assets (logos, icons)
├── __tests__/              # Jest unit tests
├── Dockerfile              # Multi-stage production container build
├── tailwind.config.js      # Tailwind configuration
└── package.json            # Project dependencies and scripts
```

## 📱 Screens & UI

1. **Home / Landing Page**: Introduction to the platform, highlighting the barter-first model.
2. **Authentication (Sign In)**: OAuth flow for Google/Apple, and credentials sign-up/login.
3. **User Dashboard**: Aggregates counts (e.g., total skills to teach), shows recent exchanges, and provides quick action links.
4. **Profile**: User profile editor and display. Allows users to manage their skills (teach/learn), certificates, projects, education, work experience, and social links (GitHub, LinkedIn).
5. **Search / Skills Browser**: Browse and search for partners. Displays search results as user cards with a "Start Exchange" button (excludes the current user from results).
6. **Exchanges List**: Overview of all initiated or received exchanges.
7. **Exchange Detail (Chat)**: A contextual chat room for a specific exchange between two users. It also includes status management actions (Accept, Complete).

## ⚙️ Key Functions & Flows

### 1. Authentication Flow
- Configured via NextAuth in `src/app/api/auth/[...nextauth]/route.ts`.
- The top-level `layout.tsx` fetches the session server-side (`getServerSession`) and passes it to the `SessionProvider` to eliminate client-side hydration flicker.

### 2. Profile Management
- Users can GET and PUT profile details via `/api/user/profile`.
- Creating a skill updates both the `Skill` collection and the user's `skillsToTeach` or `skillsToLearn` arrays.
- Endpoints for projects, certificates, education, and work experience follow a similar POST/DELETE pattern with standardized `{ data, error }` API responses.

### 3. Skill & Search Flow
- `POST /api/skills` creates a skill and associates it with the user.
- The search endpoint (`/api/search/users/route.ts`) performs regex queries against the MongoDB database, populating skills and basic profile data, specifically filtering out the current user.

### 4. Exchange Lifecycle
- **Pending**: `POST /api/exchanges` creates an exchange between an initiator (`offeredBy`) and a target (`requestedBy`).
- **Active**: The recipient can accept the request via `PATCH /api/exchanges/[id]/status`.
- **Completed**: Either user can mark the exchange as complete once the barter is finished.
- Server-side validations prevent users from initiating exchanges with themselves.

### 5. Chat & Messaging
- Handled primarily by the `Chat.tsx` component and `/api/exchanges/[id]/messages` routes.
- Supports GET (list messages) and POST (create new message).
- Messages are stored as subdocuments within the `Exchange` document, including `createdAt` timestamps for relative time rendering.

## 🚀 Quick Start (Local Development)

1. **Environment Setup**:
   Copy the example environment file and provide your credentials.
   ```bash
   cp env.example .env.local
   # Provide MONGODB_URI and NEXTAUTH_SECRET in .env.local
   ```

2. **Install Dependencies & Run**:
   ```bash
   npm ci
   npm run dev
   ```

3. **Seed the Database (Optional)**:
   To test without creating accounts, you can use the DB seed endpoint.
   ```bash
   curl -X POST http://localhost:3000/api/db-status
   ```

4. **Testing**:
   ```bash
   npm test              # Run Jest unit tests
   npx playwright test   # Run end-to-end tests
   ```

## 🔐 Security & Best Practices
- Passwords are automatically hashed via NextAuth credentials strategy.
- Admin endpoints are protected server-side checking `session.user.isAdmin`.
- API endpoints always standardize responses and return minimal required user information to prevent sensitive data leaks.
- Input validation ensures safe POST/PATCH operations.
