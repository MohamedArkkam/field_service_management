package com.sitedirect.api.repo;

import com.sitedirect.api.domain.ProgressStatus;
import com.sitedirect.api.domain.ProgressUpdate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgressUpdateRepository extends JpaRepository<ProgressUpdate, UUID> {
    List<ProgressUpdate> findByProjectIdOrderByCreatedAtDesc(UUID projectId);

    List<ProgressUpdate> findByProjectIdAndStatusOrderByPublishedAtDesc(
            UUID projectId, ProgressStatus status);
}
