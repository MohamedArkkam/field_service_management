package com.sitedirect.api.progress;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "progress_updates")
public class ProgressUpdate {

    @Id
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "milestone_id")
    private UUID milestoneId;

    @Column(nullable = false)
    private String title;

    private String note;

    @Column(name = "photo_url", length = 1000)
    private String photoUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ProgressStatus status = ProgressStatus.DRAFT;

    /** Deferred — column kept nullable; publish no longer sets a value. */
    private Integer rating;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "published_at")
    private Instant publishedAt;

    protected ProgressUpdate() {
    }

    public ProgressUpdate(UUID id, UUID projectId, String title, UUID createdBy) {
        this.id = id;
        this.projectId = projectId;
        this.title = title;
        this.createdBy = createdBy;
    }

    public UUID getId() {
        return id;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public UUID getMilestoneId() {
        return milestoneId;
    }

    public void setMilestoneId(UUID milestoneId) {
        this.milestoneId = milestoneId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public ProgressStatus getStatus() {
        return status;
    }

    public UUID getCreatedBy() {
        return createdBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }

    public void publish() {
        if (this.status == ProgressStatus.PUBLISHED) {
            throw new IllegalArgumentException("Progress update already published");
        }
        this.status = ProgressStatus.PUBLISHED;
        this.publishedAt = Instant.now();
    }
}
