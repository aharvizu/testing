# Dealer Admin

Admin web app for automotive dealership groups. Manages inventory, leads, sales pipeline, expenses, suppliers, locations, users/roles, and reporting.

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL on Neon (serverless) via Prisma ORM
- **Auth:** NextAuth.js (Email magic link + Credentials)
- **Validation:** Zod
- **Forms:** React Hook Form
- **Tables:** TanStack Table
- **Charts:** Recharts

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd dealer-admin
npm install
```

### 2. Create a Neon database

Go to [neon.tech](https://neon.tech), create a project and database, and copy the connection string.

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set:

- `DATABASE_URL` — your Neon connection string
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` — `http://localhost:3000`
- `RESEND_API_KEY` — from [resend.com](https://resend.com) (optional for dev)
- `ENABLE_CREDENTIALS_PROVIDER` — `true` for local dev with email/password

### 4. Run migrations and seed

```bash
npx prisma migrate dev --name init
npm run db:seed
```

### 5. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Login

```
Email:    admin@dealer.com
Password: Admin123!
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (authenticated)/    # Protected pages (dashboard, inventory, etc.)
│   ├── api/auth/           # NextAuth API route
│   ├── login/              # Public login page
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── layout/             # App shell, sidebar, topbar
│   ├── forms/              # Reusable form components
│   └── tables/             # DataTable with TanStack Table
├── lib/
│   ├── auth.ts             # NextAuth config
│   ├── db.ts               # Prisma client
│   ├── permissions.ts      # RBAC system
│   ├── validations/        # Zod schemas
│   ├── constants.ts        # Labels, translations (ES-MX)
│   └── utils.ts            # Formatting, helpers
└── services/               # Domain logic (DB operations + audit)
```

## RBAC

Roles: `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `SALES`, `FINANCE`, `SUPPORT`, `VIEWER`

- **SUPER_ADMIN** sees all locations and has full access
- Other roles are scoped to their assigned locations
- Permissions are enforced both on the UI (hidden buttons) and server (actions/routes)

## Modules

- **Dashboard** — KPIs, charts (sales by location, expenses by category, leads/vehicles by status)
- **Inventory** — Full CRUD for vehicles with VIN, stock number, pricing, status tracking
- **Leads** — Customer inquiries with source tracking, assignment, notes timeline
- **Deals** — Sales pipeline (Open → Closed Won/Lost), auto-marks vehicles as SOLD
- **Suppliers** — Vendor management
- **Expenses** — Categorized expense tracking per location
- **Locations** — Branch office management (14 seeded locations)
- **Users** — User management with role and location assignment
- **Reports** — Sales, expenses, and margin reports with charts
- **Audit Log** — Tracks all CRUD and auth events
# testing
