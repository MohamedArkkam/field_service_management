# Agents — SiteDirect

**Status:** Stub — complete later  
**Purpose:** Instructions for AI / coding agents working on this repo

## Product lock (do not invent)
- Single construction company only
- Roles only: **Admin / Owner**, **Site Lead**, **Client**
- Client = progress only (no company spend)
- Site Lead = combined field role (no separate supervisor/recorder)
- Bills: Unpaid / Partial / Paid
- Money reports for client stay outside the app (Excel/other)
- v1 Site Lead door = mobile app; Admin = web; Client = progress link
- Architecture: 3-tier modular monolith + PostgreSQL
- No marketplace, full ERP, design/QS, offline-first unless plan.md changes

## Source of truth order
1. `docs/plan.md` (this week)
2. `docs/PRD.md` / `ARCHITECTURE.md` / `DATABASE.md` when filled
3. Code

## Folder layout
- Course markdown stays flat in `docs/`
- Diagrams → `docs/assets/`
- Word exports → `docs/exports/`

## How to help
- Prefer narrowing scope over adding features
- Ask before adding roles or finance-to-client surfaces
- Keep diagrams to locked roles only
