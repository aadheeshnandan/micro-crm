# Micro CRM

A lightweight, AI-powered client management app for freelancers and solo operators. Paste inbound client messages and let AI extract structured contact details. Track leads through a simple pipeline, edit records inline, and draft professional follow-up replies — all in one dashboard.

Built with **Next.js 16**, **Supabase**, and **OpenAI**.

---

## Features

### Authentication

- Email and password sign up / sign in via Supabase Auth
- Protected dashboard — unauthenticated users are redirected to `/login`
- Sign out from the dashboard header

### Magic Input (AI client intake)

Paste a raw client inquiry (email, DM, contact form text, etc.) and click **Save Client**. GPT-4o-mini automatically extracts:

- **Name**
- **Email** (if present)
- **Service requested** (concise summary)
- **Date requested** (ISO 8601, if a date is mentioned)

The original message is stored alongside the parsed fields. Duplicate emails are rejected per user.

### Dashboard

- **Stats bar** — total clients, new this week, upcoming deadlines (next 7 days), and open leads (not closed)
- **Client table** — searchable and filterable by status
- **Status pipeline** — `New` → `Contacted` → `Closed`
- **Inline editing** — update name, email, service, and date directly in the table
- **AI follow-up drafts** — generate a warm, project-specific reply from the original message; copy to clipboard with one click
- **Delete clients** — with confirmation

### Security

- All database operations are scoped to the authenticated user's `user_id`
- Session tokens are refreshed on every request via Supabase SSR
- Server-side auth validation using `getUser()` (not client-side session alone)

---

## Tech Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Framework  | [Next.js 16](https://nextjs.org) (App Router) |
| Language   | TypeScript                                    |
| Styling    | [Tailwind CSS 4](https://tailwindcss.com)     |
| Icons      | [Lucide React](https://lucide.dev)            |
| Auth & DB  | [Supabase](https://supabase.com)              |
| AI         | [OpenAI GPT-4o-mini](https://openai.com)      |
| Validation | [Zod](https://zod.dev)                        |

---

## Prerequisites

- [Node.js](https://nodejs.org) 20+
- A [Supabase](https://supabase.com) project
- An [OpenAI API key](https://platform.openai.com/api-keys)

---

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd micro-crm
npm install
```

### Project Structure

```
src/
├── app/
│ ├── login/ # Sign in / sign up page
│ ├── dashboard/ # Main CRM dashboard
│ │ ├── page.tsx # Server component — loads clients
│ │ └── actions.ts # Server actions (AI parsing, CRUD)
│ └── auth/
│ └── actions.ts # Auth server actions
├── components/
│ ├── MagicInput.tsx # AI-powered client intake form
│ ├── ClientTable.tsx # Searchable, editable client table
│ └── StatsBar.tsx # Dashboard metrics
├── lib/
│ ├── supabase/
│ │ ├── client.ts # Browser Supabase client
│ │ └── server.ts # Server Supabase client (SSR cookies)
│ └── database.types.ts # Generated Supabase types
└── proxy.ts # Auth route protection
```
