# 🖥️ Signage Control Panel

> **PT MJ Solution Indonesia — Full-Stack Technical Test**  
> A production-grade, real-time Digital Signage management platform built as a monorepo.

---

## 📐 Architecture Overview

```mermaid
graph TB
    subgraph Monorepo ["📦 Monorepo (pnpm workspaces + Turborepo)"]
        subgraph Apps
            ADMIN["apps/admin\nNext.js 15 App Router\nTypeScript · Tailwind CSS\nTanStack Query · Socket.io"]
            SERVER["apps/server\nExpress.js · Socket.io\nPrisma ORM · JWT · Zod"]
            CLIENT["apps/client-device\nElectron + React (Vite)\nZustand · Socket.io\nKiosk/Fullscreen Mode"]
        end
        subgraph Packages
            TYPES["packages/types\nShared TS Interfaces\nSocket Event Types · API DTOs"]
            DB["packages/database\nPrisma Schema\nPrismaClient Singleton"]
        end
    end

    ADMIN -- "REST API (JWT Bearer)\nHTTP/Axios" --> SERVER
    ADMIN -- "Socket.io /admin namespace\nDevice status updates" --> SERVER
    CLIENT -- "Socket.io /device namespace\nHeartbeat + Commands" --> SERVER
    SERVER -- "Prisma ORM" --> SUPABASE[("☁️ Supabase\nPostgreSQL")]
    SERVER -- "broadcast: device:status_change" --> ADMIN
    SERVER -- "emit: cmd:update_content" --> CLIENT
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20.0.0 |
| pnpm | ≥ 9.0.0 |
| Docker (optional) | For local PostgreSQL |

### 1. Clone & Install

```bash
git clone <repo-url>
cd signage-control-panel
pnpm install
```

### 2. Configure Environment

```bash
# Copy the root template
cp .env.example .env

# Copy per-app templates
cp apps/server/.env.example apps/server/.env
cp apps/admin/.env.example apps/admin/.env.local
cp apps/client-device/.env.example apps/client-device/.env
```

Edit `apps/server/.env` with your database credentials (see **Database Setup** below).

### 3. Database Setup

#### Option A — Local Docker (Recommended for dev)

```bash
docker-compose up -d
# DATABASE_URL = postgresql://signage:signage_dev_password@localhost:5432/signage_db
```

#### Option B — Supabase Cloud

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → Database**
3. Copy the **Transaction Pooler** URL → `DATABASE_URL`
4. Copy the **Direct Connection** URL → `DIRECT_URL`

### 4. Run Migrations & Seed

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed initial data (admin user + sample devices/content)
pnpm db:seed
```

**Default admin credentials after seed:**
```
Email   : admin@signage.id
Password: Admin123!
```

### 5. Start Development

```bash
# Start all apps simultaneously
pnpm dev

# Or start individually:
pnpm --filter @signage/server dev    # http://localhost:4000
pnpm --filter @signage/admin dev     # http://localhost:3000
pnpm --filter @signage/client-device dev  # Electron app
```

---

## 🗂️ Project Structure

```
signage-control-panel/
├── apps/
│   ├── admin/              # Next.js 15 Admin Dashboard
│   ├── server/             # Express.js + Socket.io Backend
│   └── client-device/      # Electron + React Kiosk App
├── packages/
│   ├── types/              # Shared TypeScript types
│   └── database/           # Prisma schema + client
├── docker-compose.yml
├── pnpm-workspace.yaml
└── turbo.json
```

---

## 📡 REST API Reference

Base URL: `http://localhost:4000/api`

### Authentication

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@signage.id",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": "...", "email": "admin@signage.id", "name": "Super Admin" }
  }
}
```

> All subsequent requests require: `Authorization: Bearer <token>`

---

### Devices

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/devices` | List all devices |
| `GET` | `/api/devices/:id` | Get device by ID |
| `POST` | `/api/devices` | Register new device |
| `PUT` | `/api/devices/:id` | Update device |
| `DELETE` | `/api/devices/:id` | Delete device |
| `GET` | `/api/devices/:id/playlist` | Get device playlist |
| `POST` | `/api/devices/:id/attach-content` | Add content to playlist |
| `DELETE` | `/api/devices/:id/playlist/:contentId` | Remove from playlist |
| `POST` | `/api/devices/:id/push` | Push content via WebSocket |

**Create Device:**
```http
POST /api/devices
{
  "nama": "Display Lobby Utama",
  "lokasi": "Lantai 1 - Lobby"
}
```

**Push Content:**
```http
POST /api/devices/:id/push
{
  "content_id": "uuid-of-content"
}
```

---

### Contents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/contents` | List all content |
| `POST` | `/api/contents` | Create content |
| `PUT` | `/api/contents/:id` | Update content |
| `DELETE` | `/api/contents/:id` | Delete content |

