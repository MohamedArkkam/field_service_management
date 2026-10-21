package com.sitedirect.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "attendance_records")
public class AttendanceRecord {

    @Id
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "worker_id", nullable = false)
    private UUID workerId;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected AttendanceRecord() {
    }

    public AttendanceRecord(UUID id, UUID projectId, UUID workerId, LocalDate workDate, UUID createdBy) {
        this.id = id;
        this.projectId = projectId;
        this.workerId = workerId;
        this.workDate = workDate;
        this.createdBy = createdBy;
    }

    public UUID getId() {
        return id;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public UUID getWorkerId() {
        return workerId;
    }

    public LocalDate getWorkDate() {
        return workDate;
    }

    public UUID getCreatedBy() {
        return createdBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
