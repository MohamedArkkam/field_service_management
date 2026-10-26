package com.sitedirect.api.progress;

import com.sitedirect.api.progress.ProgressStatus;
import com.sitedirect.api.progress.ProgressUpdate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgressUpdateRepository extends JpaRepository<ProgressUpdate, UUID> {
    List<ProgressUpdate> findByProjectIdOrderByCreatedAtDesc(UUID projectId);

    List<ProgressUpdate> findByProjectIdAndStatusOrderByPublishedAtDesc(
            UUID projectId, ProgressStatus status);

    List<ProgressUpdate> findByStatus(ProgressStatus status);
}
