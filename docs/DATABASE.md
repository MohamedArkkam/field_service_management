# Database — SiteDirect

**Status:** Stub — complete later  
**Choice:** PostgreSQL — money-like and operational records need integrity  
**Guidance applied:** Postgres for money & records; schema always exists; choose with a reason

## Why PostgreSQL
- Site purchases (Unpaid / Partial / Paid) and labour are record-like
- Publish gate needs clear relational rules (who published what, when)
- Multi-site + role assignment fits relational modelling

## Main entities (draft)
- Users, Projects, ProjectAssignments
- Phases / Milestones
- ChecklistItems, ProgressEntries, ApprovalPublishes
- SitePurchases (payment status)
- Workers, AttendanceRecords, WageEntries

## Main rules (draft)
- Client reads only published progress for assigned project
- Purchase and wage tables never exposed to Client
- Unpaid/Partial remain visible to Admin until Paid

## Migrations
<!-- Flyway / equivalent — fill later -->

## Not chosen for v1
- MongoDB as primary store (no bursty document-primary workload yet)
