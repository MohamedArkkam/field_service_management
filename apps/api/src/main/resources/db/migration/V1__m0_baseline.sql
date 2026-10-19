-- SiteDirect M0 baseline.
-- Domain tables (users, projects, progress, bills, labour) start in M1+.
-- This migration only proves Flyway is wired to PostgreSQL.

CREATE TABLE IF NOT EXISTS app_meta (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT INTO app_meta (key, value)
VALUES ('schema_milestone', 'M0')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
