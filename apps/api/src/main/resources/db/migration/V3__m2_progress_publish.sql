-- M2: progress updates with Site Lead publish gate (approve + rate)

CREATE TABLE progress_updates (
    id            UUID PRIMARY KEY,
    project_id    UUID         NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    milestone_id  UUID         REFERENCES milestones (id) ON DELETE SET NULL,
    title         VARCHAR(255) NOT NULL,
    note          TEXT,
    photo_url     VARCHAR(1000),
    status        VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
    rating        INT,
    created_by    UUID         NOT NULL REFERENCES users (id),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    published_at  TIMESTAMPTZ,
    CONSTRAINT progress_updates_status_chk CHECK (status IN ('DRAFT', 'PUBLISHED')),
    CONSTRAINT progress_updates_rating_chk CHECK (
        rating IS NULL OR (rating >= 1 AND rating <= 5)
    ),
    CONSTRAINT progress_updates_published_chk CHECK (
        (status = 'DRAFT' AND published_at IS NULL AND rating IS NULL)
        OR (status = 'PUBLISHED' AND published_at IS NOT NULL AND rating IS NOT NULL)
    )
);

CREATE INDEX progress_updates_project_id_idx ON progress_updates (project_id);
CREATE INDEX progress_updates_project_status_idx ON progress_updates (project_id, status);

UPDATE app_meta SET value = 'M2' WHERE key = 'schema_milestone';
