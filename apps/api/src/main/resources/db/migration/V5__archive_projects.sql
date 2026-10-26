-- Soft archive for projects (not hard delete)

ALTER TABLE projects
    ADD COLUMN archived BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX projects_archived_idx ON projects (archived);
