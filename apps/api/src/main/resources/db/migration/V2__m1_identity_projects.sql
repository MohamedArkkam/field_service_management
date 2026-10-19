-- M1: identity, projects, milestones, assignments, progress link token

CREATE TABLE users (
    id            UUID PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255) NOT NULL,
    role          VARCHAR(32)  NOT NULL,
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT users_role_chk CHECK (role IN ('ADMIN', 'SITE_LEAD', 'CLIENT'))
);

CREATE TABLE projects (
    id                   UUID PRIMARY KEY,
    name                 VARCHAR(255) NOT NULL,
    location             VARCHAR(500),
    client_display_name  VARCHAR(255),
    priority             VARCHAR(32)  NOT NULL DEFAULT 'MEDIUM',
    project_value        NUMERIC(14, 2),
    strategic_note       TEXT,
    progress_token       VARCHAR(64)  NOT NULL UNIQUE,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT projects_priority_chk CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW'))
);

CREATE TABLE milestones (
    id          UUID PRIMARY KEY,
    project_id  UUID         NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    phase_name  VARCHAR(255),
    name        VARCHAR(255) NOT NULL,
    sort_order  INT          NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX milestones_project_id_idx ON milestones (project_id);

CREATE TABLE project_assignments (
    id               UUID PRIMARY KEY,
    project_id       UUID        NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    user_id          UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    assignment_role  VARCHAR(32) NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT project_assignments_role_chk CHECK (assignment_role IN ('SITE_LEAD', 'CLIENT')),
    CONSTRAINT project_assignments_unique UNIQUE (project_id, user_id)
);

CREATE INDEX project_assignments_project_id_idx ON project_assignments (project_id);
CREATE INDEX project_assignments_user_id_idx ON project_assignments (user_id);

UPDATE app_meta SET value = 'M1' WHERE key = 'schema_milestone';
