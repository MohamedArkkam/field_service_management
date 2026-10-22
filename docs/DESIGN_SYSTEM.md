# Design System — SiteDirect

**Status:** Filled (v1 direction)  
**Related:** [`plan.md`](./plan.md) · roles: Admin / Site Lead / Client

## 1. Purpose

SiteDirect’s UI must make the **trusted progress chain** obvious:

**direct → prove → approve+rate (publish) → client sees**

Internal money (purchases, wages) stays **company-only**. The client sees **approved progress only**.

## 2. Principles

| Principle | Practice |
|-----------|----------|
| Trust is visible | Draft never looks “live to client”; Publish is deliberate |
| One job per screen | Especially Site Lead mobile — don’t mix publish + bills + attendance |
| Role costume | Admin = scannable control tower; Site Lead = fast field; Client = calm timeline |
| Tap > type (field) | Pickers, chips, large targets; short notes; photo URL/proof when available |
| Status language | Shared chips for progress + payment — not colour alone |
| Proof over prose | Title + note + rating (+ photo) beats long essays |
| No finance to client | Copy + layout reinforce “Approved progress only” |

**Avoid:** generic purple SaaS look; dashboard clutter on Client; card soup; fake stats in the hero; inventing roles or client money views.

## 3. Platforms (doors)

| Door | User | Device | Density |
|------|------|--------|---------|
| Admin web | Owner / Admin | Desktop / laptop | Medium–high, tables OK |
| Client progress link | Client | Phone or laptop browser | Low, read-only, generous space |
| Site Lead mobile | Site Lead | Phone (Expo) | Low field density, large controls |

## 4. Visual foundations

### 4.1 Brand direction
Working name **SiteDirect**. Visual tone: **industrial-calm** — concrete, daylight, trust — not fintech neon.

- Primary surface: warm off-white / stone (`#F4F1EA` family is fine if used with a **site-green or steel** accent — avoid terracotta+serif cliché and purple gradients).
- Accent: deep site green or slate-blue for primary actions (pick one and keep it).
- Danger: clear red for remove / destructive only.
- Success: muted green for Published / Paid.

### 4.2 Colour tokens (suggested)

| Token | Role |
|-------|------|
| `--bg` | Page background |
| `--surface` | Panels / sheets |
| `--text` | Primary text |
| `--text-muted` | Secondary |
| `--border` | Hairlines / dividers |
| `--accent` | Primary buttons / links |
| `--accent-contrast` | Text on accent |
| `--draft` | Draft chip |
| `--published` | Published chip |
| `--unpaid` / `--partial` / `--paid` | Payment chips |
| `--danger` | Destructive |

Use **text + chip label**, not colour alone (a11y / outdoor glare).

### 4.3 Typography
- Admin: clear sans for UI (system or one distinctive sans — not Inter-by-default if you can choose a purposeful face).
- Client: slightly larger body, comfortable reading on phone.
- Site Lead: large titles, minimal hierarchy depth (1 title + 1 supporting line).
- Avoid long uppercase labels; prefer sentence case.

### 4.4 Spacing & targets
- Base unit: 8px.
- Site Lead tap targets: **min 48×48px**; primary actions full-width.
- Admin: comfortable row height; don’t crush tables.
- Client: wide margins; timeline spacing > dense lists.

### 4.5 Elevation
Prefer borders and spacing over heavy shadows. No glow effects.

## 5. Shared components

### 5.1 Status chips

**Progress**
- `DRAFT` — internal only
- `PUBLISHED` — client-visible

**Payment**
- `UNPAID` · `PARTIAL` · `PAID`

**Pay type (workers)**
- `DAILY` · `MONTHLY`

Chips: short label, high contrast, consistent radius (e.g. 6–8px, not pill-everything).

### 5.2 Buttons
- **Primary** — one per view (Publish, Save purchase, Sign in)
- **Secondary** — Cancel / Back
- **Danger** — Remove assignment (confirm or easy undo)

### 5.3 Lists & empty states
Every list needs an empty state with **what + next action**:
- Client: “No published updates yet”
- Site Lead progress: “No drafts — add proof”
- Admin liabilities: “No outstanding amounts”

### 5.4 Forms
- Site Lead: 3–6 fields max per step; defaults (today’s date, etc.)
- Admin: longer forms OK on project setup
- Validation inline; don’t clear the form on error

### 5.5 Publish control
Publishing must feel heavier than “Save draft”:
- Explicit **Publish** + **rating 1–5**
- Optional confirm: “Client will see this”
- After success: chip flips to Published

## 6. Screen inventory & UX intent

### Admin web
| Screen | Intent |
|--------|--------|
| Login | Fast office entry |
| Projects | Portfolio scan; open site needing attention |
| Project detail | Setup: milestones, assignments, progress link, priority/value (internal) |
| Users | Create Admin / Site Lead / Client |
| Liabilities | Outstanding Unpaid/Partial first; labour + purchases |

### Site Lead mobile
| Screen | Intent |
|--------|--------|
| Login | Site Lead only; clear error if wrong role |
| My projects | Large rows; one tap into site |
| Project home | Three actions: Progress · Purchases · Workers/Attendance |
| Progress | List drafts/published; add draft; publish + rate |
| Purchases | Add bill; update amount paid → chip |
| Workers / Attendance | Add worker; mark day; daily vs monthly explained in one line |

### Client progress link
| Screen | Intent |
|--------|--------|
| `/p/{token}` | Project name, location/client label, timeline of **published** updates only; rating + date; empty state; never bills/wages/priority |

## 7. Content & microcopy

- Client eyebrow/sub: “Approved progress only — no bills or internal costs.”
- Publish: “Publish to client” not “Submit”
- Draft: “Only your team can see this”
- Errors: plain language + **Retry** on mobile (online-required)

## 8. Accessibility & field

- Contrast suitable for outdoor/glare (especially Site Lead + Client on phone)
- Don’t rely on colour alone for status
- Focus states on Admin web
- Offline-first: **out of v1** — show network failure clearly instead

## 9. Out of scope for UI (product lock)

- Client finance / money-vs-work statements
- Marketplace, ERP, Gantt, design/QS tools
- Separate supervisor vs recorder apps
- Notification spam in v1

## 10. Implementation order

1. Tokens + chips in Admin + Client CSS  
2. Client progress page polish (painkiller surface)  
3. Admin projects + liabilities hierarchy  
4. Site Lead screen IA + large actions  

## 11. Acceptance checks

- [ ] Client never sees draft, bills, wages, or priority/value  
- [ ] Publish requires rating and changes chip to Published  
- [ ] Site Lead primary actions reachable in ≤2 taps from project home  
- [ ] Admin liabilities answers “what do we still owe?” at a glance  
- [ ] Empty states exist on main lists
