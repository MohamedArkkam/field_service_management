package com.sitedirect.api.projects;

import com.sitedirect.api.common.Role;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "project_assignments")
public class ProjectAssignment {

    @Id
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "assignment_role", nullable = false, length = 32)
    private Role assignmentRole;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected ProjectAssignment() {
    }

    public ProjectAssignment(UUID id, UUID projectId, UUID userId, Role assignmentRole) {
        this.id = id;
        this.projectId = projectId;
        this.userId = userId;
        this.assignmentRole = assignmentRole;
    }

    public UUID getId() {
        return id;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public UUID getUserId() {
        return userId;
    }

    public Role getAssignmentRole() {
        return assignmentRole;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
