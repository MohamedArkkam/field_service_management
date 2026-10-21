-- M3: site purchases (Unpaid/Partial/Paid), workers, attendance + wage charges
-- Internal only — never exposed via /api/public or Client role

CREATE TABLE site_workers (
    id           UUID PRIMARY KEY,
    project_id   UUID           NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    full_name    VARCHAR(255)   NOT NULL,
    pay_type     VARCHAR(32)    NOT NULL,
    rate         NUMERIC(14, 2) NOT NULL,
    active       BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    CONSTRAINT site_workers_pay_type_chk CHECK (pay_type IN ('DAILY', 'MONTHLY')),
    CONSTRAINT site_workers_rate_chk CHECK (rate >= 0)
);

CREATE INDEX site_workers_project_id_idx ON site_workers (project_id);

CREATE TABLE site_purchases (
    id             UUID PRIMARY KEY,
    project_id     UUID           NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    description    VARCHAR(500)   NOT NULL,
    vendor_name    VARCHAR(255),
    amount         NUMERIC(14, 2) NOT NULL,
    amount_paid    NUMERIC(14, 2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(32)    NOT NULL DEFAULT 'UNPAID',
    purchased_on   DATE           NOT NULL DEFAULT CURRENT_DATE,
    note           TEXT,
    created_by     UUID           NOT NULL REFERENCES users (id),
    created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    CONSTRAINT site_purchases_amount_chk CHECK (amount > 0),
    CONSTRAINT site_purchases_paid_chk CHECK (amount_paid >= 0 AND amount_paid <= amount),
    CONSTRAINT site_purchases_status_chk CHECK (payment_status IN ('UNPAID', 'PARTIAL', 'PAID')),
    CONSTRAINT site_purchases_status_amt_chk CHECK (
        (payment_status = 'UNPAID' AND amount_paid = 0)
        OR (payment_status = 'PAID' AND amount_paid = amount)
        OR (payment_status = 'PARTIAL' AND amount_paid > 0 AND amount_paid < amount)
    )
);

CREATE INDEX site_purchases_project_id_idx ON site_purchases (project_id);
CREATE INDEX site_purchases_status_idx ON site_purchases (payment_status);

CREATE TABLE attendance_records (
    id           UUID PRIMARY KEY,
    project_id   UUID        NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    worker_id    UUID        NOT NULL REFERENCES site_workers (id) ON DELETE CASCADE,
    work_date    DATE        NOT NULL,
    created_by   UUID        NOT NULL REFERENCES users (id),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT attendance_records_unique UNIQUE (worker_id, work_date)
);

CREATE INDEX attendance_records_project_id_idx ON attendance_records (project_id);
CREATE INDEX attendance_records_worker_id_idx ON attendance_records (worker_id);

-- Wage liability rows: one per daily attendance day, or one per calendar month for MONTHLY workers
CREATE TABLE labour_charges (
    id             UUID PRIMARY KEY,
    project_id     UUID           NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    worker_id      UUID           NOT NULL REFERENCES site_workers (id) ON DELETE CASCADE,
    attendance_id  UUID           REFERENCES attendance_records (id) ON DELETE SET NULL,
    pay_type       VARCHAR(32)    NOT NULL,
    period_key     VARCHAR(16)    NOT NULL,
    description    VARCHAR(500)   NOT NULL,
    amount         NUMERIC(14, 2) NOT NULL,
    amount_paid    NUMERIC(14, 2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(32)    NOT NULL DEFAULT 'UNPAID',
    created_by     UUID           NOT NULL REFERENCES users (id),
    created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    CONSTRAINT labour_charges_pay_type_chk CHECK (pay_type IN ('DAILY', 'MONTHLY')),
    CONSTRAINT labour_charges_amount_chk CHECK (amount > 0),
    CONSTRAINT labour_charges_paid_chk CHECK (amount_paid >= 0 AND amount_paid <= amount),
    CONSTRAINT labour_charges_status_chk CHECK (payment_status IN ('UNPAID', 'PARTIAL', 'PAID')),
    CONSTRAINT labour_charges_status_amt_chk CHECK (
        (payment_status = 'UNPAID' AND amount_paid = 0)
        OR (payment_status = 'PAID' AND amount_paid = amount)
        OR (payment_status = 'PARTIAL' AND amount_paid > 0 AND amount_paid < amount)
    ),
    CONSTRAINT labour_charges_period_unique UNIQUE (worker_id, period_key)
);

CREATE INDEX labour_charges_project_id_idx ON labour_charges (project_id);
CREATE INDEX labour_charges_status_idx ON labour_charges (payment_status);

UPDATE app_meta SET value = 'M3' WHERE key = 'schema_milestone';
