package com.sitedirect.api.web.dto;

import com.sitedirect.api.domain.Priority;
import com.sitedirect.api.domain.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class ProjectDtos {

    private ProjectDtos() {
    }

    public record CreateProjectRequest(
            @NotBlank @Size(max = 255) String name,
            @Size(max = 500) String location,
            @Size(max = 255) String clientDisplayName,
            Priority priority,
            BigDecimal projectValue,
            String strategicNote) {
    }

    public record UpdateProjectRequest(
            @NotBlank @Size(max = 255) String name,
            @Size(max = 500) String location,
            @Size(max = 255) String clientDisplayName,
            @NotNull Priority priority,
            BigDecimal projectValue,
            String strategicNote) {
    }

    public record MilestoneRequest(
            @Size(max = 255) String phaseName,
            @NotBlank @Size(max = 255) String name,
            Integer sortOrder) {
    }

    public record MilestoneResponse(
            UUID id, UUID projectId, String phaseName, String name, int sortOrder, Instant createdAt) {
    }

    public record AssignmentRequest(@NotNull UUID userId, @NotNull Role assignmentRole) {
    }

    public record AssignmentResponse(
            UUID id, UUID projectId, UUID userId, String userEmail, String userFullName, Role assignmentRole) {
    }

    public record ProgressLinkResponse(String token, String path, String absoluteHint) {
    }

    public record ProjectResponse(
            UUID id,
            String name,
            String location,
            String clientDisplayName,
            Priority priority,
            BigDecimal projectValue,
            String strategicNote,
            String progressToken,
            String progressPath,
            boolean archived,
            Instant createdAt,
            Instant updatedAt,
            List<MilestoneResponse> milestones,
            List<AssignmentResponse> assignments) {
    }

    /**
     * Portfolio row. Completion is derived (not a stored %): milestones with ≥1 PUBLISHED
     * progress vs total milestones, plus published-update counts for honest empty cases.
     */
    public record ProjectSummaryResponse(
            UUID id,
            String name,
            String location,
            Priority priority,
            BigDecimal projectValue,
            String progressPath,
            boolean archived,
            Instant updatedAt,
            int milestoneCount,
            int milestonesWithPublishedProof,
            int publishedUpdateCount,
            Instant lastPublishedAt) {
    }
}
