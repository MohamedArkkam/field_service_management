package com.sitedirect.api.projects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String location;

    @Column(name = "client_display_name")
    private String clientDisplayName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Priority priority = Priority.MEDIUM;

    @Column(name = "project_value", precision = 14, scale = 2)
    private BigDecimal projectValue;

    @Column(name = "strategic_note")
    private String strategicNote;

    @Column(name = "progress_token", nullable = false, unique = true, length = 64)
    private String progressToken;

    @Column(nullable = false)
    private boolean archived = false;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected Project() {
    }

    public Project(UUID id, String name, String progressToken) {
        this.id = id;
        this.name = name;
        this.progressToken = progressToken;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getClientDisplayName() {
        return clientDisplayName;
    }

    public void setClientDisplayName(String clientDisplayName) {
        this.clientDisplayName = clientDisplayName;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public BigDecimal getProjectValue() {
        return projectValue;
    }

    public void setProjectValue(BigDecimal projectValue) {
        this.projectValue = projectValue;
    }

    public String getStrategicNote() {
        return strategicNote;
    }

    public void setStrategicNote(String strategicNote) {
        this.strategicNote = strategicNote;
    }

    public String getProgressToken() {
        return progressToken;
    }

    public void rotateProgressToken(String newToken) {
        if (newToken == null || newToken.isBlank()) {
            throw new IllegalArgumentException("progressToken is required");
        }
        this.progressToken = newToken;
        touch();
    }

    public boolean isArchived() {
        return archived;
    }

    public void archive() {
        this.archived = true;
        touch();
    }

    public void unarchive() {
        this.archived = false;
        touch();
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void touch() {
        this.updatedAt = Instant.now();
    }
}