**Create Content:**
```http
POST /api/contents
{
  "judul": "Promo Banner Q1",
  "tipe": "IMAGE",
  "payload": "https://example.com/banner.jpg"
}
```

Content types: `IMAGE` · `VIDEO` · `TEXT` · `WEB`

---

## 🔌 WebSocket Events

Server URL: `ws://localhost:4000`

### `/device` Namespace (Client Device ↔ Server)

| Event | Direction | Payload |
|-------|-----------|---------|
| `device:register` | Client → Server | `{ deviceId: string }` |
| `device:ping` | Client → Server | `{ deviceId, timestamp }` |
| `device:pong` | Server → Client | `{ timestamp, serverTime }` |
| `cmd:update_content` | Server → Client | `{ contentId, playlist[] }` |
| `cmd:clear_display` | Server → Client | `{}` |

### `/admin` Namespace (Server → Admin Dashboard)

| Event | Direction | Payload |
|-------|-----------|---------|
| `device:status_change` | Server → Admin | `{ deviceId, status, last_seen }` |
| `device:connected` | Server → Admin | `{ deviceId, socketId, connectedAt }` |
| `device:disconnected` | Server → Admin | `{ deviceId }` |

---

## 🗃️ Database Schema

```mermaid
erDiagram
    User {
        UUID id PK
        String email UK
        String name
        String password
        DateTime created_at
    }
    Device {
        UUID id PK
        String nama
        String lokasi
        DeviceStatus status
        DateTime last_seen
        DateTime created_at
    }
    Content {
        UUID id PK
        String judul
        ContentType tipe
        String payload
        DateTime created_at
    }
    Playlist {
        UUID id PK
        UUID device_id FK
        UUID content_id FK
        Int urutan
        Int durasi
        DateTime created_at
    }
    Device ||--o{ Playlist : "has"
    Content ||--o{ Playlist : "used in"
```

---

## 🏗️ Tech Stack

### Backend (`apps/server`)
- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Express.js 4
- **WebSockets**: Socket.io 4 (namespaced)
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma 5
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: Zod
- **Logging**: Morgan

### Admin Dashboard (`apps/admin`)
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3 (custom design system)
- **State**: TanStack Query v5
- **HTTP**: Axios
- **Realtime**: Socket.io client
- **Icons**: Lucide React
- **Fonts**: Inter (Google Fonts)

### Client Device (`apps/client-device`)
- **Shell**: Electron 33
- **Renderer**: React 18 + Vite 6
- **State**: Zustand 5
- **WebSockets**: Socket.io client
- **Mode**: Fullscreen Kiosk

### Shared Packages
- **`@signage/types`**: TypeScript enums, API DTOs, Socket event payloads
- **`@signage/database`**: Prisma schema + PrismaClient singleton

---

## 🔧 Scripts Reference

```bash
# Root scripts (run from project root)
pnpm dev              # Start all apps in parallel
pnpm build            # Build all apps
pnpm lint             # Lint all apps
pnpm type-check       # TypeScript check all

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to DB (dev)
pnpm db:migrate       # Create and run migration
pnpm db:seed          # Seed initial data
pnpm db:studio        # Open Prisma Studio GUI

# Per-app (use --filter)
pnpm --filter @signage/server dev
pnpm --filter @signage/admin dev
pnpm --filter @signage/client-device dev
```

---

## 🔒 Security Notes

- JWT tokens expire in 7 days (configurable via `JWT_EXPIRES_IN`)
- Passwords are hashed with bcrypt (cost factor 12)
- Timing-attack prevention on login (constant-time comparison for non-existent users)
- CORS origin is configurable and restrictive in production
- Zod validates all API request bodies — malformed requests return structured 400 errors
- Socket.io namespaces separate device and admin connections

---

## 🧪 Verification Checklist

- [ ] `pnpm install` completes without errors
- [ ] `pnpm db:push` creates all tables
- [ ] `pnpm db:seed` creates admin user and sample data
- [ ] `GET /health` returns `{ status: "healthy", database: "connected" }`
- [ ] `POST /api/auth/login` returns JWT token
- [ ] Admin dashboard loads at `http://localhost:3000`
- [ ] Login with `admin@signage.id` / `Admin123!` succeeds
- [ ] Device table shows seeded devices
- [ ] Electron app launches and shows device ID in overlay
- [ ] Device status in dashboard changes to ONLINE when Electron app connects
- [ ] Admin pushes content → Electron app displays it within 1 second
- [ ] Kill Electron app → device shows OFFLINE in dashboard within 30 seconds

---

## 📝 License

MIT — PT MJ Solution Indonesia Technical Assessment Project
