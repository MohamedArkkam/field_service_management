package com.sitedirect.api.progress;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class ProgressDtos {

    private ProgressDtos() {
    }

    public record CreateProgressRequest(
            @NotBlank @Size(max = 255) String title,
            @Size(max = 4000) String note,
            @Size(max = 1000) String photoUrl,
            UUID milestoneId) {
    }

    public record ProgressUpdateResponse(
            UUID id,
            UUID projectId,
            UUID milestoneId,
            String milestoneName,
            String title,
            String note,
            String photoUrl,
            ProgressStatus status,
            Instant createdAt,
            Instant publishedAt) {
    }

    public record SiteProjectSummary(
            UUID id, String name, String location, String clientDisplayName, String progressPath) {
    }

    public record ClientProgressResponse(
            String projectName,
            String clientDisplayName,
            String location,
            List<ClientProgressItem> updates) {
    }

    public record ClientProgressItem(
            UUID id,
            String title,
            String note,
            String photoUrl,
            String milestoneName,
            Instant publishedAt) {
    }
}
