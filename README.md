# ProcureIT — IT Procurement Management System


## Screenshots

![ProcureIT Dashboard](Screenshots\it_procurment.png)

**ProcureIT** is a full-stack web application that streamlines IT procurement by digitizing purchase requests, role-based approvals, and delivery tracking through a structured workflow.

Built with React, Node.js, Express, and SQLite, the system enables employees to submit IT purchase requests while managers, IT teams, and procurement staff review and process them according to their responsibilities.

### Key Features

- **Role-Based Access Control:** Separate permissions for employees, managers, IT reviewers, and procurement staff.
- **Multi-Stage Approval Workflow:** Track requests through manager review, IT approval, and procurement fulfillment.
- **Request Tracking & Audit Trail:** Review approval decisions, activity history, and time spent at each stage.
- **Delivery Proof Uploads:** Attach delivery images when completing approved requests.
- **Dashboard Statistics:** View request counts by status and average processing times.
- **Arabic RTL Interface:** A right-to-left user interface designed for Arabic-speaking users.

## Workflow

Every request moves through a fixed approval chain:

```
Employee submits ─► Manager review ─► IT review ─► Procurement fulfils ─► Completed
                         │                │
                         └── reject ──────┴──► Rejected (with reason)
```

| Status                | Who acts         | Possible actions                                  |
|-----------------------|------------------|---------------------------------------------------|
| `pending_manager`     | Manager          | Approve (optional notes) or reject (reason)       |
| `pending_it`          | IT               | Approve (optional notes) or reject (reason)       |
| `pending_procurement` | Procurement      | Complete, optionally with a proof-of-delivery image |
| `completed` / `rejected` | —             | Final                                             |

Each step is recorded in an approvals table and an activity log, which are shown on
the request's detail page together with the time spent in each stage.

## Roles

| Role          | Can do                                                                 |
|---------------|------------------------------------------------------------------------|
| `employee`    | Create requests; see only their own requests                           |
| `manager`     | See all requests; approve/reject requests waiting for a manager        |
| `it`          | See all requests; approve/reject requests waiting for IT               |
| `procurement` | See all requests; complete approved requests and upload delivery proof |

## Tech stack

| Part     | Technology                                                                 |
|----------|----------------------------------------------------------------------------|
| Frontend | React 18, React Router 6, Create React App                                 |
| Backend  | Node.js, Express 4, JWT authentication, bcrypt, multer (image uploads)     |
| Database | SQLite via [sql.js](https://github.com/sql-js/sql.js) (WebAssembly), stored in `backend/procurement.db` |

## Project structure

```
it_procurement/
├── backend/
│   ├── controllers/      Request handlers (auth, requests, users)
│   ├── middleware/       JWT authentication and role checks
│   ├── models/db.js      Database setup, schema and query helpers
│   ├── routes/           API routes
│   ├── uploads/          Proof-of-delivery images (not committed)
│   ├── config.js         Shared paths
│   ├── seed.js           Creates demo users and sample requests
│   ├── server.js         API entry point
│   └── .env.example      Environment variable template
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/client.js Fetch wrapper for the API
│       ├── context/      Login state
│       ├── components/   Layout, badges, modal, etc.
│       ├── pages/        Login, Dashboard, Requests, CreateRequest, RequestDetail, Approvals
│       └── i18n.js       Arabic UI text
└── ai_service/           Placeholder (not implemented)
```

## Getting started

Requirements: **Node.js 20.12 or newer** (developed on Node 24) and npm.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # then set JWT_SECRET to a long random value
npm run seed                # creates demo users and sample requests
npm start                   # API on http://localhost:5000
```

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> Run `npm run seed` while the API is **stopped**. The server keeps the database in
> memory and writes the whole file on each change, so the seed script refuses to run
> while the server is up.

For auto-restart during development use `npm run dev` (nodemon).

### 2. Frontend

```bash
cd frontend
npm install
npm start                   # http://localhost:3000
```

The development server forwards `/api` requests to `http://localhost:5000`
(the `proxy` setting in `frontend/package.json`).

### Demo accounts

After seeding, all accounts use the password `password123`:

| Role        | Email               |
|-------------|---------------------|
| Employee    | alice@company.com, bob@company.com     |
| Manager     | carol@company.com, david@company.com   |
| IT          | eve@company.com, frank@company.com     |
| Procurement | grace@company.com, henry@company.com   |

These are demo credentials only — they are also shown on the login page. Do not use
them in a real deployment.

## Configuration

`backend/.env` (see `backend/.env.example`):

| Variable     | Purpose                                   | Default |
|--------------|-------------------------------------------|---------|
| `PORT`       | API port                                  | `5000`  |
| `JWT_SECRET` | Secret used to sign login tokens          | If missing, a random secret is generated at startup and all logins expire on restart |

## API

All endpoints except login and health require `Authorization: Bearer <token>`.

| Method | Path                                   | Roles                    | Description |
|--------|----------------------------------------|--------------------------|-------------|
| POST   | `/api/auth/login`                      | —                        | Log in; returns token and user |
| GET    | `/api/auth/me`                         | any                      | Current user |
| GET    | `/api/requests?status=`                | any (employees: own)     | List requests |
| GET    | `/api/requests/stats`                  | any (employees: own)     | Counts per status and average stage times |
| GET    | `/api/requests/:id`                    | any (employees: own)     | Request with approvals and activity log |
| GET    | `/api/requests/:id/delivery-image`     | any (employees: own)     | Proof-of-delivery image |
| POST   | `/api/requests`                        | employee                 | Create (`title`, `description`, `item_type`, `priority`) |
| POST   | `/api/requests/:id/approve`            | manager, it              | Approve current stage (`notes` optional) |
| POST   | `/api/requests/:id/reject`             | manager, it              | Reject (`reason`) |
| POST   | `/api/requests/:id/complete`           | procurement              | Complete; multipart with optional `delivery_image` (JPEG/PNG/GIF/WebP, max 10 MB) and `notes` |
| GET    | `/api/users`                           | manager, it, procurement | List users |
| GET    | `/api/health`                          | —                        | Health check |

`item_type`: `Hardware`, `Software`, `Accessories`, `Networking`, `Storage`, `Other`.
`priority`: `low`, `medium`, `high`, `critical`.

## Not committed to Git

`.env`, the SQLite database (`*.db`), uploaded images, `node_modules/`, Python
virtual environments and build output are excluded by `.gitignore`. A new checkout
starts with an empty database — run `npm run seed`.

## Known limitations

- Single-process SQLite kept in memory (sql.js); suitable for a demo or small team,
  not for multiple server instances.
- Managers can review every employee's request; there is no team/department model.
- Users can only be created by the seed script (no user management screens).
- Requests cannot be edited or cancelled after submission; procurement cannot reject.
- No notifications (email or in-app).
- `ai_service/` is an empty placeholder.
- Frontend tooling (Create React App) reports `npm audit` warnings in its build and
  dev-server dependencies; these do not ship to the browser.
