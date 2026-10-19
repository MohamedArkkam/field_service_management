# Security — SiteDirect

**Status:** Stub — complete later

## Roles (locked)
| Role | May write | May read |
|------|-----------|----------|
| Admin / Owner | Projects, assignments, internal config | All project ops data for company |
| Site Lead | Checklist, proof, publish, bills, labour on assigned sites | Assigned sites |
| Client | — | Approved progress only (own project) |

## Controls (to flesh out)
- Password hashing; JWT/session — decide later
- Backend enforces permissions (never trust UI alone)
- Secrets in environment variables, not Git
- Publish audit (who approved/rated, when)
- Least-privilege DB access; backups

## Threat notes
- Client must not reach bills/wages via API guessing
- Site Lead publish is trust gate — Admin spot-check process
