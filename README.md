# Smart Campus Operations Hub

> **IT3030 – PAF Assignment 2026 | Faculty of Computing – SLIIT**

A full-stack web platform for managing university facility bookings, maintenance tickets, and campus operations.

---

## 👥 Team Contribution

| Member | Module | Responsibility |
|--------|--------|----------------|
| Member 1 | Module A | Facilities & Assets Catalogue |
| Member 2 | Module B | Booking Management |
| Member 3 | Module C | Maintenance & Incident Ticketing |
| **Piyumi Ranaweera** | **Module D + E** | **Notifications + OAuth2 + Role Management** |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 11, Spring Boot 2.7, Spring Security, OAuth2 |
| Database | PostgreSQL on Supabase |
| Auth | Google OAuth2 + JWT |
| Frontend | React 18, Vite, React Router v6, Axios |
| CI/CD | GitHub Actions |

---

## 🚀 Getting Started

### Prerequisites
- Java 11+
- Maven 3.8+
- Node.js 18+
- A [Supabase](https://supabase.com) project
- [Google Cloud Console](https://console.cloud.google.com/) OAuth2 credentials

---

### Backend Setup (Spring Boot)

1. **Clone the repository**
   ```bash
   git clone https://github.com/PiyumiRanaweera/smart-campus-hub.git
   ```

2. **Configure environment variables** — copy `.env.example` to `.env` and fill in:
   ```env
   SUPABASE_HOST=db.YOUR_PROJECT.supabase.co
   SUPABASE_PASSWORD=your_password
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   JWT_SECRET=YourSuperSecretJWTKey256BitsMinimum
   ```

3. **Run the API**
   ```bash
   mvn spring-boot:run
   ```
   API runs at: `http://localhost:8080`

---

### Frontend Setup (React)

1. **Navigate to client directory**
   ```bash
   cd smart-campus-client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment** — `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```

4. **Run the dev server**
   ```bash
   npm run dev
   ```
   App runs at: `http://localhost:5173`

---

## 🔌 Piyumi Ranaweera – API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/auth/me` | Get current user profile | Bearer JWT |
| `GET` | `/api/auth/status` | Health check | Public |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/users/me` | Get my profile | USER |
| `PATCH` | `/api/users/me/notifications` | Update notification prefs | USER |
| `GET` | `/api/users` | List all users | ADMIN |
| `GET` | `/api/users/{id}` | Get user by ID | ADMIN |
| `PUT` | `/api/users/{id}/role` | Assign/remove role | ADMIN |
| `DELETE` | `/api/users/{id}` | Deactivate user | ADMIN |

### Notifications
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/notifications` | Get all notifications | USER |
| `GET` | `/api/notifications/unread` | Get unread notifications | USER |
| `GET` | `/api/notifications/count` | Get unread count | USER |
| `PATCH` | `/api/notifications/{id}/read` | Mark one as read | USER |
| `PATCH` | `/api/notifications/read-all` | Mark all as read | USER |
| `DELETE` | `/api/notifications/{id}` | Delete notification | USER |

---

## 🔐 OAuth2 Flow

```
1. User clicks "Login with Google" in React
2. Browser redirects → GET /oauth2/authorize/google
3. Google authenticates user
4. Spring Boot handles callback → creates/updates DB user
5. JWT generated → redirect to http://localhost:5173/oauth2/redirect?token=xxx
6. React stores JWT in localStorage → attached as Bearer token on all requests
```

---

## 🧪 Running Tests

```bash
# Backend tests
cd smart-campus-api
mvn test

# View test coverage
mvn verify
```

---

## 📁 Project Structure

```
PAF_Proj/
├── smart-campus-api/          # Spring Boot REST API
│   ├── src/main/java/com/smartcampus/api/
│   │   ├── auth/              # OAuth2, JWT, controllers
│   │   ├── user/              # User model, service, controller
│   │   ├── notification/      # Notification model, service, controller
│   │   └── config/            # Security, JWT filter, CORS, exception handler
│   └── src/test/              # Unit tests
│
├── smart-campus-client/       # React Frontend
│   └── src/
│       ├── api/               # Axios API calls
│       ├── context/           # Auth + Notification providers
│       ├── components/        # Navbar, NotificationPanel, ProtectedRoute
│       ├── pages/             # Login, Dashboard, Profile, Notifications, Admin
│       └── utils/             # Date helpers
│
└── .github/workflows/ci.yml   # GitHub Actions CI/CD
```

---

## 🔒 Security Notes

- Never commit `.env` files — use `.env.example` as template
- JWT secret must be at least 256 bits
- All endpoints are protected by role-based access control
- CORS is configured to allow only trusted origins

---

## 🤖 AI Disclosure

Portions of this project were developed with assistance from AI coding tools (Antigravity / Google DeepMind). All AI-generated code has been reviewed, understood, and adapted by the implementing team member as per assignment guidelines.
