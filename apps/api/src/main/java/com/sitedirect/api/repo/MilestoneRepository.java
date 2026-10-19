package com.sitedirect.api.repo;

import com.sitedirect.api.domain.Milestone;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MilestoneRepository extends JpaRepository<Milestone, UUID> {
    List<Milestone> findByProjectIdOrderBySortOrderAscCreatedAtAsc(UUID projectId);
}
