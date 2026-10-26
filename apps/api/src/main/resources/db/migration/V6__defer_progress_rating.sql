-- Rating deferred: publish no longer requires or sets rating.
-- Keep nullable column for a possible later return; relax publish check.

ALTER TABLE progress_updates DROP CONSTRAINT progress_updates_published_chk;

ALTER TABLE progress_updates ADD CONSTRAINT progress_updates_published_chk CHECK (
    (status = 'DRAFT' AND published_at IS NULL)
    OR (status = 'PUBLISHED' AND published_at IS NOT NULL)
);

COMMENT ON COLUMN progress_updates.rating IS 'Deferred — unused by API; publish leaves NULL';
